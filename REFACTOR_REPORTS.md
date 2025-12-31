# Atris Codebase Modernization Reports

**Generated:** December 31, 2024 (NYE)
**Purpose:** Comprehensive refactoring guide for upgrading Atris to modern LangGraph.js, latest Audius SDK, and MCP integration

---

# Report 1: Current Codebase Analysis

## Executive Summary

Atris is a LangGraph-based AI agent for the Audius music platform, built on Next.js 14 with TypeScript. The codebase shows thoughtful architecture but is in a **transitional state** with two competing implementations, incomplete features, and scattered complexity.

## Architecture Overview

```
atrisbetatwo/
├── app/                    # Next.js app directory
│   ├── api/chat/          # API endpoints (3 routes)
│   └── tools/             # Agent tools and utilities
├── graphs/                 # LangGraph implementations (2 files)
├── services/              # External service integrations
│   └── audius_chat/       # Audius SDK wrapper
├── types/                 # TypeScript definitions
├── errors/                # Error handling (unused)
├── constants/             # Configuration constants
└── data/                  # Corpora and mappings
```

## Current Tech Stack

| Component | Current Version | Latest Version |
|-----------|-----------------|----------------|
| @langchain/langgraph | 0.2.20 | 1.0.x |
| @langchain/core | 0.3.17 | 0.3.x |
| @audius/sdk | 7.1.1 | **11.3.0** |
| Next.js | 14.2.3 | 15.x |
| TypeScript | 5.1.6 | 5.3.x |

## Critical Issues Identified

### 1. Incomplete LangGraph Implementation

**Current State (`atrisrevision.ts`):**
```
START → init_sdk_node → extract_category_node → END
```

Only 2 nodes implemented. No actual query execution, no RAG, no response formatting.

**Aspirational Design (`atris.ts` - 429 lines, 100% commented out):**
```
START → api → grade → (conditional routing)
                  ├→ rag → grade
                  ├→ webSearch → format
                  └→ format → END
```

The complete design exists but was never integrated.

### 2. Outdated Audius SDK

Current SDK (v7.1.1) is **4+ major versions behind** the latest (v11.3.0). Missing:
- New SDK initialization patterns
- Pay-to-unlock features
- Scheduled releases
- Advanced search filters
- Comment system
- Updated authentication

### 3. State Management Bloat

GraphState has **18+ fields** but most remain null:
```typescript
interface GraphState {
  llm, query, queryType, categories, apis, bestApi, parameters,
  response, formattedResponse, complexity, isEntityQuery, entityName,
  entityType, error, errorHistory, messages, messageHistory,
  secondaryApi, secondaryResponse, sdk, initialized, sdkInitialized, sdkConfig
}
```

### 4. Tool Architecture Duplication

- `extractCategoryTool` exists in both `tools.ts` and `toolfiles/extractCategoryTool.ts`
- Parameter extraction duplicated per entity type (tracks, users, playlists)
- 40+ utility files with scattered, overlapping logic

### 5. Error Handling Not Functional

Error classes exist but are never thrown:
```typescript
// errors/ClassificationError.ts - exists but unused
// errors/recoveryOrchestra.ts - returns "Not actually implemented here"
```

### 6. No Test Coverage

Zero test files found in the codebase.

## Strengths to Preserve

1. **Well-organized project structure** with clear separation of concerns
2. **Comprehensive type definitions** (when used properly)
3. **Modular tool system** allows easy extensions
4. **Smart query analysis** with confidence scoring
5. **Multiple integration points** (Audius, Supabase, OpenAI, Tavily)

---

# Report 2: LangGraph.js Modernization Guide

## What's New in LangGraph 1.0+

### Key Changes Since v0.2.x

| Feature | Old Way | New Way (1.0+) |
|---------|---------|----------------|
| State Definition | Custom reducers | `Annotation.Root({...})` |
| Messages | Manual reducer | `MessagesAnnotation.spec` |
| Node Definition | Loose functions | Type-safe with state annotation |
| Human-in-loop | Checkpoint manipulation | `interrupt()` function |
| Streaming | Multiple patterns | Four standardized modes |
| Persistence | Optional | First-class with PostgresSaver |

### New Type-Safe State Pattern

**Current (Outdated):**
```typescript
const GraphState = {
  query: {
    reducer: (curr, update) => curr !== update ? update : curr,
    default: () => ''
  },
  // ... 17 more fields
}
```

**Modern (LangGraph 1.0):**
```typescript
import { Annotation, MessagesAnnotation } from "@langchain/langgraph";

const AtrisAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,  // Built-in message handling
  query: Annotation<string>,
  queryType: Annotation<"entity" | "rag" | "web" | null>,
  entityType: Annotation<"track" | "user" | "playlist" | null>,
  apiResult: Annotation<any>,
  context: Annotation<string>,
});
```

### Simplified Graph Construction

**Current:**
```typescript
const workflow = new StateGraph(graphState)
  .addNode("init_sdk_node", init_sdk_node)
  .addNode("extract_category_node", extract_category_node)
  .addEdge(START, "init_sdk_node")
  .addEdge("init_sdk_node", "extract_category_node")
  .addEdge("extract_category_node", END);
```

**Modern (v0.3+):**
```typescript
const workflow = new StateGraph(AtrisAnnotation)
  .addNode({ initSdk, classifyQuery, executeApi, formatResponse })
  .addSequence({ initSdk, classifyQuery })
  .addConditionalEdges("classifyQuery", routeByQueryType, {
    entity: "executeApi",
    rag: "retrieveContext",
    web: "webSearch",
    bad: "handleBadQuery"
  })
  .addEdge("executeApi", "formatResponse")
  .addEdge("formatResponse", END);
```

### Human-in-the-Loop with `interrupt()`

New pattern for user confirmations:
```typescript
import { interrupt } from "@langchain/langgraph";

const confirmAction = (state: typeof AtrisAnnotation.State) => {
  const action = state.pendingAction;

  // Pause and wait for user confirmation
  const confirmed = interrupt(`Confirm action: ${action.description}?`);

  if (confirmed) {
    return { actionConfirmed: true };
  }
  return { actionConfirmed: false };
};
```

### Four Streaming Modes

Choose based on use case:

1. **`values`** - Complete state after each node (simple UIs)
2. **`updates`** - Only changed state values (efficient updates)
3. **`messages`** - Stream messages as they're added (chatbots)
4. **`events`** - All events including start/end (debugging)

```typescript
for await (const chunk of await graph.stream(input, {
  streamMode: "messages"  // Ideal for chat UI
})) {
  process.stdout.write(chunk.content);
}
```

### Production Checkpointing

Replace in-memory state with PostgreSQL:

```typescript
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";

const checkpointer = PostgresSaver.fromConnectionString(
  process.env.DATABASE_URL
);

const graph = workflow.compile({ checkpointer });

// Each conversation gets a thread
await graph.invoke(input, {
  configurable: { thread_id: "user-123-session-456" }
});
```

## Migration Checklist

- [ ] Update to `@langchain/langgraph@^1.0.0`
- [ ] Replace custom state with `Annotation.Root()`
- [ ] Use `MessagesAnnotation.spec` for messages
- [ ] Simplify graph with `.addNode({...})` pattern
- [ ] Add conditional edges for query routing
- [ ] Implement `interrupt()` for confirmations
- [ ] Choose appropriate streaming mode
- [ ] Add PostgresSaver for production
- [ ] Integrate LangSmith for observability

---

# Report 3: Audius SDK Update Guide

## SDK Version Gap Analysis

| Feature | Current (v7.1.1) | Latest (v11.3.0) |
|---------|------------------|------------------|
| Initialization | Custom wrapper | Native `sdk({...})` |
| Authentication | Manual headers | OAuth built-in |
| Endpoints | Manual fetch | Namespaced methods |
| Types | Partial | Full TypeScript |
| Write Operations | Limited | Full support |
| Comments | Not available | Full support |
| Pay-to-unlock | Not available | Full support |
| Scheduled Releases | Not available | Full support |

## New Initialization Pattern

**Current (`audiusSdk.ts`):**
```typescript
class MinimalAudiusSDK {
  public tracks: TrackSDKMethods;
  public users: UserSDKMethods;
  public playlists: PlaylistSDKMethods;
  private apiKey: string;
  private baseUrl: string = "https://discovery-us-01.audius.openplayer.org/v1";

  // Manual implementation of each method...
}
```

**Modern (v11+):**
```typescript
import { sdk } from '@audius/sdk';

const audiusSdk = sdk({
  apiKey: process.env.AUDIUS_API_KEY!,
  apiSecret: process.env.AUDIUS_API_SECRET  // Backend only
});

// Methods are namespaced and typed
const track = await audiusSdk.tracks.getTrack({ trackId: 'D7KyD' });
const user = await audiusSdk.users.getUserByHandle({ handle: 'deadmau5' });
const playlists = await audiusSdk.playlists.getTrendingPlaylists();
```

## New Endpoints Available

### Tracks (New Methods)
```typescript
// Stream-gated tracks
await audiusSdk.tracks.uploadTrack({
  userId,
  metadata: {
    isStreamGated: true,
    streamConditions: { followUserId: '7eP5n' }
  }
});

// Comments (NEW in 2024)
const comments = await audiusSdk.tracks.getTrackComments({ trackId });

// Stems (NEW)
const stems = await audiusSdk.tracks.getTrackStems({ trackId });
```

### Users (New Methods)
```typescript
// Supporters (users who tipped)
const supporters = await audiusSdk.users.getSupporters({ id: userId });

// Supportings (users being tipped)
const supporting = await audiusSdk.users.getSupportings({ id: userId });

// Subscribers
const subscribers = await audiusSdk.users.getSubscribers({ id: userId });
```

### OAuth Authentication (New)
```typescript
audiusSdk.oauth.init({
  successCallback: (user) => {
    console.log('Logged in:', user.name, user.email);
    // user.userId, user.handle, user.verified, etc.
  },
  errorCallback: (error) => console.error('Login failed:', error),
  scope: 'write'  // or 'read'
});
```

## Rate Limiting: Good News!

**Zero rate limits.** The Audius API is completely free with no rate limiting. However, implement reasonable practices:
- Cache trending data (changes slowly)
- Batch user lookups with `getBulkUsers()`
- Don't hammer the API unnecessarily

## Migration Steps

1. **Update package:**
   ```bash
   npm install @audius/sdk@latest
   ```

2. **Replace SDK wrapper:**
   - Delete `services/audius_chat/audiusSdk.ts` (237 lines)
   - Delete `services/audius_chat/entity_methods/` (entire directory)
   - Use native SDK methods directly

3. **Update initialization:**
   ```typescript
   // Old (delete this)
   const sdk = new MinimalAudiusSDK(apiKey);

   // New (use this)
   import { sdk } from '@audius/sdk';
   const audiusSdk = sdk({ apiKey: process.env.AUDIUS_API_KEY });
   ```

4. **Update method calls:**
   ```typescript
   // Old
   sdk.tracks.getTrendingTracks();

   // New (same pattern, but native)
   audiusSdk.tracks.getTrendingTracks();
   ```

5. **Add new features:**
   - Implement OAuth for authenticated operations
   - Add comment fetching for tracks
   - Add supporter/supporting relationships

---

# Report 4: MCP Integration Strategy

## Why MCP for Atris?

MCP (Model Context Protocol) provides a standardized way to expose Audius data and operations to AI systems. Benefits:

1. **Interoperability** - Same server works with Claude, ChatGPT, Cursor, etc.
2. **Separation of Concerns** - AI logic separate from data access
3. **Extensibility** - Add new capabilities without changing core agent
4. **Production Ready** - Battle-tested protocol with security patterns

## Proposed Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Atris Agent                          │
│                  (LangGraph 1.0)                        │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │   Classify  │→ │   Route     │→ │   Format        │ │
│  │   Query     │  │   Query     │  │   Response      │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
│         │                │                  ↑          │
└─────────┼────────────────┼──────────────────┼──────────┘
          │                │                  │
          ▼                ▼                  │
   ┌──────────────────────────────────────────┴──────────┐
   │              MCP Client Layer                       │
   │         (langchain-mcp-adapters)                    │
   └─────────────────────────┬───────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
   │   Audius    │   │  Supabase   │   │   Web       │
   │ MCP Server  │   │ MCP Server  │   │  Search     │
   │             │   │   (RAG)     │   │ MCP Server  │
   └─────────────┘   └─────────────┘   └─────────────┘
```

## Audius MCP Server Design

Create a dedicated MCP server exposing Audius operations:

```typescript
// mcp-servers/audius-server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sdk } from '@audius/sdk';
import { z } from "zod";

const server = new McpServer({
  name: "audius-mcp",
  version: "1.0.0"
});

const audiusSdk = sdk({ apiKey: process.env.AUDIUS_API_KEY });

// ============== TOOLS ==============

// Search Tracks
server.tool(
  "search_tracks",
  { query: z.string(), limit: z.number().optional() },
  async ({ query, limit = 10 }) => {
    const results = await audiusSdk.tracks.searchTracks({ query });
    return {
      content: [{
        type: "text",
        text: JSON.stringify(results.data.slice(0, limit), null, 2)
      }]
    };
  }
);

// Get Trending Tracks
server.tool(
  "get_trending_tracks",
  { genre: z.string().optional(), time: z.enum(["week", "month", "allTime"]).optional() },
  async ({ genre, time = "week" }) => {
    const results = await audiusSdk.tracks.getTrendingTracks({ genre, time });
    return {
      content: [{
        type: "text",
        text: JSON.stringify(results.data, null, 2)
      }]
    };
  }
);

// Get User Profile
server.tool(
  "get_user",
  { handle: z.string() },
  async ({ handle }) => {
    const user = await audiusSdk.users.getUserByHandle({ handle });
    return {
      content: [{
        type: "text",
        text: JSON.stringify(user.data, null, 2)
      }]
    };
  }
);

// Get User's Tracks
server.tool(
  "get_user_tracks",
  { userId: z.string(), limit: z.number().optional() },
  async ({ userId, limit = 20 }) => {
    const tracks = await audiusSdk.users.getUserTracks({ userId, limit });
    return {
      content: [{
        type: "text",
        text: JSON.stringify(tracks.data, null, 2)
      }]
    };
  }
);

// ============== RESOURCES ==============

// Trending data (cacheable)
server.resource(
  "audius://trending/tracks",
  async () => ({
    contents: [{
      uri: "audius://trending/tracks",
      mimeType: "application/json",
      text: JSON.stringify(await audiusSdk.tracks.getTrendingTracks())
    }]
  })
);

// Genre mappings
server.resource(
  "audius://genres",
  async () => ({
    contents: [{
      uri: "audius://genres",
      mimeType: "application/json",
      text: JSON.stringify(GENRE_MAPPINGS)
    }]
  })
);

// ============== PROMPTS ==============

server.prompt(
  "analyze_artist",
  { handle: z.string() },
  async ({ handle }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Analyze the Audius artist @${handle}. Look at their tracks, followers, and engagement. Provide insights on their popularity and music style.`
      }
    }]
  })
);

export { server };
```

## LangGraph + MCP Integration

```typescript
// graphs/atris-mcp.ts
import { StateGraph, Annotation, MessagesAnnotation } from "@langchain/langgraph";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";

// State definition
const AtrisAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  query: Annotation<string>,
  queryType: Annotation<"entity" | "rag" | "general" | null>,
});

// Initialize MCP client with multiple servers
const mcpClient = new MultiServerMCPClient({
  servers: [
    {
      name: "audius",
      transport: "stdio",
      command: "npx",
      args: ["ts-node", "mcp-servers/audius-server.ts"]
    },
    {
      name: "supabase",
      transport: "http",
      url: process.env.SUPABASE_MCP_URL
    }
  ]
});

// Get tools from MCP servers
const mcpTools = await mcpClient.getTools();

// Create LLM
const llm = new ChatOpenAI({ model: "gpt-4o-mini" });

// Build the graph
const workflow = new StateGraph(AtrisAnnotation)
  .addNode("classify", classifyQuery)
  .addNode("agent", createReactAgent({ llm, tools: mcpTools }))
  .addEdge("classify", "agent")
  .addEdge("agent", END);

export const graph = workflow.compile();
```

## Benefits of This Approach

1. **Clean Separation**: Audius logic in MCP server, agent logic in LangGraph
2. **Reusable**: MCP server works with any AI client
3. **Testable**: Test MCP server independently
4. **Extensible**: Add new tools without touching agent
5. **Future-proof**: Protocol is industry standard

---

# Report 5: Complete Refactor Roadmap

## Phase 1: Foundation (Week 1-2)

### 1.1 Dependency Updates
```bash
# Update core dependencies
npm install @langchain/langgraph@^1.0.0 \
            @langchain/core@latest \
            @audius/sdk@^11.3.0 \
            @modelcontextprotocol/sdk@latest \
            @langchain/mcp-adapters@latest
```

### 1.2 State Modernization

**File:** `types/state.ts` (new)
```typescript
import { Annotation, MessagesAnnotation } from "@langchain/langgraph";

export const AtrisAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,

  // Query classification
  query: Annotation<string>,
  queryType: Annotation<"entity" | "rag" | "web" | "bad" | null>,
  entityType: Annotation<"track" | "user" | "playlist" | null>,

  // Execution state
  apiResult: Annotation<any>,
  context: Annotation<string>,

  // SDK (initialized once)
  sdk: Annotation<any>,
});

export type AtrisState = typeof AtrisAnnotation.State;
```

### 1.3 Delete Legacy Code

**Delete these files/directories:**
- `services/audius_chat/audiusSdk.ts` (replaced by native SDK)
- `services/audius_chat/entity_methods/` (entire directory)
- `graphs/atris.ts` (commented out design doc, extract ideas first)
- `app/tools/tool_repository/utils/extractionUtils/` (duplicated logic)

**Keep and refactor:**
- `graphs/atrisrevision.ts` → `graphs/atris.ts`
- `app/tools/tool_repository/toolfiles/` (consolidate)

## Phase 2: MCP Server Implementation (Week 2-3)

### 2.1 Create MCP Server Structure

```
mcp-servers/
├── audius/
│   ├── index.ts        # Server entry point
│   ├── tools/          # Tool definitions
│   │   ├── tracks.ts
│   │   ├── users.ts
│   │   └── playlists.ts
│   ├── resources/      # Resource definitions
│   │   └── trending.ts
│   └── prompts/        # Prompt templates
│       └── analyze.ts
└── package.json        # Separate package for MCP server
```

### 2.2 Implement Core Tools

**Priority tools (must have):**
- `search_tracks` - Search tracks by query
- `get_trending_tracks` - Get trending with genre/time filters
- `get_track_details` - Get full track info
- `get_user_by_handle` - Get user profile
- `get_user_tracks` - Get tracks by user
- `search_playlists` - Search playlists
- `get_playlist_tracks` - Get tracks in playlist

**Secondary tools (nice to have):**
- `get_track_comments` - New in 2024
- `get_user_supporters` - Tipping data
- `get_genre_trending` - Genre-specific trending
- `calculate_artist_popularity` - Custom Pareto calculation

### 2.3 Test MCP Server Standalone

```bash
# Run MCP server in stdio mode
npx ts-node mcp-servers/audius/index.ts

# Test with MCP Inspector (if available)
npx @modelcontextprotocol/inspector mcp-servers/audius/index.ts
```

## Phase 3: LangGraph Rebuild (Week 3-4)

### 3.1 New Graph Architecture

```typescript
// graphs/atris.ts
import { StateGraph, START, END } from "@langchain/langgraph";
import { AtrisAnnotation } from "../types/state";

const workflow = new StateGraph(AtrisAnnotation)
  // Node definitions using new pattern
  .addNode({
    classifyQuery,
    executeWithMcp,
    formatResponse,
    handleError
  })

  // Entry point
  .addEdge(START, "classifyQuery")

  // Conditional routing based on query type
  .addConditionalEdges("classifyQuery", routeByQueryType, {
    entity: "executeWithMcp",
    rag: "executeWithMcp",  // MCP handles both
    web: "executeWithMcp",
    bad: "handleError"
  })

  // Format all responses
  .addEdge("executeWithMcp", "formatResponse")
  .addEdge("handleError", "formatResponse")
  .addEdge("formatResponse", END);

export const graph = workflow.compile();
```

### 3.2 Node Implementations

```typescript
// nodes/classifyQuery.ts
import { ChatOpenAI } from "@langchain/openai";
import { AtrisState } from "../types/state";

const classifier = new ChatOpenAI({ model: "gpt-4o-mini" });

export async function classifyQuery(state: AtrisState) {
  const response = await classifier.invoke([
    { role: "system", content: CLASSIFICATION_PROMPT },
    { role: "user", content: state.query }
  ]);

  const classification = JSON.parse(response.content);

  return {
    queryType: classification.queryType,
    entityType: classification.entityType
  };
}

// nodes/executeWithMcp.ts
import { mcpClient } from "../mcp/client";

export async function executeWithMcp(state: AtrisState) {
  // Get appropriate tool based on query type
  const toolName = getToolForQuery(state.queryType, state.entityType);
  const params = extractParams(state.query);

  const result = await mcpClient.callTool(toolName, params);

  return {
    apiResult: result,
    messages: [...state.messages, { role: "assistant", content: result }]
  };
}
```

### 3.3 Error Recovery Implementation

```typescript
// nodes/handleError.ts
import { AtrisState } from "../types/state";

export async function handleError(state: AtrisState) {
  const lastMessage = state.messages[state.messages.length - 1];

  // Attempt recovery strategies
  if (isRateLimitError(lastMessage)) {
    await delay(1000);
    return { retry: true };
  }

  if (isNotFoundError(lastMessage)) {
    return {
      context: "The requested item was not found on Audius.",
      queryType: "web"  // Fall back to web search
    };
  }

  return {
    context: "I apologize, but I encountered an error processing your request."
  };
}
```

## Phase 4: API Routes & Frontend (Week 4-5)

### 4.1 Unified API Route

```typescript
// app/api/chat/route.ts
import { graph } from "@/graphs/atris";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1];

  const stream = await graph.stream(
    { query: lastMessage.content, messages },
    {
      streamMode: "messages",
      configurable: {
        thread_id: req.headers.get("x-thread-id") || crypto.randomUUID()
      }
    }
  );

  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          controller.enqueue(new TextEncoder().encode(
            JSON.stringify(chunk) + "\n"
          ));
        }
        controller.close();
      }
    }),
    { headers: { "Content-Type": "text/event-stream" } }
  );
}
```

### 4.2 Simplify Frontend

- Remove unused demo pages (`/agents`, `/retrieval_agents`)
- Consolidate to single chat interface
- Update `ChatWindow.tsx` for new streaming format
- Add thread management for conversation persistence

## Phase 5: Testing & Documentation (Week 5-6)

### 5.1 Test Structure

```
__tests__/
├── unit/
│   ├── nodes/
│   │   ├── classifyQuery.test.ts
│   │   ├── executeWithMcp.test.ts
│   │   └── formatResponse.test.ts
│   └── mcp/
│       └── audius-server.test.ts
├── integration/
│   ├── graph.test.ts
│   └── api.test.ts
└── e2e/
    └── chat.test.ts
```

### 5.2 Key Test Cases

```typescript
// __tests__/unit/nodes/classifyQuery.test.ts
describe("classifyQuery", () => {
  it("classifies trending track queries correctly", async () => {
    const state = { query: "What are the top 10 trending tracks?" };
    const result = await classifyQuery(state);
    expect(result.queryType).toBe("entity");
    expect(result.entityType).toBe("track");
  });

  it("identifies user queries", async () => {
    const state = { query: "Tell me about the artist deadmau5" };
    const result = await classifyQuery(state);
    expect(result.queryType).toBe("entity");
    expect(result.entityType).toBe("user");
  });
});
```

## Final File Structure

```
atrisbetatwo/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Single unified route
│   └── page.tsx                  # Main chat UI
├── components/
│   ├── ChatWindow.tsx
│   └── MessageBubble.tsx
├── graphs/
│   └── atris.ts                  # Main LangGraph implementation
├── nodes/
│   ├── classifyQuery.ts
│   ├── executeWithMcp.ts
│   ├── formatResponse.ts
│   └── handleError.ts
├── mcp-servers/
│   └── audius/
│       ├── index.ts
│       ├── tools/
│       └── resources/
├── types/
│   └── state.ts                  # Simplified state types
├── lib/
│   ├── mcp-client.ts            # MCP client setup
│   └── prompts.ts               # System prompts
├── constants/
│   └── mappings.ts              # Genre/mood mappings
├── __tests__/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── package.json
└── README.md
```

## Lines of Code Reduction Estimate

| Component | Current LOC | Target LOC | Reduction |
|-----------|-------------|------------|-----------|
| SDK Wrapper | ~800 | 0 | -800 (use native) |
| Entity Methods | ~600 | 0 | -600 (MCP tools) |
| Graph Implementation | ~500 | ~200 | -300 |
| State Definitions | ~150 | ~40 | -110 |
| Tool Utilities | ~1200 | ~300 | -900 |
| **Total** | **~3250** | **~540** | **-83%** |

## Success Metrics

1. **Functional**: All current query types work with new implementation
2. **Performance**: Response time < 3s for trending queries
3. **Maintainability**: < 1000 LOC for core agent logic
4. **Extensibility**: New tools added via MCP in < 50 LOC each
5. **Reliability**: Error recovery for common failures
6. **Testability**: > 80% code coverage

---

## Quick Start Commands

```bash
# 1. Update dependencies
npm install @langchain/langgraph@^1.0.0 @audius/sdk@^11.3.0 @modelcontextprotocol/sdk@latest

# 2. Start MCP server (development)
npx ts-node mcp-servers/audius/index.ts

# 3. Run tests
npm test

# 4. Start development server
npm run dev

# 5. Build for production
npm run build
```

---

## Conclusion

This refactoring plan transforms Atris from a partially-implemented prototype into a modern, production-ready AI agent by:

1. **Modernizing LangGraph** to v1.0 patterns with proper state management
2. **Updating Audius SDK** from v7 to v11 with native methods
3. **Introducing MCP** for standardized tool access
4. **Eliminating duplication** through consolidation
5. **Adding proper testing** for reliability

The result will be a cleaner, more maintainable codebase that's aligned with current best practices and ready for future extensions.
