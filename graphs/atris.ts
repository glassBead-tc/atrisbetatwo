import { StateGraph, RunnableSequence } from "@langchain/langgraph";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { MinimalAudiusSDK } from "../services/audius_chat/audiusSdk";
import { analyzeQuery } from "../app/tools/tool_repository/utils/queryAnalysis";
import { parseQuery } from "../app/tools/tool_repository/utils/searchUtils";
import { createClient } from "@supabase/supabase-js/dist/module";
import { z } from "zod";

import dotenv from "dotenv";
dotenv.config();
const supabaseUrl = !process.env.SUPABASE_URL;
const supabasePrivateKey = !process.env.SUPABASE_PRIVATE_KEY;
const openAIKey = !process.env.OPENAI_API_KEY;


// State and Type Definitions
interface AgentState {
  query: string;
  steps: Array<{
    action: string;
    result: string;
  }>;
  response?: string;
  context?: string[];
  docGrade?: {
    relevance: number;
    needsWebSearch: boolean;
    reasoning: string;
  };
  skipHallucination?: boolean;
}

const routerSchema = z.object({
  type: z.enum(["api", "docs", "both"])
});

const docGradeSchema = z.object({
  relevance: z.number().min(0).max(1),
  needsWebSearch: z.boolean(),
  reasoning: z.string()
});

// Helper function for safe JSON parsing
function parseJSON<T>(
  json: string, 
  schema: z.ZodType<T>
): T | null {
  try {
    const parsed = JSON.parse(json);
    const result = schema.safeParse(parsed);
    if (result.success) {
      return result.data;
    }
    return null;
  } catch {
    return null;
  }
}

// Node creation factory
const createNodes = async (
  sdk: MinimalAudiusSDK,
  vectorStore: SupabaseVectorStore,
  llm: ChatOpenAI
) => {
  // Router node
  const routerNode = async (state: AgentState) => {
    const routerPrompt = ChatPromptTemplate.fromTemplate(`
      Determine if this query requires API access, documentation lookup, or both.
      Query: {query}
      Output as JSON: {"type": "api"|"docs"|"both"}
    `);
    
    const messages = await routerPrompt.formatMessages({
      query: state.query
    });
    const response = await llm.invoke(messages);

    // Convert the response content to string if it's not already
    const contentString = typeof response.content === 'string' 
      ? response.content 
      : response.content.map(c => {
          if (typeof c === 'string') return c;
          if ('text' in c) return c.text;
          return '';  // Skip non-text content
        }).join('');

    const decision = parseJSON(contentString, routerSchema);
    if (!decision) {
      throw new Error("Invalid router response format");
    }
    
    return {
      steps: [...(state.steps ?? []), {
        action: "route",
        result: decision.type
      }]
    };
  };

  // API query node
  const apiNode = async (state: AgentState) => {
    // Analyze the query to determine type and entity
    const analysis = analyzeQuery(state.query);
    const parsedQuery = parseQuery(state.query);
    
    let result;
    
    // Handle based on query analysis
    if (analysis.isTrendingQuery) {
      // Handle trending queries
      if (analysis.entityType === 'track') {
        result = await sdk.tracks.getTrendingTracks({ limit: parsedQuery.limit || 10 });
      } else if (analysis.entityType === 'playlist') {
        result = await sdk.playlists.getTrendingPlaylists({ limit: parsedQuery.limit || 10 });
      }
    } else {
      // Handle search queries based on entity type
      switch (analysis.entityType) {
        case 'track':
          result = await sdk.tracks.searchTracks(state.query);
          break;
        case 'user':
          result = await sdk.users.searchUsers(state.query);
          break;
        case 'playlist':
          result = await sdk.playlists.searchPlaylists(state.query);
          break;
        default:
          // Default to track search if entity type is unclear
          result = await sdk.tracks.searchTracks(state.query);
      }
    }

    return {
      steps: [...(state.steps ?? []), {
        action: "api_query",
        result: JSON.stringify(result)
      }]
    };
  };

  // RAG query node
  const ragNode = async (state: AgentState) => {
    const docs = await vectorStore.similaritySearch(
      state.query,
      3
    );
    return {
      context: docs.map(d => d.pageContent),
      steps: [...(state.steps ?? []), {
        action: "rag_query",
        result: JSON.stringify(docs.map(d => d.pageContent))
      }]
    };
  };

  // Document grading node
  const docGradeNode = async (state: AgentState) => {
    const gradePrompt = ChatPromptTemplate.fromTemplate(`
      Grade the relevance of these documents for the query.
      Query: {query}
      Documents: {docs}
      Output JSON format: {
        "relevance": number 0-1,
        "needsWebSearch": boolean,
        "reasoning": string
      }
    `);

    const messages = await gradePrompt.formatMessages({
      query: state.query,
      docs: state.context?.join("\n") ?? ""
    });
    const response = await llm.invoke(messages);

    // Convert the response content to string if it's not already
    const contentString = typeof response.content === 'string' 
      ? response.content 
      : response.content.map(c => {
          if (typeof c === 'string') return c;
          if ('text' in c) return c.text;
          return '';  // Skip non-text content
        }).join('');

    const grading = parseJSON(contentString, docGradeSchema);
    if (!grading) {
      throw new Error("Invalid grading format");
    }

    return {
      docGrade: grading,
      skipHallucination: grading.relevance < 0.3
    };
  };

  // Web search node
  const webSearchNode = async (state: AgentState) => {
    // Web search implementation would go here
    // For now we'll return a placeholder
    return {
      steps: [...(state.steps ?? []), {
        action: "web_search",
        result: "Web search results would go here"
      }]
    };
  };

  // Format node
  const formatNode = async (state: AgentState) => {
    const formatPrompt = ChatPromptTemplate.fromTemplate(`
      Generate a natural response using all available information.
      Query: {query}
      Context: {context}
      
      Response Guidelines:
      1. If API data is available, prioritize it for current/real-time information
      2. Use documentation to provide additional context and explanation
      3. If sources conflict, explain the discrepancy
      4. Cite the source of information (API vs docs vs web) when relevant
      5. Be direct and concise in your response
      
      Response:
    `);

    // Collect all available results
    let contextSections: string[] = [];
    
    // Get API results (if any)
    const apiStep = state.steps.find(s => s.action === "api_query");
    if (apiStep) {
      contextSections.push(`API Response:\n${apiStep.result}`);
    }

    // Get doc context (if any)
    if (state.docGrade?.relevance && state.docGrade.relevance > 0.3) {
      contextSections.push(
        `Documentation Context:\n${state.context?.join("\n")}`
      );
    }

    // Get web results (if any)
    const webStep = state.steps.find(s => s.action === "web_search");
    if (webStep) {
      contextSections.push(`Web Search Results:\n${webStep.result}`);
    }

    // If no context available, note that
    if (contextSections.length === 0) {
      contextSections.push(
        "No data available from API, documentation, or web search."
      );
    }

    const messages = await formatPrompt.formatMessages({
      query: state.query,
      context: contextSections.join("\n\n")
    });
    const response = await llm.invoke(messages);

    // Convert the response content to string if it's not already
    const contentString = typeof response.content === 'string' 
      ? response.content 
      : response.content.map(c => {
          if (typeof c === 'string') return c;
          if ('text' in c) return c.text;
          return '';  // Skip non-text content
        }).join('');

    return {
      response: contentString,
      steps: [...state.steps, {
        action: "format",
        result: contentString
      }]
    };
  };

  return {
    routerNode,
    apiNode,
    ragNode,
    docGradeNode,
    webSearchNode,
    formatNode
  };
};

// Main graph creation function
export const createAtrisGraph = async (config: {
  supabaseUrl: string;
  supabaseKey: string;
  openAIKey: string;
  audiusApiKey: string;
  model?: string;
  temperature?: number;
}) => {
  // Initialize services
  const sdk = new MinimalAudiusSDK(config.audiusApiKey);
  
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: config.openAIKey
  });

  const vectorStore = await SupabaseVectorStore.fromExistingIndex(
    embeddings,
    {
      client: createClient(config.supabaseUrl, config.supabaseKey),
      tableName: "documents",
      queryName: "match_documents"
    }
  );

  const llm = new ChatOpenAI({
    modelName: config.model ?? "gpt-4-1106-preview",
    temperature: config.temperature ?? 0,
    streaming: true
  });

  // Create nodes
  const nodes = await createNodes(sdk, vectorStore, llm);

  // Create graph
  const workflow = new StateGraph({
    channels: {
      query: RunnableSequence.from([]),
      steps: RunnableSequence.from([]),
      action: RunnableSequence.from([]),
      result: RunnableSequence.from([]),
      response: RunnableSequence.from([]),
      context: RunnableSequence.from([]),
      docGrade: RunnableSequence.from([]),
      skipHallucination: RunnableSequence.from([])
    }
  });

  // Add nodes
  workflow.addNode("__start__", nodes.routerNode);
  workflow.addNode("api", nodes.apiNode);
  workflow.addNode("rag", nodes.ragNode);
  workflow.addNode("docGrade", nodes.docGradeNode);
  workflow.addNode("webSearch", nodes.webSearchNode);
  workflow.addNode("format", nodes.formatNode);

  // Add conditional edges based on router decision
  workflow.addConditionalEdges(
    "__start__",
    (state) => {
      const lastStep = state.steps[state.steps.length - 1];
      if (lastStep?.action === "route") {
        switch(lastStep.result) {
          case "api": return ["api"];
          case "docs": return ["rag"];
          case "both": return ["api", "rag"];
          default: return ["rag"];
        }
      }
      return ["rag"];
    }
  );

  // Add edges for the rest of the workflow
  workflow.addEdge("api", "__start__");
  workflow.addEdge("rag", "docGrade");
  workflow.addEdge("docGrade", "__start__");
  workflow.addEdge("webSearch", "__start__");

  // Set entry/end points
  workflow.setEntryPoint("__start__");
  workflow.setFinishPoint("format");

  // Return compiled graph
  return workflow.compile();
};