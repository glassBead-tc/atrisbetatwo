/**
 * Atris State Definitions
 *
 * Modern LangGraph state management using Annotation pattern.
 * Simplified from the legacy 18+ field GraphState to essential fields only.
 */

import { Annotation, MessagesAnnotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

// ============== Core Types ==============

/**
 * Query type classification for routing
 */
export type QueryType = "entity" | "rag" | "web" | "bad" | null;

/**
 * Entity types supported by Audius
 */
export type EntityType = "track" | "user" | "playlist" | null;

/**
 * API response wrapper for Audius data
 */
export interface AudiusApiResult {
  success: boolean;
  data: any;
  endpoint: string;
  error?: string;
}

/**
 * Error state for tracking failures
 */
export interface AtrisError {
  code: string;
  message: string;
  node: string;
  timestamp: number;
  recoverable: boolean;
}

// ============== State Annotation ==============

/**
 * Main Atris state annotation using LangGraph's modern pattern.
 *
 * Uses MessagesAnnotation.spec for built-in message handling with
 * proper reducer for message accumulation.
 */
export const AtrisAnnotation = Annotation.Root({
  // Inherit message handling from MessagesAnnotation
  ...MessagesAnnotation.spec,

  // ---- Query Classification ----

  /** The current user query being processed */
  query: Annotation<string>({
    reducer: (_, update) => update,
    default: () => "",
  }),

  /** Classified query type for routing */
  queryType: Annotation<QueryType>({
    reducer: (_, update) => update,
    default: () => null,
  }),

  /** Entity type if this is an entity query */
  entityType: Annotation<EntityType>({
    reducer: (_, update) => update,
    default: () => null,
  }),

  /** Detected categories from query analysis */
  categories: Annotation<string[]>({
    reducer: (_, update) => update,
    default: () => [],
  }),

  // ---- Execution State ----

  /** Result from Audius API call */
  apiResult: Annotation<AudiusApiResult | null>({
    reducer: (_, update) => update,
    default: () => null,
  }),

  /** Retrieved context for RAG queries */
  context: Annotation<string>({
    reducer: (_, update) => update,
    default: () => "",
  }),

  /** Final formatted response to user */
  formattedResponse: Annotation<string>({
    reducer: (_, update) => update,
    default: () => "",
  }),

  // ---- Error Handling ----

  /** Current error state, if any */
  error: Annotation<AtrisError | null>({
    reducer: (_, update) => update,
    default: () => null,
  }),

  /** Whether to retry the current operation */
  shouldRetry: Annotation<boolean>({
    reducer: (_, update) => update,
    default: () => false,
  }),
});

/**
 * Type alias for the Atris state
 */
export type AtrisState = typeof AtrisAnnotation.State;

/**
 * Type alias for state updates (partial state)
 */
export type AtrisStateUpdate = Partial<AtrisState>;

// ============== Constants ==============

/**
 * High-level query categories for classification
 */
export const QUERY_CATEGORIES = [
  "trending",
  "search",
  "user_profile",
  "user_tracks",
  "user_playlists",
  "track_details",
  "playlist_details",
  "genre",
  "mood",
  "general",
  "documentation",
  "off_topic",
] as const;

export type QueryCategory = typeof QUERY_CATEGORIES[number];

/**
 * Audius-related keywords for query detection
 */
export const AUDIUS_KEYWORDS = [
  "audius",
  "track",
  "tracks",
  "song",
  "songs",
  "music",
  "artist",
  "artists",
  "user",
  "users",
  "playlist",
  "playlists",
  "trending",
  "popular",
  "genre",
  "hip-hop",
  "electronic",
  "rock",
  "pop",
  "jazz",
  "follower",
  "followers",
  "following",
  "repost",
  "favorite",
  "stream",
  "play",
  "listen",
] as const;

// ============== Type Guards ==============

/**
 * Check if a query type indicates an entity query
 */
export function isEntityQuery(queryType: QueryType): boolean {
  return queryType === "entity";
}

/**
 * Check if the state has a valid API result
 */
export function hasApiResult(state: AtrisState): boolean {
  return state.apiResult !== null && state.apiResult.success;
}

/**
 * Check if the state has an error
 */
export function hasError(state: AtrisState): boolean {
  return state.error !== null;
}

/**
 * Check if the error is recoverable
 */
export function isRecoverableError(state: AtrisState): boolean {
  return state.error !== null && state.error.recoverable;
}
