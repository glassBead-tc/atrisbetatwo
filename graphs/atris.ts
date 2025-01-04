// /**
//  * Atris Graph Implementation
//  * 
//  * This file implements a state-based graph system for processing queries through multiple stages
//  * including API calls, RAG (Retrieval Augmented Generation), and response formatting.
//  */

// // External dependencies for graph processing, AI models, and data storage
// import { StateGraph, type StateGraphArgs } from "@langchain/langgraph";
// import { ChatPromptTemplate } from "@langchain/core/prompts";
// import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
// import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
// import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
// import { type Runnable, RunnableSequence } from "@langchain/core/runnables";
// import { Operation } from "@langchain/core/utils/types";
// import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
// import { MinimalAudiusSDK } from "../services/audius_chat/audiusSdk";
// import { createClient } from "@supabase/supabase-js";
// import { z } from "zod";

// /**
//  * Type helper for annotating state properties that can be operated on
//  * Used to mark fields that support specific operations like push
//  */
// type Annotated<T, O extends Operation> = T;

// /**
//  * Core state interface that maintains the graph's state throughout processing
//  */
// interface AtrisState {
//   /** Collection of messages in the conversation */
//   messages: BaseMessage[];
  
//   /** Current user query being processed */
//   query: string;
  
//   /** Collection of API results from various endpoints */
//   apiResults: Annotated<Array<{
//     endpoint: string;
//     result: unknown;
//   }>, typeof Operation.push>;
  
//   /** Quality assessment of current results */
//   grading?: {
//     quality: number;    // Score between 0-1
//     needsRewrite: boolean;  // Whether response needs improvement
//   };

//   /** Contextual information gathered from various sources */
//   context: Annotated<string[], typeof Operation.push>;
// }

// /**
//  * Schema for validating grading results
//  * Ensures quality scores are within bounds and needsRewrite is boolean
//  */
// const gradingSchema = z.object({
//   quality: z.number().min(0).max(1),
//   needsRewrite: z.boolean()
// });

// /**
//  * Safely parses JSON with schema validation
//  * @param json - JSON string to parse
//  * @param schema - Zod schema for validation
//  * @returns Parsed and validated object or null if invalid
//  */
// function parseJSON<T>(
//   json: string, 
//   schema: z.ZodType<T>
// ): T | null {
//   try {
//     const parsed = JSON.parse(json);
//     const result = schema.safeParse(parsed);
//     if (result.success) {
//       return result.data;
//     }
//     return null;
//   } catch {
//     return null;
//   }
// }

// /**
//  * Prompt template for grading response quality
//  * Evaluates API results against the original query
//  */
// const gradePrompt = ChatPromptTemplate.fromTemplate(`
//   Grade the quality and relevance of these results for the query.
//   Query: {query}
//   Available Results:
//   {results}
  
//   Output as JSON:
//   {
//     "quality": number between 0-1,
//     "needsRewrite": boolean
//   }
// `);

// /**
//  * Prompt template for web search query formulation
//  * Generates focused search queries based on context
//  */
// const webSearchPrompt = ChatPromptTemplate.fromTemplate(`
//   Based on the query and available context, formulate a web search query.
//   Original Query: {query}
//   Context: {context}
  
//   Output only the search query, nothing else.
// `);

// /**
//  * Prompt template for final response formatting
//  * Combines all available information into a coherent response
//  */
// const formatPrompt = ChatPromptTemplate.fromTemplate(`
//   Generate a natural response to this query using all available information.
//   Query: {query}
//   Available Context:
//   {context}

//   Guidelines:
//   1. If API data is available, prioritize it for current/real-time information
//   2. Use documentation to provide additional context and explanation
//   3. If sources conflict, explain the discrepancy
//   4. Cite the source of information (API vs docs vs web) when relevant
//   5. Be direct and concise
// `);

// // Node Factories
// /**
//  * Creates a node for handling API interactions
//  * This node orchestrates the process of:
//  * 1. Extracting categories from the query
//  * 2. Selecting appropriate API endpoints
//  * 3. Making API requests
//  * 4. Formatting the responses
//  */
// const createApiNode = (
//   sdk: MinimalAudiusSDK,
//   model: ChatOpenAI,
//   extractCategoryTool: any,
//   selectApiTool: any,
//   createFetchRequestTool: any,
//   formatResponseTool: any
// ): Runnable<AtrisState> => {
//   const runnable = {
//     invoke: async (state: AtrisState) => {
//       // Extract semantic categories from the user query
//       const categoryResult = await extractCategoryTool.invoke({
//         query: state.query
//       });

//       // Determine which API endpoint best matches the query intent
//       const apiSelection = await selectApiTool.invoke({
//         categories: categoryResult.categories,
//         entityType: categoryResult.entityType,
//         queryType: categoryResult.queryType,
//         needsCustomCalc: categoryResult.needsCustomCalc
//       });

//       // Execute the API request with appropriate parameters
//       const fetchResult = await createFetchRequestTool.invoke({
//         apiName: apiSelection.selectedApi,
//         parameters: apiSelection.parameters
//       });

//       // Transform the raw API response into a more useful format
//       const formattedResult = await formatResponseTool.invoke({
//         response: fetchResult
//       });

//       return {
//         apiResults: [{
//           endpoint: apiSelection.selectedApi,
//           result: formattedResult.formattedResponse
//         }]
//       };
//     }
//   };

//   return runnable;
// };

// /**
//  * Creates a node for Retrieval Augmented Generation (RAG)
//  * This node performs similarity search against a vector store
//  * to find relevant context for the query
//  */
// const createRagNode = (vectorStore: SupabaseVectorStore): Runnable<AtrisState> => {
//   return {
//     invoke: async (state: AtrisState) => {
//       // Perform similarity search to find relevant documents
//       const results = await vectorStore.similaritySearch(state.query);
//       return {
//         context: results.map(doc => doc.pageContent)
//       };
//     }
//   };
// };

// /**
//  * Creates a node for grading response quality
//  * This node evaluates the relevance and quality of API results
//  * and determines if the response needs improvement
//  */
// const createGradeNode = (model: ChatOpenAI): Runnable<AtrisState> => {
//   return {
//     invoke: async (state: AtrisState) => {
//       // Format the grading prompt with current state
//       const formattedPrompt = await gradePrompt.format({
//         query: state.query,
//         results: state.apiResults
//       });
//       const result = await model.invoke(formattedPrompt);

//       // Handle different content types in the response
//       const contentString = typeof result.content === 'string' 
//         ? result.content 
//         : JSON.stringify(result.content);

//       // Parse and validate the grading result
//       const grading = parseJSON(contentString, gradingSchema);
//       if (!grading) {
//         throw new Error("Failed to parse grading result");
//       }

//       return {
//         grading,
//         quality: grading.quality,
//         needsRewrite: grading.needsRewrite
//       };
//     }
//   };
// };

// /**
//  * Creates a node for web search operations
//  * This node performs external web searches to gather
//  * additional context when needed
//  */
// const createWebSearchNode = (model: ChatOpenAI, searchTool: TavilySearchResults): Runnable<AtrisState> => {
//   return {
//     invoke: async (state: AtrisState) => {
//       // Execute web search and collect results
//       const results = await searchTool.invoke(state.query);
//       return {
//         context: results.map((r: { content: string }) => r.content)
//       };
//     }
//   };
// };

// /**
//  * Creates a node for formatting the final response
//  * This node combines all available information (API results, RAG context, web search)
//  * into a coherent natural language response
//  */
// const createFormatNode = (model: ChatOpenAI): Runnable<AtrisState> => {
//   const formatChain = RunnableSequence.from([
//     // Extract relevant state fields for formatting
//     {
//       query: (state: AtrisState) => state.query,
//       apiResults: (state: AtrisState) => state.apiResults,
//       context: (state: AtrisState) => state.context
//     },
//     formatPrompt,
//     model,
//     (response: { content: string }) => ({
//       messages: [
//         new HumanMessage(state.query),
//         new AIMessage({ content: response.content })
//       ]
//     })
//   ]);

//   return formatChain;
// };

// // Routing Logic
// /**
//  * Defines the routing logic for the graph
//  * Determines the next node to execute based on the current state
//  */
// const shouldRunRag = async (state: AtrisState) => {
//   const grading = state.grading;
  
//   // If no grading exists, go to RAG
//   if (!grading) return "rag";
  
//   // If quality is poor, try web search
//   if (grading.quality < 0.3) return "webSearch";
  
//   // Otherwise go to format
//   return "format";
// };

// // Main graph creation
// /**
//  * Main graph factory function
//  * Creates and configures the complete processing graph with all nodes and edges
//  * @param config Configuration object containing API keys and service settings
//  * @returns Compiled graph ready for processing queries
//  */
// export const createAtrisGraph = async (config: {
//   supabaseUrl: string;
//   supabaseKey: string;
//   openAIKey: string;
//   audiusApiKey: string;
//   model?: string;
//   temperature?: number;
//   extractCategoryTool: any;
//   selectApiTool: any;
//   createFetchRequestTool: any;
//   formatResponseTool: any;
// }): Promise<Runnable> => {
//   // Initialize core services and tools
//   const sdk = new MinimalAudiusSDK(config.audiusApiKey);
  
//   // Set up embeddings for vector search
//   const embeddings = new OpenAIEmbeddings({
//     openAIApiKey: config.openAIKey,
//     modelName: "text-embedding-ada-002"
//   });

//   // Initialize vector store for document retrieval
//   const vectorStore = await SupabaseVectorStore.fromExistingIndex(
//     embeddings,
//     {
//       client: createClient(config.supabaseUrl, config.supabaseKey),
//       tableName: "documents",
//       queryName: "match_documents"
//     }
//   );

//   // Configure language model
//   const llm = new ChatOpenAI({
//     modelName: config.model ?? "gpt-4-1106-preview",
//     temperature: config.temperature ?? 0,
//     streaming: true
//   });

//   // Initialize web search tool
//   const tavily = new TavilySearchResults();

//   /**
//    * Define how state updates are handled for each channel
//    * Each channel has:
//    * - value: function to combine previous and next values
//    * - default: function to provide initial value
//    */
//   const channels: StateGraphArgs<AtrisState>["channels"] = {
//     messages: {
//       value: (prev, next) => [...(prev || []), ...next],
//       default: () => []
//     },
//     query: {
//       value: (_, next) => next,
//       default: () => ""
//     },
//     apiResults: {
//       value: (prev, next) => [...(prev || []), ...next],
//       default: () => []
//     },
//     grading: {
//       value: (_, next) => next
//     },
//     context: {
//       value: (prev, next) => [...(prev || []), ...next],
//       default: () => []
//     }
//   };

//   // Create and configure the workflow graph
//   const workflow = new StateGraph<AtrisState>({ channels })
//     // Add processing nodes
//     .addNode("api", createApiNode(sdk, llm, config.extractCategoryTool, config.selectApiTool, config.createFetchRequestTool, config.formatResponseTool))
//     .addNode("rag", createRagNode(vectorStore))
//     .addNode("grade", createGradeNode(llm))
//     .addNode("webSearch", createWebSearchNode(llm, tavily))
//     .addNode("format", createFormatNode(llm))

//     // Configure node connections
//     .addEdge("api", "grade")  // API results always get graded
//     .addConditionalEdges(     // Grade determines next step
//       "grade",
//       shouldRunRag,
//       {
//         rag: "rag",           // Get context from vector store
//         webSearch: "webSearch", // Search web for more info
//         format: "format"      // Format final response
//       }
//     )
//     .addEdge("webSearch", "format")  // Web search results go to formatting
//     .addEdge("rag", "grade");        // RAG results get graded

//   // Compile graph into executable form
//   return workflow.compile();
// };

// /**
//  * Example Usage:
//  * 
//  * const graph = await createAtrisGraph({
//  *   supabaseUrl: process.env.SUPABASE_URL!,
//  *   supabaseKey: process.env.SUPABASE_KEY!,
//  *   openAIKey: process.env.OPENAI_API_KEY!,
//  *   audiusApiKey: process.env.AUDIUS_API_KEY!
//  * });
//  *
//  * // Standard query
//  * const response = await graph.invoke({
//  *   query: "What are the most popular songs on Audius?",
//  *   messages: [],
//  *   apiResults: [],
//  *   context: []
//  * });
//  *
//  * // Streaming
//  * for await (const chunk of graph.stream({
//  *   query: "Tell me about Audius's API rate limits",
//  *   messages: [],
//  *   apiResults: [],
//  *   context: []
//  * })) {
//  *   console.log(chunk);
//  * }
//  */