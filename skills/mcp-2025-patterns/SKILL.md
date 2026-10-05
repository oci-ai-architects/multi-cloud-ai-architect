---
name: mcp-2025-patterns
description: Design patterns for Model Context Protocol (MCP) servers and multi-server setups - single-responsibility servers, resource-first design, tool naming and input schemas, structured outputs, credential isolation, input validation, rate limiting, audit logging, server composition, cross-server workflows and health checks, with performance, error-handling and testing patterns in references/. Use when designing a new MCP server, reviewing an existing server's tool surface or security, composing several MCP servers for one agent, or writing tests for MCP tools. Trigger on "MCP server design", "MCP tool naming", "MCP security", "multi-server MCP", "mcpServers config", "MCP rate limiting", "test an MCP tool". Patterns predate the dated MCP specification revisions; check protocol details against the current revision (2026-07-28 per SOUL.md) at https://modelcontextprotocol.io/specification/latest. For resources, prompts and transport basics see mcp-architecture.
metadata:
  version: "1.2.0"
  asOf: "2026-10-05"
  contentAsOf: "2026-01-06"
  scope: reference
---

# MCP server design patterns

Content as of 2026-01-06. The original "MCP Specification 1.0" label predates the dated
specification revisions the protocol now publishes; the current revision cited in this repository
is 2026-07-28 (https://modelcontextprotocol.io/specification/latest, read 2026-10-05 per `SOUL.md`).
SDK class names in the snippets (`MCPServer`, `addTool`) are illustrative pseudocode and were not
re-checked against the official SDKs (https://github.com/modelcontextprotocol); confirm before
copying.

---

## MCP Architecture Fundamentals

### Core Concepts
```
┌─────────────────────────────────────────────────────────────┐
│                    Claude Code (Host)                        │
├─────────────────────────────────────────────────────────────┤
│  MCP Client Layer                                           │
│  ├── Server Discovery & Connection                          │
│  ├── Tool Registration & Invocation                         │
│  ├── Resource Management                                    │
│  └── Prompt Templates                                       │
├─────────────────────────────────────────────────────────────┤
│  MCP Servers (Multiple)                                     │
│  ├── github-mcp (repositories, issues, PRs)                 │
│  ├── notion-mcp (pages, databases, blocks)                  │
│  ├── linear-mcp (issues, projects, cycles)                  │
│  ├── custom-mcp (your domain-specific tools)                │
│  └── ...                                                    │
└─────────────────────────────────────────────────────────────┘
```

### MCP Server Components

1. **Tools**: Functions the AI can invoke
2. **Resources**: Data the AI can read
3. **Prompts**: Template prompts for common tasks
4. **Notifications**: Server-to-client events

---

## Server Design Patterns

### Pattern 1: Single Responsibility Server
```typescript
// Good: Focused server for one domain
const server = new MCPServer({
  name: "github-mcp",
  version: "1.0.0"
});

// Tools all relate to GitHub
server.addTool("create_issue", createIssueHandler);
server.addTool("list_pulls", listPullsHandler);
server.addTool("merge_pr", mergePRHandler);
```

### Pattern 2: Resource-First Design
```typescript
// Define resources before tools
server.addResource({
  uri: "github://repos/{owner}/{repo}",
  name: "Repository",
  description: "GitHub repository data and metadata",
  mimeType: "application/json"
});

// Tools operate on resources
server.addTool({
  name: "get_repo",
  description: "Fetch repository details",
  inputSchema: {
    type: "object",
    properties: {
      owner: { type: "string" },
      repo: { type: "string" }
    },
    required: ["owner", "repo"]
  }
});
```

### Pattern 3: Hierarchical Tool Organization
```typescript
// Organize tools by domain/action
const tools = {
  // Issues domain
  "issues_create": createIssue,
  "issues_update": updateIssue,
  "issues_list": listIssues,
  "issues_close": closeIssue,

  // PRs domain
  "pulls_create": createPR,
  "pulls_merge": mergePR,
  "pulls_review": reviewPR,

  // Repos domain
  "repos_list": listRepos,
  "repos_create": createRepo
};
```

---

## Tool Design Best Practices

### Clear, Action-Oriented Names
```typescript
// Good: Clear action + noun
"create_issue"
"list_repositories"
"merge_pull_request"
"search_code"

// Bad: Vague or ambiguous
"do_github"
"handle_request"
"process_data"
```

### Comprehensive Input Schemas
```typescript
server.addTool({
  name: "create_issue",
  description: "Create a new GitHub issue with title, body, labels, and assignees",
  inputSchema: {
    type: "object",
    properties: {
      owner: {
        type: "string",
        description: "Repository owner (user or org)"
      },
      repo: {
        type: "string",
        description: "Repository name"
      },
      title: {
        type: "string",
        description: "Issue title",
        minLength: 1,
        maxLength: 256
      },
      body: {
        type: "string",
        description: "Issue body (Markdown supported)"
      },
      labels: {
        type: "array",
        items: { type: "string" },
        description: "Labels to apply"
      },
      assignees: {
        type: "array",
        items: { type: "string" },
        description: "GitHub usernames to assign"
      }
    },
    required: ["owner", "repo", "title"]
  }
});
```

### Structured Output Formats
```typescript
// Return structured, predictable data
async function createIssue(params) {
  const issue = await github.issues.create({...});

  return {
    success: true,
    issue: {
      number: issue.number,
      url: issue.html_url,
      title: issue.title,
      state: issue.state,
      created_at: issue.created_at
    },
    // Include actionable next steps
    suggested_actions: [
      `Add labels: /api/issues/${issue.number}/labels`,
      `Assign team: /api/issues/${issue.number}/assignees`
    ]
  };
}
```

---

## Security Patterns

### Pattern 1: Credential Isolation
```typescript
// Store credentials in environment, not code
const server = new MCPServer({
  name: "secure-server"
});

// Validate env vars at startup
const requiredEnv = ["API_KEY", "API_SECRET"];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

// Never log or expose credentials
server.addTool("secure_action", async (params) => {
  // Use env vars directly, never pass as params
  const client = new APIClient({
    key: process.env.API_KEY // Not from params
  });
});
```

### Pattern 2: Input Validation
```typescript
import { z } from "zod";

const CreateIssueSchema = z.object({
  owner: z.string().regex(/^[a-zA-Z0-9-]+$/),
  repo: z.string().regex(/^[a-zA-Z0-9._-]+$/),
  title: z.string().min(1).max(256),
  body: z.string().max(65536).optional()
});

server.addTool("create_issue", async (params) => {
  // Validate before processing
  const validated = CreateIssueSchema.parse(params);

  // Safe to use validated data
  return await github.issues.create(validated);
});
```

### Pattern 3: Rate Limiting
```typescript
import { RateLimiter } from "rate-limiter";

const limiter = new RateLimiter({
  tokensPerInterval: 100,
  interval: "minute"
});

server.addTool("api_call", async (params) => {
  // Check rate limit before proceeding
  if (!await limiter.tryRemoveTokens(1)) {
    return {
      success: false,
      error: "Rate limit exceeded. Try again in a minute.",
      retry_after: 60
    };
  }

  return await performAPICall(params);
});
```

### Pattern 4: Audit Logging
```typescript
server.addTool("sensitive_action", async (params, context) => {
  // Log all sensitive operations
  await auditLog({
    action: "sensitive_action",
    params: sanitize(params), // Remove secrets
    user: context.user,
    timestamp: new Date().toISOString(),
    result: "pending"
  });

  try {
    const result = await performAction(params);
    await auditLog.update({ result: "success" });
    return result;
  } catch (error) {
    await auditLog.update({ result: "error", error: error.message });
    throw error;
  }
});
```

---

## Multi-Server Orchestration

### Pattern 1: Server Composition
```typescript
// In Claude Code settings, compose servers:
{
  "mcpServers": {
    "github": {
      "command": "mcp-github",
      "env": { "GITHUB_TOKEN": "..." }
    },
    "linear": {
      "command": "mcp-linear",
      "env": { "LINEAR_API_KEY": "..." }
    },
    "notion": {
      "command": "mcp-notion",
      "env": { "NOTION_TOKEN": "..." }
    }
  }
}
```

### Pattern 2: Cross-Server Workflows
```markdown
When handling complex tasks, coordinate across servers:

1. Get issue from GitHub (github-mcp)
2. Create linked Linear ticket (linear-mcp)
3. Update project doc in Notion (notion-mcp)
4. Comment back on GitHub with links (github-mcp)

Claude orchestrates automatically based on task.
```

### Pattern 3: Server Health Monitoring
```typescript
// Each server should expose health endpoint
server.addTool("health_check", async () => {
  const checks = await Promise.all([
    checkAPIConnection(),
    checkDatabaseConnection(),
    checkCacheConnection()
  ]);

  return {
    status: checks.every(c => c.ok) ? "healthy" : "degraded",
    checks: checks,
    timestamp: new Date().toISOString()
  };
});
```

---

## Performance, error handling and testing

Connection pooling, caching, batch operations, structured error responses, graceful degradation, and unit and integration tests for tools are in [performance, errors and testing](references/performance-errors-testing.md). Load it when building or reviewing server internals.

---

## Worked example: one agent, several focused servers

A typical setup for an engineering agent composes one server per domain:

- **github**: repository management, issues, PRs
- **linear**: project management, issues, cycles
- **notion**: documentation, databases, pages
- **an image-generation server**: image generation
- **n8n**: workflow automation
- **playwright**: browser automation

Practices that keep such a setup manageable:

1. **Server per domain**: keep each server focused (GitHub for code, Linear for tasks).
2. **Consistent naming**: the host namespaces tools, for example Claude Code exposes them as `mcp__<server>__<action>`.
3. **Graceful fallbacks**: if a server is unavailable, the agent says so and suggests an alternative.
4. **Route by task**: tool descriptions say clearly which task each server owns, so the model picks the right one.

## Changelog

- 1.2.0: frontmatter to agentskills.io spec, stale figures dated and sourced, depth moved to references/.
- 1.1.0: updated for the MCP 1.0 stable spec and the Next.js 16.1 DevTools MCP server.
- 1.0.0: initial skill with 2025 MCP patterns and best practices.
