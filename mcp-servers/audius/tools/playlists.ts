/**
 * Audius Playlist Tools
 *
 * MCP tools for interacting with Audius playlists.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getAudiusClient } from "../../../lib/audius.js";

/**
 * Register all playlist-related tools with the MCP server.
 */
export function registerPlaylistTools(server: McpServer): void {
  // Search Playlists
  server.tool(
    "search_playlists",
    {
      query: z.string().describe("Search query for playlists"),
      limit: z.number().optional().describe("Maximum number of results (default: 10)"),
    },
    async ({ query, limit = 10 }) => {
      try {
        const client = await getAudiusClient();
        const result = await client.playlists.searchPlaylists({ query });
        const playlists = (result.data || []).slice(0, limit);

        const formatted = playlists.map((playlist: any, i: number) => ({
          rank: i + 1,
          name: playlist.playlistName,
          creator: playlist.user?.name || "Unknown",
          trackCount: playlist.trackCount || 0,
          totalPlayCount: playlist.totalPlayCount || 0,
          favoriteCount: playlist.favoriteCount || 0,
          repostCount: playlist.repostCount || 0,
          id: playlist.id,
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
              text: `Error searching playlists: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Get Trending Playlists
  server.tool(
    "get_trending_playlists",
    {
      time: z
        .enum(["week", "month", "year", "allTime"])
        .optional()
        .describe("Time period for trending (default: week)"),
      limit: z.number().optional().describe("Maximum number of results (default: 10)"),
    },
    async ({ time = "week", limit = 10 }) => {
      try {
        const client = await getAudiusClient();
        const result = await client.playlists.getTrendingPlaylists({ time });
        const playlists = (result.data || []).slice(0, limit);

        const formatted = playlists.map((playlist: any, i: number) => ({
          rank: i + 1,
          name: playlist.playlistName,
          creator: playlist.user?.name || "Unknown",
          trackCount: playlist.trackCount || 0,
          totalPlayCount: playlist.totalPlayCount || 0,
          favoriteCount: playlist.favoriteCount || 0,
          id: playlist.id,
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
              text: `Error getting trending playlists: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Get Playlist Details
  server.tool(
    "get_playlist",
    {
      playlistId: z.string().describe("The Audius playlist ID"),
    },
    async ({ playlistId }) => {
      try {
        const client = await getAudiusClient();
        const result = await client.playlists.getPlaylist({ playlistId });
        const playlistData = result.data;
        // getPlaylist returns an array, get the first element
        const playlist = Array.isArray(playlistData) ? playlistData[0] : playlistData;

        if (!playlist) {
          return {
            content: [
              {
                type: "text",
                text: `Playlist not found: ${playlistId}`,
              },
            ],
            isError: true,
          };
        }

        const formatted = {
          name: playlist.playlistName,
          creator: playlist.user?.name || "Unknown",
          creatorHandle: playlist.user?.handle || "unknown",
          description: playlist.description || "",
          trackCount: playlist.trackCount || 0,
          totalPlayCount: playlist.totalPlayCount || 0,
          favoriteCount: playlist.favoriteCount || 0,
          repostCount: playlist.repostCount || 0,
          isAlbum: playlist.isAlbum || false,
          id: playlist.id,
          permalink: playlist.permalink,
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
              text: `Error getting playlist: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Get Playlist Tracks
  server.tool(
    "get_playlist_tracks",
    {
      playlistId: z.string().describe("The Audius playlist ID"),
      limit: z.number().optional().describe("Maximum number of results (default: 20)"),
    },
    async ({ playlistId, limit = 20 }) => {
      try {
        const client = await getAudiusClient();
        const result = await client.playlists.getPlaylistTracks({ playlistId });
        const tracks = (result.data || []).slice(0, limit);

        const formatted = tracks.map((track: any, i: number) => ({
          position: i + 1,
          title: track.title,
          artist: track.user?.name || "Unknown",
          playCount: track.play_count || 0,
          favoriteCount: track.favorite_count || 0,
          duration: track.duration || 0,
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
              text: `Error getting playlist tracks: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
