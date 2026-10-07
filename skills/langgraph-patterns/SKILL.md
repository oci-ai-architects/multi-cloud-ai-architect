---
name: langgraph-patterns
description: Patterns for building agent workflows with LangGraph - StateGraph nodes and edges, conditional routing, cycles with retry caps, parallel fan-out and fan-in, supervisor multi-agent graphs, checkpointing (memory, SQLite, Postgres), human-in-the-loop interrupts, streaming and tracing. Use when designing or reviewing a LangGraph agent, choosing between a graph state machine and a simpler agent loop, adding durable checkpoints or approval steps to an agent, or deciding whether LangGraph, the OpenAI Agents SDK, the Claude Agent SDK or the OCI ADK fits a workload. Trigger on "LangGraph", "StateGraph", "checkpointer", "interrupt", "human in the loop", "supervisor agent", "agent state machine", "langgraph.prebuilt". Prefer architect-method for the end-to-end design decision; this skill covers the LangGraph implementation layer.
metadata:
  version: "1.2.0"
  asOf: "2026-10-05"
  contentAsOf: "2026-01-06"
  scope: reference
---

# LangGraph patterns

Content as of 2026-01-06. Package versions, import paths and model IDs below were not re-checked on
2026-10-05; confirm them on the LangGraph docs (https://langchain-ai.github.io/langgraph/) and the
release notes (https://github.com/langchain-ai/langgraph/releases) before quoting.

## Purpose
Build LangGraph agents with fine-grained control, checkpointing, streaming and explicit state management.

## LangGraph 1.0

As of 2026-01-06 [UNVERIFIED]: LangGraph 1.0 was released as generally available in October 2025,
and `langgraph-sdk` was at 0.3.1. Sources: https://github.com/langchain-ai/langgraph/releases and
https://blog.langchain.com/. LangChain's own announcement names production users; we have not
verified those claims and do not repeat them.

## Core philosophy

**LangGraph is** an orchestration framework with declarative and imperative APIs, focused on
control and durability for production agents. It provides low-level building blocks and leaves
composition to you.

**Breaking change in 1.0** (as of 2026-01-06 [UNVERIFIED], source:
https://github.com/langchain-ai/langgraph/releases): `langgraph.prebuilt` is deprecated in favour of
`langchain.agents` for prebuilt components. The `create_react_agent` examples below use the older
import and need that change on 1.0.

## The Six Production Features

1. **Parallelization** - Run multiple nodes concurrently
2. **Streaming** - Real-time partial outputs
3. **Checkpointing** - Pause/resume execution
4. **Human-in-the-Loop** - Approval/correction workflows
5. **Tracing** - Observability and debugging
6. **Task Queue** - Asynchronous job processing

## Graph-Based Architecture

```python
from langgraph.graph import StateGraph, END

# Define state
class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    next_action: str

# Create graph
graph = StateGraph(AgentState)

# Add nodes
graph.add_node("analyze", analyze_node)
graph.add_node("execute", execute_node)
graph.add_node("verify", verify_node)

# Define edges
graph.add_edge("analyze", "execute")
graph.add_conditional_edges(
    "execute",
    should_verify,
    {"yes": "verify", "no": END}
)

# Compile
app = graph.compile()
```

## Core Patterns

### Pattern 1: Agent with Tools
```python
from langgraph.prebuilt import create_react_agent

tools = [search_tool, calculator_tool, db_query_tool]

agent = create_react_agent(
    model=llm,
    tools=tools,
    checkpointer=MemorySaver()
)

# Run with streaming
for chunk in agent.stream({"messages": [("user", "Analyze sales data")]}):
    print(chunk)
```

### Pattern 2: Multi-Agent Collaboration
```python
# Supervisor coordinates specialist agents
supervisor_graph = StateGraph(SupervisorState)

supervisor_graph.add_node("supervisor", supervisor_node)
supervisor_graph.add_node("researcher", researcher_agent)
supervisor_graph.add_node("analyst", analyst_agent)
supervisor_graph.add_node("writer", writer_agent)

# Supervisor routes to specialists
supervisor_graph.add_conditional_edges(
    "supervisor",
    route_to_agent,
    {
        "research": "researcher",
        "analyze": "analyst",
        "write": "writer",
        "finish": END
    }
)
```

### Pattern 3: Human-in-the-Loop
```python
from langgraph.checkpoint.sqlite import SqliteSaver

checkpointer = SqliteSaver.from_conn_string("checkpoints.db")

graph = StateGraph(State)
graph.add_node("propose_action", propose)
graph.add_node("human_approval", interrupt())  # Pauses here
graph.add_node("execute_action", execute)

app = graph.compile(checkpointer=checkpointer)

# Run until human input needed
result = app.invoke(input, config={"configurable": {"thread_id": "123"}})

# Human reviews, then resume
app.invoke(None, config={"configurable": {"thread_id": "123"}})
```

## State Management

### Short-Term Memory (Session)
```python
class ConversationState(TypedDict):
    messages: Annotated[list, add_messages]
    context: dict

checkpointer = MemorySaver()
app = graph.compile(checkpointer=checkpointer)

# Maintains context across turns
config = {"configurable": {"thread_id": "user_123"}}
app.invoke({"messages": [("user", "Hello")]}, config)
app.invoke({"messages": [("user", "What did I just say?")]}, config)
```

### Long-Term Memory (Persistent)
```python
from langgraph.checkpoint.postgres import PostgresSaver

checkpointer = PostgresSaver.from_conn_string(db_url)

# Persists across sessions
app = graph.compile(checkpointer=checkpointer)
```

## Advanced Control Flow

### Conditional Routing
```python
def route_next(state):
    if state["confidence"] > 0.9:
        return "approve"
    elif state["confidence"] > 0.5:
        return "review"
    else:
        return "reject"

graph.add_conditional_edges(
    "classifier",
    route_next,
    {
        "approve": "auto_approve",
        "review": "human_review",
        "reject": "reject_node"
    }
)
```

### Cycles and Loops
```python
def should_continue(state):
    if state["iterations"] < 3 and not state["success"]:
        return "retry"
    return "finish"

graph.add_conditional_edges(
    "process",
    should_continue,
    {"retry": "process", "finish": END}
)
```

### Parallel Execution
```python
from langgraph.graph import START

# Fan out to parallel nodes
graph.add_edge(START, ["agent_a", "agent_b", "agent_c"])

# Fan in to aggregator
graph.add_edge(["agent_a", "agent_b", "agent_c"], "synthesize")
```

## Production Deployment

### Streaming for UX
```python
async for event in app.astream_events(input, version="v2"):
    if event["event"] == "on_chat_model_stream":
        print(event["data"]["chunk"].content, end="")
```

### Error Handling
```python
def error_handler(state):
    try:
        return execute_risky_operation(state)
    except Exception as e:
        return {"error": str(e), "next": "fallback"}

graph.add_node("risky_op", error_handler)
graph.add_conditional_edges(
    "risky_op",
    lambda s: "fallback" if "error" in s else "success"
)
```

### Monitoring with LangSmith
```python
import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "..."

# All agent actions automatically logged to LangSmith
app.invoke(input)
```

## Best Practices

**DO:**
✅ Use checkpointing for long-running tasks
✅ Stream outputs for better UX
✅ Implement human approval for critical actions
✅ Use conditional edges for complex routing
✅ Leverage parallel execution when possible
✅ Monitor with LangSmith in production

**DON'T:**
❌ Use AgentExecutor (deprecated)
❌ Skip error handling on nodes
❌ Forget to set thread_id for stateful conversations
❌ Over-complicate graphs unnecessarily
❌ Ignore memory management for long conversations

## Integration Examples

Model IDs in these snippets are as of 2026-01-06 [UNVERIFIED]. Check current IDs at
https://docs.anthropic.com/en/docs/about-claude/models and https://platform.openai.com/docs/models.

### With Claude
```python
from langchain_anthropic import ChatAnthropic

llm = ChatAnthropic(model="claude-sonnet-4-5")
agent = create_react_agent(llm, tools)
```

### With OpenAI
```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o")
agent = create_react_agent(llm, tools)
```

### With MCP Servers
```python
from langchain_mcp import MCPTool

github_tool = MCPTool.from_server("github-mcp")
tools = [github_tool, ...]
agent = create_react_agent(llm, tools)
```

## Decision Framework

**Use LangGraph when:**
- Need fine-grained control over agent execution
- Building complex state machines
- Require human-in-the-loop workflows
- Want production-grade durability (checkpointing)
- Need to support multiple LLM providers

**Use alternatives when:**
- Want managed platform (use OpenAI AgentKit)
- Need visual builder (use AgentKit)
- Want simpler API (use Claude SDK directly)
- Building on OCI only (use the OCI ADK, see `oracle-adk`)

## Resources

- Docs: https://langchain-ai.github.io/langgraph/
- GitHub: https://github.com/langchain-ai/langgraph
- Tutorials: https://langchain-ai.github.io/langgraph/tutorials/

## Changelog

- 1.2.0: frontmatter to agentskills.io spec, stale figures dated and sourced, depth moved to references/ where needed.
- 1.1.0: updated for LangGraph 1.0 GA and langgraph-sdk 0.3.1.
