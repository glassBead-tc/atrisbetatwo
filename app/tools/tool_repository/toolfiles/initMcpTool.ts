import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { MCPService } from "../../../../services/mcpService";

export const initMcpTool = tool(
    async (): Promise<{ initialized: boolean }> => {
        try {
            // Get the MCPService instance (it's a singleton)
            const mcpService = MCPService.getInstance();
            if (!mcpService) {
                throw new Error("MCP Service not initialized");
            }
            // Return initialized flag
            return { initialized: true };
        } catch (error) {
            console.error("MCP initialization failed:", error);
            throw error;
        }
    },
    {
        name: "init_mcp",
        description: "Initializes the Model Context Protocol service",
        schema: z.object({})
    }
);