/**
 * Audius User Tools
 *
 * MCP tools for interacting with Audius users/artists.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getAudiusClient } from "../../../lib/audius.js";

/**
 * Register all user-related tools with the MCP server.
 */
export function registerUserTools(server: McpServer): void {
  // Search Users
  server.tool(
    "search_users",
    {
      query: z.string().describe("Search query for users/artists"),
      limit: z.number().optional().describe("Maximum number of results (default: 10)"),
    },
    async ({ query, limit = 10 }) => {
      try {
        const client = await getAudiusClient();
        const result = await client.users.searchUsers({ query });
        const users = (result.data || []).slice(0, limit);

        const formatted = users.map((user: any, i: number) => ({
          rank: i + 1,
          name: user.name,
          handle: user.handle,
          followerCount: user.follower_count || 0,
          trackCount: user.track_count || 0,
          isVerified: user.is_verified || false,
          bio: user.bio?.substring(0, 200) || "",
          id: user.id,
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
              text: `Error searching users: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Get User by Handle
  server.tool(
    "get_user_by_handle",
    {
      handle: z.string().describe("The user's handle (username)"),
    },
    async ({ handle }) => {
      try {
        const client = await getAudiusClient();
        const result = await client.users.getUserByHandle({ handle });
        const user = result.data;

        if (!user) {
          return {
            content: [
              {
                type: "text",
                text: `User not found: @${handle}`,
              },
            ],
            isError: true,
          };
        }

        const formatted = {
          name: user.name,
          handle: user.handle,
          bio: user.bio || "",
          location: user.location || "",
          followerCount: user.followerCount || 0,
          followingCount: user.followeeCount || 0,
          trackCount: user.trackCount || 0,
          playlistCount: user.playlistCount || 0,
          isVerified: user.isVerified || false,
          id: user.id,
          website: user.website || "",
          twitter: user.twitterHandle || "",
          instagram: user.instagramHandle || "",
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
              text: `Error getting user: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Get User's Tracks
  server.tool(
    "get_user_tracks",
    {
      userId: z.string().describe("The Audius user ID"),
      limit: z.number().optional().describe("Maximum number of results (default: 10)"),
    },
    async ({ userId, limit = 10 }) => {
      try {
        const client = await getAudiusClient();
        const result = await client.users.getTracksByUser({ id: userId });
        const tracks = (result.data || []).slice(0, limit);

        const formatted = tracks.map((track: any, i: number) => ({
          rank: i + 1,
          title: track.title,
          playCount: track.play_count || 0,
          favoriteCount: track.favorite_count || 0,
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
              text: `Error getting user tracks: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Get User's Followers
  server.tool(
    "get_user_followers",
    {
      userId: z.string().describe("The Audius user ID"),
      limit: z.number().optional().describe("Maximum number of results (default: 10)"),
    },
    async ({ userId, limit = 10 }) => {
      try {
        const client = await getAudiusClient();
        const result = await client.users.getFollowers({ id: userId });
        const followers = (result.data || []).slice(0, limit);

        const formatted = followers.map((user: any, i: number) => ({
          rank: i + 1,
          name: user.name,
          handle: user.handle,
          followerCount: user.follower_count || 0,
          isVerified: user.is_verified || false,
          id: user.id,
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
              text: `Error getting followers: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Get User's Favorites
  server.tool(
    "get_user_favorites",
    {
      userId: z.string().describe("The Audius user ID"),
      limit: z.number().optional().describe("Maximum number of results (default: 10)"),
    },
    async ({ userId, limit = 10 }) => {
      try {
        const client = await getAudiusClient();
        const result = await client.users.getFavorites({ id: userId });
        const tracks = (result.data || []).slice(0, limit);

        const formatted = tracks.map((track: any, i: number) => ({
          rank: i + 1,
          title: track.title,
          artist: track.user?.name || "Unknown",
          playCount: track.play_count || 0,
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
              text: `Error getting user favorites: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
