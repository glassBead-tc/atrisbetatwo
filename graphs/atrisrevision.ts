/**
 * Atris Graph Implementation
 *
 * This is the main LangGraph workflow for the Atris agent.
 * Phase 1: Basic query classification and SDK initialization.
 * Future phases will add: API execution, RAG, response formatting.
 */

import { StateGraph, START, END } from "@langchain/langgraph";
import { initSdkTool, extractCategoryTool } from "../app/tools/tool_repository/tools.js";
import { AtrisAnnotation, type AtrisState } from "../types/state.js";

// ============== Node Definitions ==============

/**
 * Initialize the Audius SDK client.
 * This must run before any API calls can be made.
 */
async function initSdkNode(state: AtrisState): Promise<Partial<AtrisState>> {
  try {
    const result = await initSdkTool.invoke({});
    console.log("SDK initialized:", result.initialized);
    return {};
  } catch (error) {
    console.error("Error in init_sdk_node:", error);
    return {
      error: {
        code: "SDK_INIT_ERROR",
        message: error instanceof Error ? error.message : "Failed to initialize SDK",
        node: "init_sdk_node",
        timestamp: Date.now(),
        recoverable: true,
      },
    };
  }
}

/**
 * Extract category and classify the user's query.
 * Determines query type, entity type, and relevant categories.
 */
async function extractCategoryNode(state: AtrisState): Promise<Partial<AtrisState>> {
  try {
    const query = state.query;

    if (!query) {
      throw new Error("No query provided");
    }

    const result = await extractCategoryTool.invoke({ query });

    return {
      queryType: result.queryType as AtrisState["queryType"],
      entityType: result.entityType as AtrisState["entityType"],
      categories: result.categories,
    };
  } catch (error) {
    console.error("Error in extract_category_node:", error);
    return {
      error: {
        code: "CLASSIFICATION_ERROR",
        message: error instanceof Error ? error.message : "Failed to classify query",
        node: "extract_category_node",
        timestamp: Date.now(),
        recoverable: false,
      },
    };
  }
}

// ============== Graph Construction ==============

/**
 * Build and compile the Atris workflow graph.
 */
function buildGraph() {
  const workflow = new StateGraph(AtrisAnnotation)
    .addNode("init_sdk", initSdkNode)
    .addNode("extract_category", extractCategoryNode)
    .addEdge(START, "init_sdk")
    .addEdge("init_sdk", "extract_category")
    .addEdge("extract_category", END);

  return workflow.compile();
}

// Export the compiled graph
export const graph = buildGraph();

// Export node functions for testing
export { initSdkNode, extractCategoryNode };

// ============== Main Function ==============

/**
 * Process queries through the graph.
 * Used for testing and CLI execution.
 */
export async function processQuery(query: string): Promise<AtrisState | null> {
  try {
    const result = await graph.invoke({
      query,
      messages: [],
    });

    return result;
  } catch (error) {
    console.error("Error processing query:", error);
    return null;
  }
}

/**
 * Process multiple queries (for batch testing).
 */
export async function main(queries: string[]): Promise<void> {
  console.log("\n=== Atris ===");

  for (const query of queries) {
    console.log(`\nQ: "${query}"`);

    const result = await processQuery(query);

    if (result?.formattedResponse) {
      console.log(`\nA:\n${result.formattedResponse}\n`);
    } else if (result?.error) {
      console.log(`\nError: ${result.error.message}\n`);
    } else {
      console.log("\nA: Sorry, I couldn't process that request.\n");
    }
  }
}

// CLI execution (only when run directly, not when imported)
if (typeof require !== "undefined" && require.main === module) {
  const testQueries = [
    "What are the top 10 trending tracks on Audius?",
    "What is the Audius protocol?",
  ];

  console.log("\n=== Starting Atris Backend ===");
  console.log("Test queries:", testQueries);

  main(testQueries).catch((error) => {
    console.error("Error in main:", error);
    process.exit(1);
  });
}
