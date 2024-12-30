import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getAudiusSdk } from "../../../../services/audius_chat/audiusSdk";

export const initSdkTool = tool(
  async (): Promise<{ initialized: boolean }> => {
    try {
      const sdk = await getAudiusSdk();
      if (!sdk) {
        throw new Error('Failed to initialize Audius SDK');
      }
      return { initialized: true };
    } catch (error) {
      console.error('Error initializing SDK:', error);
      return { initialized: false };
    }
  },
  {
    name: "init_sdk",
    description: "Initializes the Audius SDK",
    schema: z.object({})
  }
);
