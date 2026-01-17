/**
 * Audius Track Tools
 *
 * MCP tools for interacting with Audius tracks.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getAudiusClient } from "../../../lib/audius.js";

/**
 * Register all track-related tools with the MCP server.
 */
export function registerTrackTools(server: McpServer): void {
  // Search Tracks
  server.tool(
    "search_tracks",
    {
      query: z.string().describe("Search query for tracks"),
      limit: z.number().optional().describe("Maximum number of results (default: 10)"),
    },
    async ({ query, limit = 10 }) => {
      try {
        const client = await getAudiusClient();
        const result = await client.tracks.searchTracks({ query });
        const tracks = (result.data || []).slice(0, limit);

        const formatted = tracks.map((track: any, i: number) => ({
          rank: i + 1,
          title: track.title,
          artist: track.user?.name || "Unknown",
          playCount: track.playCount || 0,
          favoriteCount: track.favoriteCount || 0,
          genre: track.genre || "Unknown",
          duration: track.duration || 0,
          id: track.id,
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(formatted, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error searching tracks: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Get Trending Tracks
  server.tool(
    "get_trending_tracks",
    {
      time: z
        .enum(["week", "month", "year", "allTime"])
        .optional()
        .describe("Time period for trending (default: week)"),
      genre: z.string().optional().describe("Filter by genre"),
      limit: z.number().optional().describe("Maximum number of results (default: 10)"),
    },
    async ({ time = "week", genre, limit = 10 }) => {
      try {
        const client = await getAudiusClient();
        const result = await client.tracks.getTrendingTracks({
          time,
          genre: genre || undefined,
        });
        const tracks = (result.data || []).slice(0, limit);

        const formatted = tracks.map((track: any, i: number) => ({
          rank: i + 1,
          title: track.title,
          artist: track.user?.name || "Unknown",
          playCount: track.playCount || 0,
          favoriteCount: track.favoriteCount || 0,
          genre: track.genre || "Unknown",
          id: track.id,
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(formatted, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting trending tracks: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Get Track Details
  server.tool(
    "get_track",
    {
      trackId: z.string().describe("The Audius track ID"),
    },
    async ({ trackId }) => {
      try {
        const client = await getAudiusClient();
        const result = await client.tracks.getTrack({ trackId });
        const track = result.data;

        if (!track) {
          return {
            content: [
              {
                type: "text",
                text: `Track not found: ${trackId}`,
              },
            ],
            isError: true,
          };
        }

        const formatted = {
          title: track.title,
          artist: track.user?.name || "Unknown",
          artistHandle: track.user?.handle || "unknown",
          description: track.description || "",
          genre: track.genre || "Unknown",
          mood: track.mood || "Unknown",
          playCount: track.playCount || 0,
          favoriteCount: track.favoriteCount || 0,
          repostCount: track.repostCount || 0,
          duration: track.duration || 0,
          releaseDate: track.releaseDate || "",
          tags: track.tags || "",
          id: track.id,
          permalink: track.permalink,
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(formatted, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting track: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Get Track by Genre
  server.tool(
    "get_tracks_by_genre",
    {
      genre: z.string().describe("The genre to search for"),
      limit: z.number().optional().describe("Maximum number of results (default: 10)"),
    },
    async ({ genre, limit = 10 }) => {
      try {
        const client = await getAudiusClient();
        // Use trending with genre filter as there's no direct genre endpoint
        const result = await client.tracks.getTrendingTracks({
          time: "month",
          genre,
        });
        const tracks = (result.data || []).slice(0, limit);

        const formatted = tracks.map((track: any, i: number) => ({
          rank: i + 1,
          title: track.title,
          artist: track.user?.name || "Unknown",
          playCount: track.playCount || 0,
          favoriteCount: track.favoriteCount || 0,
          genre: track.genre || genre,
          id: track.id,
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(formatted, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting tracks by genre: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
