/**
 * Audius MCP Resources
 *
 * MCP resources exposing static and semi-static Audius data.
 * Resources are application-controlled data sources (unlike tools which are model-controlled).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getAudiusClient } from "../../../lib/audius.js";

// Genre mappings for Audius
const AUDIUS_GENRES = [
  "Electronic",
  "Hip-Hop/Rap",
  "Alternative",
  "Pop",
  "Rock",
  "R&B/Soul",
  "Dance",
  "Metal",
  "World",
  "Jazz",
  "Latin",
  "Punk",
  "Folk",
  "Ambient",
  "Classical",
  "Country",
  "Soundtrack",
  "Reggae",
  "Devotional",
  "Spoken Word",
  "Comedy",
  "Experimental",
  "Deep House",
  "Techno",
  "House",
  "Drum & Bass",
  "Dubstep",
  "Trap",
  "Lo-Fi",
];

// Mood mappings for Audius
const AUDIUS_MOODS = [
  "Peaceful",
  "Romantic",
  "Sentimental",
  "Tender",
  "Easygoing",
  "Yearning",
  "Sophisticated",
  "Sensual",
  "Cool",
  "Gritty",
  "Melancholy",
  "Serious",
  "Brooding",
  "Fiery",
  "Defiant",
  "Aggressive",
  "Rowdy",
  "Excited",
  "Energizing",
  "Empowering",
  "Stirring",
  "Upbeat",
  "Other",
];

/**
 * Register all resources with the MCP server.
 */
export function registerResources(server: McpServer): void {
  // List available resources
  server.resource(
    "audius://genres",
    "List of all available genres on Audius",
    async () => {
      return {
        contents: [
          {
            uri: "audius://genres",
            mimeType: "application/json",
            text: JSON.stringify(
              {
                genres: AUDIUS_GENRES,
                count: AUDIUS_GENRES.length,
                description: "Available music genres on the Audius platform",
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  server.resource(
    "audius://moods",
    "List of all available moods on Audius",
    async () => {
      return {
        contents: [
          {
            uri: "audius://moods",
            mimeType: "application/json",
            text: JSON.stringify(
              {
                moods: AUDIUS_MOODS,
                count: AUDIUS_MOODS.length,
                description: "Available track moods on the Audius platform",
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // Dynamic resource for trending tracks (cached for a short period)
  server.resource(
    "audius://trending/tracks",
    "Current trending tracks on Audius (refreshed periodically)",
    async () => {
      try {
        const client = await getAudiusClient();
        const result = await client.tracks.getTrendingTracks({ time: "week" });
        const tracks = (result.data || []).slice(0, 20);

        const formatted = tracks.map((track: any, i: number) => ({
          rank: i + 1,
          title: track.title,
          artist: track.user?.name || "Unknown",
          playCount: track.playCount || 0,
          genre: track.genre || "Unknown",
          id: track.id,
        }));

        return {
          contents: [
            {
              uri: "audius://trending/tracks",
              mimeType: "application/json",
              text: JSON.stringify(
                {
                  period: "week",
                  tracks: formatted,
                  fetchedAt: new Date().toISOString(),
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          contents: [
            {
              uri: "audius://trending/tracks",
              mimeType: "application/json",
              text: JSON.stringify(
                {
                  error: error instanceof Error ? error.message : "Unknown error",
                  fetchedAt: new Date().toISOString(),
                },
                null,
                2
              ),
            },
          ],
        };
      }
    }
  );

  // Dynamic resource for trending playlists
  server.resource(
    "audius://trending/playlists",
    "Current trending playlists on Audius",
    async () => {
      try {
        const client = await getAudiusClient();
        const result = await client.playlists.getTrendingPlaylists({ time: "week" });
        const playlists = (result.data || []).slice(0, 20);

        const formatted = playlists.map((playlist: any, i: number) => ({
          rank: i + 1,
          name: playlist.playlistName,
          creator: playlist.user?.name || "Unknown",
          trackCount: playlist.trackCount || 0,
          id: playlist.id,
        }));

        return {
          contents: [
            {
              uri: "audius://trending/playlists",
              mimeType: "application/json",
              text: JSON.stringify(
                {
                  period: "week",
                  playlists: formatted,
                  fetchedAt: new Date().toISOString(),
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          contents: [
            {
              uri: "audius://trending/playlists",
              mimeType: "application/json",
              text: JSON.stringify(
                {
                  error: error instanceof Error ? error.message : "Unknown error",
                  fetchedAt: new Date().toISOString(),
                },
                null,
                2
              ),
            },
          ],
        };
      }
    }
  );

  // API documentation resource
  server.resource(
    "audius://docs/api",
    "Audius API documentation summary",
    async () => {
      return {
        contents: [
          {
            uri: "audius://docs/api",
            mimeType: "application/json",
            text: JSON.stringify(
              {
                title: "Audius API Overview",
                version: "11.x",
                description:
                  "The Audius API provides access to the decentralized music platform's data including tracks, users, and playlists.",
                endpoints: {
                  tracks: [
                    "GET /tracks/trending - Get trending tracks",
                    "GET /tracks/search - Search for tracks",
                    "GET /tracks/{trackId} - Get track details",
                  ],
                  users: [
                    "GET /users/search - Search for users",
                    "GET /users/handle/{handle} - Get user by handle",
                    "GET /users/{userId}/tracks - Get user's tracks",
                    "GET /users/{userId}/followers - Get user's followers",
                  ],
                  playlists: [
                    "GET /playlists/trending - Get trending playlists",
                    "GET /playlists/search - Search for playlists",
                    "GET /playlists/{playlistId} - Get playlist details",
                    "GET /playlists/{playlistId}/tracks - Get playlist tracks",
                  ],
                },
                rateLimit: "No rate limits",
                authentication: "API key required (X-API-KEY header)",
                sdkDocs: "https://docs.audius.org/sdk/",
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );
}

export { AUDIUS_GENRES, AUDIUS_MOODS };
