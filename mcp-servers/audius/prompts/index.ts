/**
 * Audius MCP Prompts
 *
 * Prompt templates for common Audius queries.
 * Prompts are user-controlled templates that standardize how models perform tasks.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Register all prompts with the MCP server.
 */
export function registerPrompts(server: McpServer): void {
  // Analyze Artist prompt
  server.prompt(
    "analyze_artist",
    {
      handle: z.string().describe("The artist's Audius handle"),
    },
    async ({ handle }) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Analyze the Audius artist @${handle}.

Please provide:
1. Basic profile information (name, follower count, track count)
2. Their most popular tracks
3. Their primary genres/styles
4. Overall engagement metrics (plays, favorites)
5. A brief assessment of their popularity and reach on the platform

Use the get_user_by_handle and get_user_tracks tools to gather this information.`,
            },
          },
        ],
      };
    }
  );

  // Discover Music prompt
  server.prompt(
    "discover_music",
    {
      genre: z.string().optional().describe("Preferred genre"),
      mood: z.string().optional().describe("Desired mood"),
    },
    async ({ genre, mood }) => {
      let query = "Help me discover new music on Audius.";

      if (genre) {
        query += ` I'm interested in ${genre} music.`;
      }
      if (mood) {
        query += ` I'm looking for something ${mood}.`;
      }

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `${query}

Please:
1. Show me the current trending tracks${genre ? ` in ${genre}` : ""}
2. Recommend some artists I might like
3. Suggest playlists that match my preferences
4. Highlight any notable new releases

Use the get_trending_tracks, search_users, and get_trending_playlists tools.`,
            },
          },
        ],
      };
    }
  );

  // Compare Artists prompt
  server.prompt(
    "compare_artists",
    {
      artist1: z.string().describe("First artist handle"),
      artist2: z.string().describe("Second artist handle"),
    },
    async ({ artist1, artist2 }) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Compare the Audius artists @${artist1} and @${artist2}.

Please analyze:
1. Follower counts and growth
2. Track catalogs (number of tracks, genres)
3. Engagement metrics (total plays, favorites)
4. Most popular tracks from each
5. Similarities and differences in their music styles

Use the get_user_by_handle and get_user_tracks tools for both artists.`,
            },
          },
        ],
      };
    }
  );

  // Genre Analysis prompt
  server.prompt(
    "analyze_genre",
    {
      genre: z.string().describe("The genre to analyze"),
    },
    async ({ genre }) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Analyze the ${genre} genre on Audius.

Please provide:
1. Current trending ${genre} tracks
2. Top artists in this genre
3. Popular playlists featuring ${genre} music
4. Overall popularity and engagement compared to other genres
5. Notable characteristics or trends in this genre on the platform

Use get_trending_tracks with the genre filter and search tools.`,
            },
          },
        ],
      };
    }
  );

  // Playlist Curation prompt
  server.prompt(
    "curate_playlist",
    {
      theme: z.string().describe("Theme or vibe for the playlist"),
      trackCount: z.number().optional().describe("Number of tracks (default: 10)"),
    },
    async ({ theme, trackCount = 10 }) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Help me curate a playlist with the theme: "${theme}"

Requirements:
1. Find ${trackCount} tracks that fit this theme
2. Include a mix of popular and emerging artists
3. Ensure good flow between tracks
4. Provide reasoning for each selection
5. Suggest a playlist name and description

Use search_tracks and get_trending_tracks to find appropriate songs.`,
            },
          },
        ],
      };
    }
  );

  // Platform Stats prompt
  server.prompt(
    "platform_stats",
    {},
    async () => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Give me an overview of what's happening on Audius right now.

Please provide:
1. Top 5 trending tracks this week
2. Top 5 trending playlists
3. Notable artists gaining traction
4. Popular genres at the moment
5. Any interesting patterns or trends

Use the get_trending_tracks and get_trending_playlists tools.`,
            },
          },
        ],
      };
    }
  );
}
