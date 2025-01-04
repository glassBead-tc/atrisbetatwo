import { tool } from "@langchain/core/tools";
import { z } from "zod";
import fs from "fs";
import { 
  DatasetSchema, 
  EntityType, 
  AudiusCorpus,
  ApiEndpoint 
} from "../../../../types/types";
import { TRIMMED_CORPUS_PATH } from "../../../../constants/constants";

type ApiCategory = 'Tracks' | 'Playlists' | 'Users';
type EntityQueryType = 
  | 'trending_tracks'
  | 'trending_playlists'
  | 'trending_artists'
  | 'artists_by_genre'
  | 'top_artists'
  | 'genre_info'
  | 'genre_popularity'
  | 'general'
  | 'tracks'
  | 'users'
  | 'playlists';

const EXTRACT_HIGH_LEVEL_CATEGORIES: Record<string, ApiCategory> = {
  'Get Trending Tracks': 'Tracks',
  'Search Tracks': 'Tracks',
  'Get Track Comments': 'Tracks',
  'Get Track Stems': 'Tracks',
  'Get Track Favorites': 'Tracks',
  'Get Trending Playlists': 'Playlists',
  'Search Playlists': 'Playlists',
  'Search Users': 'Users',
  'Get User Followers': 'Users',
  'Get User Following': 'Users',
  'Get Genre Info': 'Tracks'
} as const;

export const selectApiTool = tool(
  async (input: { 
    categories: string[];
    entityType: EntityType | null;
    queryType: EntityQueryType;
    isTrendingQuery: boolean;
    isGenreQuery: boolean;
  }): Promise<{
    selectedApi: ApiEndpoint;
    queryType: EntityQueryType;
    entityType: EntityType | null;
  }> => {
    try {
      // Only use genre popularity calculation for trending genre queries
      if (input.isTrendingQuery && input.isGenreQuery && !input.entityType) {
        return {
          selectedApi: {
            id: 'calculate_genre_popularity',
            api_name: 'Calculate Genre Popularity',
            category_name: 'Genres',
            tool_name: 'Genre Popularity Calculator',
            api_description: 'Calculates genre popularity based on trending tracks',
            required_parameters: [],
            optional_parameters: [],
            method: 'GET',
            api_url: 'custom/genre-popularity',
            description: 'Custom calculation for genre popularity',
            parameters: {
              required: [],
              optional: ['time', 'limit']
            },
            endpoint: 'custom/genre-popularity',
            template_response: {
              data: []
            }
          } as DatasetSchema,
          queryType: 'genre_popularity',
          entityType: null
        };
      }

      // Special handling for trending artists
      if (input.queryType === 'trending_artists') {
        return {
          selectedApi: {
            id: 'calculate_trending_artists',
            api_name: 'Calculate Trending Artists',
            category_name: 'Users',
            tool_name: 'Artist Popularity Calculator',
            api_description: 'Calculates trending artists based on recent track performance',
            required_parameters: [],
            optional_parameters: [],
            method: 'GET',
            api_url: 'custom/trending-artists',
            description: 'Custom calculation for trending artists',
            parameters: {
              required: [],
              optional: ['time', 'limit']
            },
            endpoint: 'custom/trending-artists',
            template_response: {
              data: []
            }
          } as DatasetSchema,
          queryType: input.queryType,
          entityType: 'user'
        };
      }

      const rawData = fs.readFileSync(TRIMMED_CORPUS_PATH, 'utf-8');
      const corpus: AudiusCorpus = JSON.parse(rawData);
      
      // Filter APIs by query type and category
      const apis = corpus.endpoints.filter((endpoint: ApiEndpoint) => {
        // For trending queries - handle playlists separately
        if (input.queryType === 'trending_playlists') {
          return endpoint.api_name === 'Get Trending Playlists';
        }
        if (input.queryType === 'trending_tracks') {
          return endpoint.api_name === 'Get Trending Tracks';
        }

        // For search queries
        if (input.queryType === 'tracks') {
          return endpoint.api_name === 'Search Tracks';
        }
        if (input.queryType === 'users') {
          return endpoint.api_name === 'Search Users';
        }
        if (input.queryType === 'playlists') {
          return endpoint.api_name === 'Search Playlists';
        }

        // For genre info
        if (input.queryType === 'genre_info') {
          return endpoint.api_name === 'Get Genre Info';
        }

        // For other queries, match by category
        return input.categories.some(cat => 
          EXTRACT_HIGH_LEVEL_CATEGORIES[cat as keyof typeof EXTRACT_HIGH_LEVEL_CATEGORIES] === endpoint.category_name
        );
      });

      if (!apis.length) {
        throw new Error(`No APIs found for categories: ${input.categories.join(', ')}`);
      }

      // Select best API (first matching one for now)
      const selectedApi = apis[0];
      
      return {
        selectedApi: selectedApi,
        queryType: input.queryType,
        entityType: input.entityType
      };
    } catch (error) {
      console.error('Error in selectApiTool:', error);
      throw error;
    }
  },
  {
    name: "select_api",
    description: "Selects appropriate API based on query type and categories",
    schema: z.object({
      categories: z.array(z.string()),
      entityType: z.enum(['track', 'user', 'playlist']).nullable(),
      queryType: z.enum([
        'trending_tracks',
        'trending_playlists',
        'trending_artists',
        'artists_by_genre',
        'top_artists',
        'genre_info',
        'genre_popularity',
        'general',
        'tracks',
        'users',
        'playlists'
      ]),
      isTrendingQuery: z.boolean(),
      isGenreQuery: z.boolean()
    })
  }
);