import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { GraphState } from "../../../../types/types";

export const resetStateTool = tool(
  async (input: Record<string, any>): Promise<Partial<GraphState>> => {
    return {
      query: null,
      complexity: null,
      categories: [],
      entityType: null,
      queryType: null,
      parameters: null,
      response: null,
      formattedResponse: null,
      error: null
    };
  },
  {
    name: "reset_state",
    description: "Resets the graph state to initial values",
    schema: z.record(z.any())
  }
);
