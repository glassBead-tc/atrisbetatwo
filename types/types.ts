/**
 * Legacy Type Definitions
 *
 * These types are maintained for backwards compatibility with existing tools
 * and utilities. New code should use types from ./state.ts instead.
 *
 * TODO: Gradually migrate to types/state.ts in future phases.
 */

// ============== Core Types ==============

export type QueryType = "entity" | "rag" | "web" | "bad" | null;
export type EntityType = "track" | "user" | "playlist" | null;

export type ComplexityLevel = "simple" | "moderate" | "complex";

export type TrackProperty = "playCount" | "repostCount" | "favoriteCount" | "genre";
export type UserProperty = "followerCount" | "trackCount" | "playlistCount";
export type PlaylistProperty = "trackCount" | "repostCount" | "favoriteCount";

// ============== API Types ==============

export interface ApiEndpoint {
  id: string;
  category_name: string;
  tool_name: string;
  api_name: string;
  api_description: string;
  required_parameters: Array<{
    name: string;
    type: string;
    description: string;
    default: string;
  }>;
  optional_parameters: Array<{
    name: string;
    type: string;
    description: string;
    default: string;
  }>;
  method: string;
  template_response: {
    data: any;
  };
  api_url: string;
}

export interface AudiusCorpus {
  endpoints: ApiEndpoint[];
}

export interface DatasetSchema extends ApiEndpoint {
  description: string;
  parameters: {
    required: string[];
    optional: string[];
  };
  endpoint: string;
}

// ============== Query Types ==============

export type QueryCategorization = {
  queryType: QueryType;
  isEntityQuery: boolean;
  entityType: EntityType;
  complexity: ComplexityLevel;
  entityName: string | null;
};

export interface SelectAPIResponse {
  api: ApiEndpoint;
  parameters: Record<string, any>;
  error: boolean | null;
}

// ============== Error Types ==============

export type ErrorState = {
  code: string;
  message: string;
  suggestion?: string;
  timestamp: number;
  node: string;
};

// ============== Type Guards ==============

export function isTrackProperty(prop: string): prop is TrackProperty {
  return ["playCount", "repostCount", "favoriteCount", "genre"].includes(prop);
}

export function isUserProperty(prop: string): prop is UserProperty {
  return ["followerCount", "trackCount", "playlistCount"].includes(prop);
}

export function isPlaylistProperty(prop: string): prop is PlaylistProperty {
  return ["trackCount", "repostCount", "favoriteCount"].includes(prop);
}

// ============== Property Mappings ==============

export const wordToPropertyMap: Record<
  string,
  TrackProperty | UserProperty | PlaylistProperty
> = {
  play: "playCount",
  plays: "playCount",
  follower: "followerCount",
  followers: "followerCount",
  song: "trackCount",
  songs: "trackCount",
  track: "trackCount",
  tracks: "trackCount",
  genre: "genre",
  repost: "repostCount",
  reposts: "repostCount",
  favorite: "favoriteCount",
  favorites: "favoriteCount",
} as const;

// ============== Node Names ==============

export type NodeNames =
  | "__start__"
  | "__end__"
  | "init_sdk"
  | "extract_category"
  | "select_api"
  | "extract_params"
  | "execute_request"
  | "format_response"
  | "handle_error";
