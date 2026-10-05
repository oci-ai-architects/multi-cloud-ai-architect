---
name: claude-sdk
description: Reference for building agents with the Claude Agent SDK (Python and TypeScript) - computer use, built-in file, shell, search and web tools, MCP server integration, tool design rules, autonomous, human-in-the-loop and retry patterns, streaming, error handling, cost controls, security, testing and monitoring metrics, plus when to pick LangGraph or the OpenAI Agents SDK instead. Use when designing or reviewing an agent built on Anthropic models, wiring MCP servers into a Claude agent, writing tool schemas and descriptions, choosing between Claude model tiers, or comparing the Claude Agent SDK with other agent frameworks. Trigger on "Claude Agent SDK", "claude-agent-sdk", "computer use", "Claude tool calling", "MCP with Claude", "Anthropic agent".
metadata:
  version: "1.2.0"
  asOf: "2026-10-05"
  contentAsOf: "2026-01-06"
  scope: reference
  resources: resources/code-examples.py
---

# Claude Agent SDK

Content as of 2026-01-06. Model names, SDK versions and prices below were not re-checked on
2026-10-05; confirm on the linked primary source before quoting.

## Purpose
Build autonomous AI agents using Claude Agent SDK, leveraging computer use, tool orchestration, and MCP integration for production deployments.

## SDK Overview

### Claude Agent SDK (2026)
Enables building autonomous agents that control computers, write files, run commands, and iterate on work.

**Core Philosophy:** Give Claude a computer to unlock agent effectiveness beyond chat.

## Key Capabilities

### 1. Computer Use
Claude can control a computer environment:
- File system operations (read, write, edit)
- Terminal command execution
- Iterative debugging and refinement
- Multi-step autonomous workflows

**Use Cases:** Finance agents, personal assistants, customer support, development agents, research agents

### 2. Built-in Tools

| Category | Tools |
|----------|-------|
| **Files** | Read, Write, Edit |
| **Commands** | Bash |
| **Search** | Grep, Glob |
| **Web** | WebFetch, WebSearch |

### 3. MCP Integration
Define custom tools via Model Context Protocol servers.

**Benefits:**
- Standardized tool interface
- Reusable across agents
- Enterprise data connectivity

**Popular MCP Servers:** GitHub, Slack, PostgreSQL, MongoDB, Stripe, Salesforce

## Architecture Patterns

### Pattern 1: Autonomous Task Completion
Agent completes multi-step task without intervention.
```
User Request → Analyze → Subtasks → Execute Tools → Iterate → Result
```

### Pattern 2: Human-in-the-Loop
Agent proposes actions, waits for approval.
```
Task → Plan → Human Review → Approve? → Execute → Result
```

### Pattern 3: Iterative Refinement
Agent retries on errors automatically.
```
Attempt 1 → Error → Analyze → Attempt 2 → Success
```

**See:** `resources/code-examples.py` for full implementations

## Tool Design Best Practices

### DO
- Provide tools relevant to the task
- Use clear, descriptive names
- Write detailed descriptions (Claude reads these!)
- Define strict input schemas
- Implement error handling
- Return structured outputs

### DON'T
- Give agents unnecessary tools
- Use ambiguous names ("handler", "processor")
- Skip input validation
- Return raw errors without context
- Hide side effects

**See:** `resources/code-examples.py` for good/bad tool examples

## MCP Integration

### Connecting MCP Servers
```python
mcp_config = {
    "servers": {
        "github": {
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-github"],
            "env": {"GITHUB_TOKEN": os.getenv("GITHUB_TOKEN")}
        }
    }
}
```

**Full example:** `resources/code-examples.py`

## Production Best Practices

### 1. Streaming
Show real-time progress to build user trust.

### 2. Error Handling
- Catch API errors, rate limits, tool failures
- Implement fallbacks and retries
- Log errors for debugging

### 3. Cost Optimization
- Use Haiku for simple tasks, Sonnet for complex
- Cache repetitive contexts
- Batch similar requests
- Monitor token usage

### 4. Security
- Restrict file/command access
- Sanitize dangerous inputs
- Audit all agent actions
- Validate tool outputs

**Implementation:** `resources/code-examples.py`

## Model selection (as of 2026-01-06)

As of 2026-01-06 [UNVERIFIED]. Source: https://docs.anthropic.com/en/docs/about-claude/models and
https://www.anthropic.com/pricing. Model ids and prices change; read both pages before quoting.

| Model | Best For | Pricing (per M tokens) | Speed |
|-------|----------|------------------------|-------|
| **claude-opus-4-5** | Flagship reasoning, complex agents, highest accuracy | $5 in / $25 out | Slower |
| **claude-sonnet-4-5** | Best balance - coding, agents, computer use | $3 in / $15 out | Medium |
| **Haiku tier** | Simple tasks, format conversions, high-throughput | [OPEN] the earlier row named a model id (`claude-haiku-4`) and price that do not match the models page; read it for the current Haiku id and price | Fast |

**Note**: Anthropic reported 80.9% for Opus 4.5 on SWE-bench Verified (vendor figure, not
reproduced here; source https://www.anthropic.com/news/claude-opus-4-5, as of 2026-01-06
[UNVERIFIED]). Sonnet 4.5 supported a 1M token context behind a beta header as of 2026-01-06
(source https://docs.anthropic.com/en/docs/build-with-claude/context-windows [UNVERIFIED]).

## Testing Agents

### Unit Testing
Test individual tools in isolation.

### Integration Testing
Test agent workflows with multiple tools.

### Evaluation Framework
Measure accuracy, latency, tool efficiency.

**Examples:** `resources/code-examples.py`

## Monitoring Metrics

| Metric | Description |
|--------|-------------|
| Tool Call Success Rate | % of tool invocations succeeding |
| Task Completion Rate | % of requests fully resolved |
| Average Iterations | Tool calls per task |
| Latency | Time to complete requests |
| Token Usage | Input + output tokens |
| Error Rate | % of requests with errors |

## Decision Framework

### Use Claude SDK when:
- Building on Anthropic models
- Need computer use capabilities
- Want production-ready agent framework
- Require MCP integration
- Building autonomous agents

### Consider alternatives when:
- Committed to OpenAI ecosystem → AgentKit
- Need visual agent builder → AgentKit
- Require complex state machines → LangGraph
- Want full OSS control → AutoGen/LangGraph

## Resources

**Documentation:**
- [Agent SDK Docs](https://docs.claude.com/en/api/agent-sdk)
- [Computer Use Guide](https://docs.anthropic.com/en/docs/agents/computer-use)
- [MCP Integration](https://modelcontextprotocol.io)

**GitHub:**
- [Python SDK](https://github.com/anthropics/claude-agent-sdk-python)
- [TypeScript SDK](https://github.com/anthropics/claude-agent-sdk-typescript)

## Key Principles

1. **Computer use matters** - Leverage file/bash capabilities fully
2. **Tools are First-Class** - Design tools as carefully as prompts
3. **MCP for Data** - Use MCP servers for enterprise connectivity
4. **Stream for UX** - Real-time feedback builds trust
5. **Security Always** - Validate inputs, restrict permissions, audit
6. **Right Model for Task** - Haiku for simple, Sonnet for complex

## Changelog

- 1.2.0: frontmatter to agentskills.io spec, stale figures dated and sourced, depth moved to references/.
- 1.1.0: content as of 2026-01-06 (Claude Opus 4.5, Sonnet 4.5).
