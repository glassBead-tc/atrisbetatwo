import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getAudiusSdk } from "../../../../services/audius_chat/audiusSdk";
import { 
  TrackSDKMethods 
} from "../../../../services/audius_chat/entity_methods/tracks/trackSDKMethods";
import { 
  UserSDKMethods 
} from "../../../../services/audius_chat/entity_methods/users/userSDKMethods";
import { 
  PlaylistSDKMethods 
} from "../../../../services/audius_chat/entity_methods/playlists/playlistSDKMethods";
import type { 
  TracksResponse, 
  UsersResponse,
  TrackResponse,
  UserResponse,
  PlaylistResponse,
  TrackCommentsResponse,
  StemsResponse,
  FavoritesResponse,
  TrendingPlaylistsResponse,
} from '@audius/sdk';
import { 
  SearchFullResponse,
  GetFavoritesRequest,
} from "../../../../types/types";
import { BASE_URL } from "../../../../constants/constants";

type ApiResponse = 
  | TracksResponse 
  | UsersResponse 
  | TrackResponse 
  | UserResponse 
  | PlaylistResponse
  | TrackCommentsResponse
  | StemsResponse
  | FavoritesResponse
  | TrackCommentsResponse
  | TrendingPlaylistsResponse
  | GetFavoritesRequest
  | SearchFullResponse;

async function executeSDKMethod(apiName: string, parameters: Record<string, any>): Promise<ApiResponse> {
  const sdk = await getAudiusSdk();
  
  // Initialize method handlers
  const trackMethods = new TrackSDKMethods(BASE_URL, process.env.AUDIUS_API_KEY!);
  const userMethods = new UserSDKMethods(BASE_URL, process.env.AUDIUS_API_KEY!);
  const playlistMethods = new PlaylistSDKMethods(BASE_URL, process.env.AUDIUS_API_KEY!);

  // Map API names to SDK methods
  const methodMap: Record<string, Function> = {
    'Get Trending Tracks': trackMethods.getTrendingTracks.bind(trackMethods),
    'Search Tracks': trackMethods.searchTracks.bind(trackMethods),
    'Get Track Comments': trackMethods.getTrackComments.bind(trackMethods),
    'Get Track Stems': trackMethods.getTrackStems.bind(trackMethods),
    'Get Track Favorites': trackMethods.getTrackFavorites.bind(trackMethods),
    'Search Users': userMethods.searchUsers.bind(userMethods),
    'Get User Followers': userMethods.getUserFollowers.bind(userMethods),
    'Get User Following': userMethods.getUserFollowings.bind(userMethods),
    'Get Trending Playlists': playlistMethods.getTrendingPlaylists.bind(playlistMethods),
    'Search Playlists': playlistMethods.searchPlaylists.bind(playlistMethods),
    'Get Genre Info': trackMethods.getTrackGenre.bind(trackMethods)
  };

  const method = methodMap[apiName];
  if (!method) {
    throw new Error(`No SDK method found for API: ${apiName}`);
  }

  return method(parameters);
}

export const createFetchRequestTool = tool(
  async (input: {
    apiName: string;
    parameters: Record<string, any>;
  }): Promise<{
    response: ApiResponse;
  }> => {
    try {
      const response = await executeSDKMethod(input.apiName, input.parameters);
      return { response };
    } catch (error) {
      console.error('Error in createFetchRequestTool:', error);
      throw error;
    }
  },
  {
    name: "create_fetch_request",
    description: "Creates and executes an API fetch request",
    schema: z.object({
      apiName: z.string(),
      parameters: z.record(z.any())
    })
  }
);
