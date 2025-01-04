// import { tool } from "@langchain/langgraph";
// import { z } from "zod";
// import { MCPService } from "../../services/mcpService";

// export const buildDocsTool = tool(
//   async (): Promise<{ success: boolean; totalDocs: number }> => {
//     try {
//       const mcpService = MCPService.getInstance();
//       await mcpService.buildCorpus();
      
//       const corpus = mcpService.getCorpus();
//       return {
//         success: true,
//         totalDocs: corpus.documentation.metadata.totalDocs
//       };
//     } catch (error) {
//       console.error("Documentation corpus build failed:", error);
//       throw error;
//     }
//   },
//   {
//     name: "build_docs",
//     description: "Builds the documentation corpus by processing MDX files and updating audius_corpus.json",
//     schema: z.object({})
//   }
// );
