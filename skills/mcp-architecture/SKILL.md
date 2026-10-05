---
name: mcp-architecture
description: Fundamentals of the Model Context Protocol (MCP) for connecting agents to data and tools - host, client and server roles over JSON-RPC 2.0, the three server capabilities (resources, tools, prompts), minimal Python and TypeScript servers, client configuration, and security basics (OAuth scopes, input validation, rate limiting, audit logging), with aggregation, caching, streaming, metrics and testing in references/. Use when explaining MCP to a team, deciding whether to build a server or reuse an existing one, sketching a first server, or wiring a server into a client such as Claude Desktop. Trigger on "what is MCP", "MCP server", "MCP resources", "MCP tools vs prompts", "build an MCP server", "mcpServers", "MCP OAuth". Check protocol details against the current specification revision (2026-07-28 per SOUL.md) at https://modelcontextprotocol.io/specification/latest. For server design patterns and multi-server setups see mcp-2025-patterns.
metadata:
  version: "1.2.0"
  asOf: "2026-10-05"
  contentAsOf: "2026-01-06"
  scope: reference
---

# MCP architecture

Content as of 2026-01-06. The original "MCP Spec 1.0" label predates the dated specification
revisions the protocol now publishes; this repository cites revision 2026-07-28
(https://modelcontextprotocol.io/specification/latest, read 2026-10-05 per `SOUL.md`). SDK calls,
server package names and model IDs below were not re-checked on 2026-10-05; confirm them on the
official repositories (https://github.com/modelcontextprotocol) before quoting.

## Purpose
Build standardized, reusable integrations between AI systems and data sources with the Model Context Protocol, replacing one-off N×M integrations.

## What is MCP?

### Model Context Protocol
An open standard announced by Anthropic in November 2024 (https://www.anthropic.com/news/model-context-protocol) for connecting AI systems to external data sources and tools through one protocol.

**The Problem:** N agents × M tools = N×M custom integrations
**The Solution:** N agents + M MCP servers = N+M integrations (any agent uses any tool)

## Architecture

```
┌─────────────┐
│  MCP Host   │  (Claude Desktop, IDEs, Apps)
│   ┌─────┐   │
│   │Client│──┼──┐
│   └─────┘   │  │
└─────────────┘  │
                 │ JSON-RPC 2.0
                 │
┌────────────────┼─────────────┐
│  MCP Server    ▼             │
│  ┌──────────────────┐        │
│  │  Resources       │        │
│  │  Tools           │        │
│  │  Prompts         │        │
│  └──────────────────┘        │
│         │                    │
│         ▼                    │
│  ┌──────────────────┐        │
│  │ Data Source      │        │
│  │ (DB, API, Files) │        │
│  └──────────────────┘        │
└─────────────────────────────┘
```

## Three Core Capabilities

### 1. Resources
**Purpose:** Expose data for AI to read

**Examples:**
- File contents
- Database records
- API responses
- Documentation

**Definition:**
```json
{
  "resources": [
    {
      "uri": "file:///docs/api-spec.md",
      "name": "API Specification",
      "mimeType": "text/markdown"
    },
    {
      "uri": "db://customers/12345",
      "name": "Customer Record",
      "mimeType": "application/json"
    }
  ]
}
```

### 2. Tools
**Purpose:** Functions AI can invoke

**Examples:**
- Query database
- Call external API
- Process files
- Execute commands

**Definition:**
```json
{
  "tools": [
    {
      "name": "query_database",
      "description": "Execute SQL query on customer database",
      "inputSchema": {
        "type": "object",
        "properties": {
          "query": {"type": "string"}
        },
        "required": ["query"]
      }
    }
  ]
}
```

### 3. Prompts
**Purpose:** Reusable prompt templates

**Examples:**
- Common task patterns
- Domain-specific workflows
- Best practice templates

**Definition:**
```json
{
  "prompts": [
    {
      "name": "analyze_customer",
      "description": "Analyze customer behavior and generate insights",
      "arguments": [
        {
          "name": "customer_id",
          "description": "Customer identifier",
          "required": true
        }
      ]
    }
  ]
}
```

## Building MCP Servers

### Python Server Example
```python
from mcp import Server, Tool, Resource

server = Server("customer-data")

@server.resource("customer://")
async def get_customer(uri: str):
    """Expose customer data as resources"""
    customer_id = uri.split("://")[1]
    return {
        "uri": uri,
        "mimeType": "application/json",
        "text": json.dumps(get_customer_data(customer_id))
    }

@server.tool()
async def query_customers(
    filters: dict
) -> list:
    """Query customer database"""
    return database.query("customers", filters)

@server.prompt()
async def customer_analysis(customer_id: str):
    """Generate customer analysis prompt"""
    return {
        "messages": [
            {
                "role": "user",
                "content": f"Analyze customer {customer_id} behavior and provide insights"
            }
        ]
    }

if __name__ == "__main__":
    server.run()
```

### TypeScript Server Example
```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
  name: "github-server",
  version: "1.0.0"
}, {
  capabilities: {
    resources: {},
    tools: {},
    prompts: {}
  }
});

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "github://issues",
        name: "GitHub Issues",
        mimeType: "application/json"
      }
    ]
  };
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create_issue",
        description: "Create a new GitHub issue",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            body: { type: "string" }
          }
        }
      }
    ]
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

## Common MCP Servers

### Early reference servers

As of 2026-01-06 [UNVERIFIED]. The protocol project maintains a small set of reference servers at
https://github.com/modelcontextprotocol/servers and moved several early ones to
https://github.com/modelcontextprotocol/servers-archived; many services now publish their own
servers (Stripe and GitHub among them). Check both repositories, or the provider's own docs, before
recommending any server below.

- **GitHub** - Issues, PRs, repos
- **Slack** - Messages, channels
- **Google Drive** - Files, docs
- **PostgreSQL** - Database queries
- **Puppeteer** - Web scraping
- **Git** - Repository operations
- **Stripe** - Payment data

### Installing reference servers
```bash
# Via npm
npx @modelcontextprotocol/server-github

# Via Docker
docker run mcp-postgres-server

# Via Python
pip install mcp-server-slack
python -m mcp_server_slack
```

## Client Integration

### Claude Desktop Configuration
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "your-token"
      }
    },
    "postgres": {
      "command": "docker",
      "args": ["run", "mcp-postgres-server"],
      "env": {
        "DATABASE_URL": "postgresql://..."
      }
    }
  }
}
```

### Claude SDK Integration

Illustrative only, as of 2026-01-06 [UNVERIFIED]. The Messages API connects to remote MCP servers
by URL through its MCP connector, not by launching a local command; see
https://docs.anthropic.com/en/docs/agents-and-tools/mcp-connector for the current parameter shape
and model IDs (https://docs.anthropic.com/en/docs/about-claude/models).

```python
from anthropic import Anthropic

client = Anthropic()

response = client.messages.create(
    model="claude-sonnet-4-5",
    mcp_servers={
        "github": {
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-github"]
        }
    },
    messages=[{
        "role": "user",
        "content": "List my GitHub issues"
    }]
)
```

## Security Best Practices

### Authentication
```python
# OAuth 2.0 with Resource Indicators (RFC 8707)
server = Server(
    "secure-api",
    auth_type="oauth2",
    scopes=["read:data", "write:data"]
)

@server.tool(required_scope="write:data")
async def update_record(record_id: str, data: dict):
    # Only callable with write permissions
    pass
```

### Input Validation
```python
@server.tool()
async def execute_query(query: str):
    # Validate to prevent injection
    if not is_safe_query(query):
        raise ValueError("Unsafe query detected")

    # Sanitize inputs
    safe_query = sanitize_sql(query)
    return database.execute(safe_query)
```

### Rate Limiting
```python
from functools import lru_cache
from time import time

@server.tool()
@rate_limit(calls=10, period=60)  # 10 calls per minute
async def expensive_operation():
    pass
```

### Audit Logging
```python
@server.tool()
async def sensitive_operation(data: dict):
    audit_log.write({
        "timestamp": datetime.now(),
        "operation": "sensitive_operation",
        "user": current_user(),
        "data": data
    })
    return process(data)
```

## Advanced patterns, monitoring and testing

Multi-source aggregation, caching, streaming large results, Prometheus metrics, error tracking, and unit and integration tests are in [advanced patterns, observability and testing](references/advanced-observability-testing.md).

## Decision Framework

**Build MCP Server when:**
- Creating reusable data/tool integration
- Want AI agents to access your data
- Need standardized interface across frameworks
- Building for ecosystem (others can use your server)

**Use existing MCP Server when:**
- Connecting to GitHub, Slack, Drive, Postgres, etc.
- Standard data sources with official servers
- Prototyping quickly

## Resources

**Official:**
- Specification: https://modelcontextprotocol.io/specification
- GitHub: https://github.com/modelcontextprotocol
- Server Registry: https://github.com/modelcontextprotocol/servers

**SDKs:**
- Python: `pip install mcp`
- TypeScript: `npm install @modelcontextprotocol/sdk`

## Changelog

- 1.2.0: frontmatter to agentskills.io spec, stale figures dated and sourced, depth moved to references/.
- 1.1.0: updated for MCP Spec 1.0.
