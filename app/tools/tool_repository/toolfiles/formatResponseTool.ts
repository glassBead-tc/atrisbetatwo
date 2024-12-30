import { tool } from "@langchain/core/tools";
import { z } from "zod";

interface ApiTrack {
  title: string;
  user: {
    name: string;
  };
  name: string;
  play_count: number;
  favorite_count: number;
}

interface ApiPlaylist {
  playlist_name: string;
  user: {
    name: string;
  };
  name: string;
  track_count: number;
  total_play_count: number;
}

export const formatResponseTool = tool(
  async (input: { response: { data: any[] } }): Promise<{ formattedResponse: string }> => {
    try {
      const { response } = input;
      if (!response || !response.data) {
        return { formattedResponse: "No data found in response" };
      }

      const data = response.data;
      if (!Array.isArray(data)) {
        return { formattedResponse: "Invalid response format" };
      }

      let formattedResponse = "";

      // Format tracks
      if (data[0] && (data[0].title || data[0].name)) {
        const tracks = data as ApiTrack[];
        formattedResponse = tracks.map(track => {
          const name = track.title || track.name;
          return `${name} by ${track.user.name} (${track.play_count} plays, ${track.favorite_count} favorites)`;
        }).join('\n');
      }
      // Format playlists
      else if (data[0] && (data[0].playlist_name)) {
        const playlists = data as ApiPlaylist[];
        formattedResponse = playlists.map(playlist => {
          const name = playlist.playlist_name;
          return `${name} by ${playlist.user.name} (${playlist.track_count} tracks, ${playlist.total_play_count} total plays)`;
        }).join('\n');
      }
      // Generic formatting for other types
      else {
        formattedResponse = JSON.stringify(data, null, 2);
      }

      return { formattedResponse };
    } catch (error) {
      console.error('Error in formatResponseTool:', error);
      return { formattedResponse: "Error formatting response" };
    }
  },
  {
    name: "format_response",
    description: "Formats API response data into readable text",
    schema: z.object({
      response: z.object({
        data: z.array(z.any())
      })
    })
  }
);
