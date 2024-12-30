import { tool } from "@langchain/langgraph";

export const initSdkTool = tool(
    async (): Promise<{ initialized: boolean }> => {
      try {
        const sdk = await getAudiusSdk();
        if (!sdk) {
          throw new Error("SDK not initialized");
        }
        // Only return initialized flag - the SDK is managed by sdkClient.ts
        return { initialized: true };
      } catch (error) {
        console.error("SDK initialization failed:", error);
        throw error;
      }
    },
    {
      name: "init_sdk",
      description: "Initializes and returns the Audius SDK instance",
      schema: z.object({})
    }
  );