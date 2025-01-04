import { BaseMessage } from "@langchain/core/messages";
import { Annotation, StateGraph, START, END } from "@langchain/langgraph";
import { initSdkTool, extractCategoryTool } from "../app/tools/tool_repository/tools.js";
import { ChatOpenAI } from "@langchain/openai";
import { QueryType, EntityType } from "../types/types.js";

type GradingType = {
    quality: number;
    needsRewrite: boolean;
};

const GraphAnnotation = Annotation.Root({
  // Define a 'messages' channel to store an array of BaseMessage objects
  messages: Annotation<BaseMessage[]>({
    // Reducer function: Combines the current state with new messages
    reducer: (currentState, updateValue) => currentState.concat(updateValue),
    // Default function: Initialize the channel with an empty array
    default: () => [],
  }),
  /** Current user query being processed */
  query: Annotation<string>({
    // Reducer function: Updates the current state with new value
    reducer: (currentState, updateValue) => currentState !== updateValue ? updateValue : currentState,
    // Default function: Initialize the channel with an empty string
    default: () => '',
  }),
  queryType: Annotation<QueryType>({
    // Reducer function: Updates the current state with new value
    reducer: (currentState, updateValue) => currentState !== updateValue ? updateValue : currentState,
    // Default function: Initialize the channel with null
    default: () => null,
  }),
  /** API endpoint chosen by the router to answer the user's entity query */
  selectedApi: Annotation<string>({
    reducer: (currentState, updateValue) => currentState !== updateValue ? updateValue : currentState,
    // Default function: Initialize the channel with an empty string
    default: () => '',
  }),
  /** Quality assessment of current results */
  grading: Annotation<GradingType[]>({
    // Reducer function: Combines the current state with new grading results
    reducer: (currentState, updateValue) => currentState !== updateValue ? updateValue : currentState,
    // Default function: Initialize the channel with an empty array
    default: () => [],
  }),
  response: Annotation<string>({
    reducer: (currentState, updateValue) => currentState !== updateValue ? updateValue : currentState,
    // Default function: Initialize the channel with an empty string
    default: () => '',
  }),
  categories: Annotation<string[]>({
    // Reducer function: Combines the current state with new categories
    reducer: (currentState, updateValue) => currentState !== updateValue ? updateValue : currentState,
    // Default function: Initialize the channel with an empty array
    default: () => [],
  }),
  entityType: Annotation<EntityType>({
    // Reducer function: Updates the entity type if it's different from the current state
    reducer: (currentState, updateValue) => currentState !== updateValue ? updateValue : currentState,
    // Default function: Initialize the channel with null
    default: () => null,
  })
});

const graph = new StateGraph(GraphAnnotation)
.addNode("init_sdk_node", async (state: typeof GraphAnnotation) => {
  try {
    const result = await initSdkTool.invoke({});
    return result;
  } catch (error) {
    console.error("Error in init_sdk_node:", error);
    throw error;
  }
})
.addNode("extract_category_node", async (state: typeof GraphAnnotation) => {
  try {
    const currentQuery = state.State.query;
    if (!currentQuery) {
      throw new Error("Extract category received null query");
    }
    
    const result = await extractCategoryTool.invoke({
      query: currentQuery
    });
    
    if (!result.queryType || !result.categories) {
      throw new Error("Extract category produced invalid state");
    }
    
    return result;
  } catch (error) {
    console.error("Error in extract_category_node:", error);
    throw error;
  }
})
    .addEdge(START, "init_sdk_node")
    .addEdge("init_sdk_node", "extract_category_node")
    .addEdge("extract_category_node", END)
    .compile();

/**
  * Processes each query through the graph.
  *
  * @param {string[]} queries - The user's queries.
*/
export async function main(queries: string[]) {
    console.log("\n=== Atris ===");
  
    for (const query of queries) {
      console.log(`\nQ: "${query}"`);
  
      try {
        const app = graph;
        const stream = await app.stream({
          query,
          llm: new ChatOpenAI({
            modelName: 'gpt-4o-mini',
            temperature: 0.1,
          }),
          initialized: false
        });
  
        let gotResponse = false;
  
        for await (const output of stream) {
          if (output !== END && output.formattedResponse) {
            console.log(`\nA:\n${output.formattedResponse}\n`);
            gotResponse = true;
          }
        }
  
        if (!gotResponse) {
          console.log("\nA: Sorry, I couldn't get that information right now.\n");
        }
  
      } catch (error) {
        console.log("\nA: Sorry, I encountered an error processing your request.\n");
      }
    }
  }
  
  if (process.env.NODE_ENV !== 'test') {
    const testQueries = [
      "What are the top 10 trending tracks on Audius?",
      "What is the Audius protocol?"
      // "What are the most popular playlists right now?",
      // "Who are the trending artists this week?",
      // "What genres are most popular on Audius?",
      // "Show me the top hip-hop tracks"
    ];
    
    console.log("\n=== Starting Atris Backend ===");
    console.log("Test queries:", testQueries);
    
    main(testQueries).catch(error => {
      console.error("Error in main:", error);
      process.exit(1);
    });
  }