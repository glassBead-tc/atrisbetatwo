/**
 * Audius MCP Server
 *
 * Model Context Protocol server exposing Audius platform data and operations.
 * This server provides tools, resources, and prompts for AI agents to interact
 * with the Audius music platform.
 *
 * Usage:
 *   npx ts-node mcp-servers/audius/index.ts
 *
 * Or via stdio transport with an MCP client.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Import tools
import { registerTrackTools } from "./tools/tracks.js";
import { registerUserTools } from "./tools/users.js";
import { registerPlaylistTools } from "./tools/playlists.js";

// Import resources
import { registerResources } from "./resources/index.js";

// Import prompts
import { registerPrompts } from "./prompts/index.js";

// Server metadata
const SERVER_NAME = "audius-mcp";
const SERVER_VERSION = "1.0.0";

/**
 * Create and configure the Audius MCP server.
 */
export function createAudiusServer(): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // Register all tools
  registerTrackTools(server);
  registerUserTools(server);
  registerPlaylistTools(server);

  // Register resources
  registerResources(server);

  // Register prompts
  registerPrompts(server);

  return server;
}

/**
 * Main entry point - start the server with stdio transport.
 */
async function main(): Promise<void> {
  const server = createAudiusServer();
  const transport = new StdioServerTransport();

  // Log to stderr (stdout is reserved for MCP messages)
  console.error(`Starting ${SERVER_NAME} v${SERVER_VERSION}...`);

  await server.connect(transport);

  console.error(`${SERVER_NAME} is running on stdio transport`);
}

// Run if executed directly
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

export { SERVER_NAME, SERVER_VERSION };
