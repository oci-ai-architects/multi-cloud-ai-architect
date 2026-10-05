# MCP server performance, error handling and testing

Moved from SKILL.md on 2026-10-05. Content as of 2026-01-06; library APIs in the snippets (lru-cache, p-map, vitest) were not re-checked.

## Performance Patterns

### Pattern 1: Connection Pooling
```typescript
// Reuse connections across requests
const pool = new ConnectionPool({
  max: 10,
  idleTimeout: 30000
});

server.addTool("db_query", async (params) => {
  const conn = await pool.acquire();
  try {
    return await conn.query(params.sql);
  } finally {
    pool.release(conn);
  }
});
```

### Pattern 2: Caching
```typescript
import { LRUCache } from "lru-cache";

const cache = new LRUCache({
  max: 1000,
  ttl: 1000 * 60 * 5 // 5 minutes
});

server.addTool("get_user", async (params) => {
  const cacheKey = `user:${params.id}`;

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // Fetch and cache
  const user = await fetchUser(params.id);
  cache.set(cacheKey, user);
  return user;
});
```

### Pattern 3: Batch Operations
```typescript
// Support batch operations to reduce round trips
server.addTool("batch_create_issues", async (params) => {
  const { issues } = params;

  // Process in parallel with concurrency limit
  const results = await pMap(
    issues,
    issue => createIssue(issue),
    { concurrency: 5 }
  );

  return {
    created: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results
  };
});
```

---

## Error Handling

### Structured Error Responses
```typescript
class MCPError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.code = code;
    this.details = details;
  }

  toResponse() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        recoverable: this.isRecoverable(),
        suggested_action: this.getSuggestedAction()
      }
    };
  }
}

// Usage
throw new MCPError(
  "RATE_LIMITED",
  "GitHub API rate limit exceeded",
  {
    limit: 5000,
    remaining: 0,
    reset_at: "2025-12-19T12:00:00Z"
  }
);
```

### Graceful Degradation
```typescript
server.addTool("enriched_search", async (params) => {
  const results = await primarySearch(params);

  // Try to enrich, but don't fail if enrichment fails
  try {
    return await enrichResults(results);
  } catch (enrichError) {
    console.warn("Enrichment failed, returning basic results", enrichError);
    return {
      ...results,
      enrichment_status: "failed",
      enrichment_error: enrichError.message
    };
  }
});
```

---

## Testing Patterns

### Unit Testing Tools
```typescript
import { describe, it, expect, vi } from "vitest";

describe("create_issue tool", () => {
  it("creates issue with valid params", async () => {
    const mockGithub = vi.fn().mockResolvedValue({
      number: 123,
      html_url: "https://github.com/..."
    });

    const result = await createIssueTool({
      owner: "test",
      repo: "test-repo",
      title: "Test issue"
    }, { github: mockGithub });

    expect(result.success).toBe(true);
    expect(result.issue.number).toBe(123);
  });

  it("validates required params", async () => {
    await expect(createIssueTool({ owner: "test" }))
      .rejects.toThrow("Missing required: repo, title");
  });
});
```

### Integration Testing
```typescript
describe("MCP Server Integration", () => {
  let server;
  let client;

  beforeAll(async () => {
    server = await startMCPServer();
    client = await connectMCPClient(server.url);
  });

  it("lists available tools", async () => {
    const tools = await client.listTools();
    expect(tools).toContain("create_issue");
    expect(tools).toContain("list_repositories");
  });

  it("executes tool and returns result", async () => {
    const result = await client.callTool("health_check", {});
    expect(result.status).toBe("healthy");
  });
});
```
