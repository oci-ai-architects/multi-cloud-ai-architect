---
name: openai-agentkit
description: Reference for building multi-agent systems with OpenAI AgentKit (Agent Builder, Connector Registry, ChatKit, evals) and the OpenAI Agents SDK - agents, routines, handoffs, triage, sequential and parallel patterns, testing, monitoring and migration from Swarm. Use when a design runs agents on OpenAI models, when choosing between the Agents SDK, LangGraph and the Claude Agent SDK, when designing handoff conditions and context passing, when porting legacy Swarm code, or when defining evals and traces for an OpenAI-based agent. Trigger on "AgentKit", "OpenAI Agents SDK", "Agent Builder", "ChatKit", "handoff", "Swarm migration", "triage agent". Content dates from 2026-01-06; confirm SDK names and versions on the linked OpenAI docs before quoting.
metadata:
  version: "1.2.0"
  asOf: "2026-10-05"
  contentAsOf: "2026-01-06"
  scope: reference
---

# OpenAI AgentKit and Agents SDK

Content as of 2026-01-06. Product names, SDK versions and model names below were not re-checked on
2026-10-05; confirm on the linked primary source before quoting. At that date the skill was written
against OpenAI Agents SDK 0.6.4 [UNVERIFIED]; current releases are listed at
https://github.com/openai/openai-agents-python/releases.

## Purpose
Guidance for building multi-agent systems with OpenAI AgentKit and the OpenAI Agents SDK.

## Platform overview

### OpenAI AgentKit
Platform for building, deploying and evaluating agents. Component list as of 2026-01-06
[UNVERIFIED], from the AgentKit announcement (https://openai.com/index/introducing-agentkit/).

**Core Components:**
- **Agent Builder** - Visual canvas for creating and versioning multi-agent workflows
- **Connector Registry** - Central management for data and tool connections
- **ChatKit** - Embeddable customizable chat-based agent experiences
- **Evaluation Suite** - Datasets, trace grading, automated prompt optimization
- **Multi-Model Support** - Third-party model integration capabilities

### Agents SDK (Production-Ready)
The Agents SDK is the production successor to the experimental Swarm framework
(https://github.com/openai/swarm describes itself as educational) [UNVERIFIED as of 2026-01-06].
Use the Agents SDK for production work.

**Migration note:** plan a migration for any legacy Swarm code you find.

## Core concepts

### 1. Agents
An Agent encapsulates:
- A set of instructions (system prompt)
- A set of functions/tools
- The capability to hand off execution to another Agent

**Design Principle:** Agents should be **lightweight and specialized** rather than monolithic and general-purpose.

### 2. Routines
A **routine** is a sequence of actions an agent can perform:
- Natural language instructions (via system prompt)
- Available tools needed to execute
- Context and state management
- Success criteria

**Think of it as:** A mini-workflow that an agent owns and executes autonomously.

### 3. Handoffs
**Handoffs** enable agent-to-agent transitions in execution flow.

**Key Pattern:** When an agent encounters a task outside its specialization, it hands off to a more appropriate agent.

**Example:**
```python
# Triage agent determines which specialist to use
if task.type == "refund":
    handoff_to(refund_agent)
elif task.type == "sales":
    handoff_to(sales_agent)
```

## Architectural patterns

### Pattern 1: Triage Pattern
**Use Case:** Routing requests to specialized sub-agents

**Structure:**
```
User Request → Triage Agent → [Determines Category] → Specialist Agent
```

**Example Implementation:**
```python
# Triage agent with handoff capabilities
triage_agent = Agent(
    name="Customer Service Triage",
    instructions="Analyze customer requests and route to appropriate specialist",
    functions=[analyze_request],
    handoffs=[refund_agent, sales_agent, support_agent]
)
```

**When to Use:**
- Multiple distinct capability domains
- Clear categorization logic
- Different agents need different tools/context

### Pattern 2: Sequential Orchestration
**Use Case:** Multi-step workflows where each step has a specialist

**Structure:**
```
Step 1 Agent → [Complete] → Handoff → Step 2 Agent → ... → Final Agent
```

**Example:**
```python
# Research → Analysis → Report Generation pipeline
research_agent → analysis_agent → report_agent
```

**When to Use:**
- Clear sequential dependencies
- Each step requires specialized expertise
- Output of one step feeds the next

### Pattern 3: Parallel Decomposition
**Use Case:** Breaking complex tasks into parallel subtasks

**Structure:**
```
Coordinator Agent
    ↓
    ├─→ Subtask Agent 1
    ├─→ Subtask Agent 2
    └─→ Subtask Agent 3
    ↓
Synthesis Agent (combines results)
```

**When to Use:**
- Independent subtasks can run concurrently
- Need to aggregate multiple perspectives
- Performance optimization through parallelization

## Best practices

### Agent design

**DO:**
✅ Keep agents focused on single responsibilities
✅ Provide clear, specific instructions in system prompts
✅ Define explicit handoff conditions
✅ Use descriptive agent names (helps with debugging)
✅ Test agents in isolation before integration

**DON'T:**
❌ Create monolithic "do-everything" agents
❌ Allow agents to communicate directly (use handoffs)
❌ Over-engineer with too many specialized agents
❌ Ignore error handling in handoffs
❌ Skip agent boundary testing

### Routine design

**Effective Routines:**
- Have clear entry and exit conditions
- Include error handling paths
- Specify required context/state
- Document expected inputs/outputs
- Define success metrics

**Example:**
```python
routine = {
    "name": "Process Refund",
    "entry": "User requests refund",
    "steps": [
        "Verify order exists",
        "Check refund eligibility",
        "Calculate refund amount",
        "Process payment reversal",
        "Send confirmation"
    ],
    "exit": "Refund confirmed or rejection reason provided",
    "error_handling": "Escalate to human agent if verification fails"
}
```

### Handoff design

**Critical Elements:**
- **Clear Trigger Conditions** - When should handoff occur?
- **Context Passing** - What information transfers?
- **Return Path** - Can control return to originating agent?
- **Failure Handling** - What if target agent unavailable?

**Example:**
```python
def handoff_condition(state):
    """Determine if handoff needed"""
    if state.requires_specialized_knowledge:
        return specialist_agent
    if state.exceeds_authority_level:
        return supervisor_agent
    return None  # Continue with current agent
```

## Performance optimization

### Minimize LLM calls
**Principle:** Frameworks that limit LLM involvement and rely on predefined or direct execution flows operate more efficiently.

**Strategies:**
- Use deterministic logic where possible
- Cache common responses
- Batch similar requests
- Pre-compute decision trees
- Use smaller models for simple tasks

### Efficient tool use
**Principle:** Give agents only the tools they need for their specialty.

**Pattern:**
```python
# Specialized agents get targeted toolsets
refund_agent.tools = [verify_order, calculate_refund, process_payment]
sales_agent.tools = [check_inventory, create_quote, process_order]
# NOT: both agents get all 6 tools
```

### Latency reduction
- Prefer single-agent solutions when possible
- Use async operations for I/O-bound tasks
- Implement request coalescing
- Monitor and optimize hot paths

## Common anti-patterns

### 1. Over-Decomposition
**Problem:** Too many agents for simple tasks creates overhead

**Solution:** Start simple, add agents only when complexity demands it

### 2. Circular Handoffs
**Problem:** Agent A → Agent B → Agent A creates loops

**Solution:** Design clear hierarchy or state-based termination

### 3. Stateless Agents
**Problem:** Agents lose context across handoffs

**Solution:** Implement proper state management and context passing

### 4. Unclear Boundaries
**Problem:** Overlapping agent responsibilities cause conflicts

**Solution:** Define explicit agent domains and decision criteria

## Evaluation and testing

### Key metrics

**Agent-Level:**
- Task completion rate
- Average response time
- Tool usage efficiency
- Handoff accuracy

**System-Level:**
- End-to-end success rate
- Total latency
- Cost per interaction
- User satisfaction scores

### Testing strategy

**Unit Testing:**
```python
# Test individual agent behaviors
def test_refund_agent():
    result = refund_agent.process(valid_refund_request)
    assert result.status == "approved"
    assert result.amount > 0
```

**Integration Testing:**
```python
# Test agent handoffs
def test_triage_to_refund():
    initial_state = {"request": "I want a refund"}
    final_state = orchestrator.run(initial_state)
    assert final_state.handling_agent == "refund_agent"
    assert final_state.completed == True
```

**End-to-End Testing:**
```python
# Test full user journeys
def test_customer_journey():
    scenarios = load_test_scenarios()
    for scenario in scenarios:
        result = system.execute(scenario)
        assert result.meets_requirements()
```

## Production deployment

### Monitoring
**Essential Observability:**
- Agent invocation traces
- Handoff decision logs
- Tool call success rates
- Error patterns and frequencies
- Latency distributions

**Tools:**
- AgentKit built-in evaluation suite
- Custom logging to centralized system
- Real-time alerting on failures
- Performance dashboards

### Security

**Agent Security:**
- Scope tools to minimum required permissions
- Validate all tool inputs
- Sanitize user inputs before agent processing
- Implement rate limiting per agent
- Audit trail for all agent actions

**Data Protection:**
- Never expose sensitive data in prompts unnecessarily
- Use secure credential management
- Encrypt state/context storage
- Implement PII detection and masking

### Scaling strategies

**Horizontal Scaling:**
- Deploy agent instances across multiple servers
- Use load balancing for agent requests
- Implement agent pools for high-volume scenarios

**Vertical Optimization:**
- Profile and optimize slow agents
- Use caching strategically
- Batch similar requests
- Upgrade to more powerful models selectively

## Code examples

### Basic agent structure
```python
from openai import OpenAI

client = OpenAI()

# Illustrative shape only; check the Agents SDK docs for the current Agent class.
# Model name as of 2026-01-06 [UNVERIFIED]: https://platform.openai.com/docs/models
support_agent = {
    "name": "Technical Support Agent",
    "model": "gpt-4o",
    "instructions": """You are a technical support specialist.
    Help users troubleshoot technical issues.
    If issue requires refund, hand off to refund agent.
    If issue is sales-related, hand off to sales agent.""",
    "tools": [
        {"type": "function", "function": troubleshooting_guide},
        {"type": "function", "function": escalate_to_human}
    ]
}
```

### Handoff implementation
```python
def execute_agent_workflow(initial_request):
    current_agent = triage_agent
    context = {"request": initial_request, "history": []}

    while not is_complete(context):
        # Execute current agent
        response = client.chat.completions.create(
            model=current_agent.model,
            messages=build_messages(context, current_agent),
            tools=current_agent.tools
        )

        # Check for handoff
        next_agent = determine_handoff(response)
        if next_agent:
            context["history"].append({
                "from": current_agent.name,
                "to": next_agent.name
            })
            current_agent = next_agent
        else:
            context["result"] = response
            break

    return context
```

## Integration with other systems

### With Claude SDK
Use AgentKit for OpenAI-based workflows, Claude SDK for Anthropic-based workflows, and MCP to bridge data sources to both.

### With LangGraph
LangGraph provides more fine-grained control flow. Use AgentKit for simpler workflows, LangGraph for complex state machines.

### With MCP
AgentKit agents can consume MCP servers as tools, standardizing data source connections.

## Migration guide

### From Swarm to Agents SDK

**Key Changes:**
1. Replace `swarm.run()` with Agents SDK orchestration
2. Update agent definitions to new schema
3. Migrate handoff logic to production patterns
4. Add proper error handling
5. Implement monitoring and observability

**Timeline:** an earlier version gave a Q2 2025 deadline with no source; it was removed. Swarm's
maintenance status is `[OPEN]` until read on https://github.com/openai/swarm.

## Decision framework

**Use OpenAI AgentKit when:**
- Building on OpenAI models (current list: https://platform.openai.com/docs/models)
- Need visual agent builder for non-technical stakeholders
- Want integrated evaluation and monitoring
- Prefer managed platform over open-source frameworks

**Consider alternatives when:**
- Need model flexibility (use LangGraph)
- Require complex state machines (use LangGraph)
- Want full control over orchestration (use custom solution)
- Working with Anthropic models (use Claude SDK)

## Resources

**Official documentation:**
- Agents guide: https://platform.openai.com/docs/guides/agents
- Agents SDK (Python): https://openai.github.io/openai-agents-python/ and https://github.com/openai/openai-agents-python
- Agents SDK (TypeScript): https://github.com/openai/openai-agents-js
- AgentKit announcement: https://openai.com/index/introducing-agentkit/

**Community:**
- OpenAI Developer Forum: https://community.openai.com/

## Principles

1. **Simplicity First** - Start with single agents, add complexity only when needed
2. **Specialization Over Generalization** - Focused agents perform better
3. **Explicit Handoffs** - Clear routing beats implicit behavior
4. **Production-Ready** - Use Agents SDK, not Swarm, for real applications
5. **Measure Everything** - Observability is critical for multi-agent systems

## Changelog

- 1.2.0: frontmatter to agentskills.io spec, stale figures dated and sourced, nominative non-affiliated wording; wrong Agents SDK repository link and unsourced Swarm deadline replaced
- 1.1.0: updated for OpenAI Agents SDK 0.6.4 and GPT-5.2 (content as of 2026-01-06)
