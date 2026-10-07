---
name: agentic-orchestration
description: Framework-neutral patterns for coordinating several AI agents - hierarchical, parallel and iterative task decomposition; explicit handoff payloads, capability-based routing and context compression at handoffs; conductor, pipeline, swarm and blackboard coordination models; retry with backoff, fallback agents and checkpoint-resume; structured logging, progress tracking and decision audit trails; a weighted-synthesis worked example; and the anti-patterns that make multi-agent systems fail. Use when deciding whether and how to split work across agents, designing the handoff contract between agents, choosing a coordination topology, adding recovery or observability to an agent workflow, or reviewing a multi-agent design for god agents, lost context or handoff loops. Trigger on "multi-agent", "agent orchestration", "orchestrator", "handoff", "task decomposition", "agent swarm", "blackboard", "agent team".
metadata:
  version: "1.2.0"
  asOf: "2026-10-05"
  contentAsOf: "2026-01-06"
  scope: reference
---

# Agentic orchestration patterns

Content as of 2026-01-06. The patterns here are framework-neutral; any framework named elsewhere in
this repository (LangGraph, OpenAI Agents SDK, Claude Agent SDK) was not re-checked on 2026-10-05,
so confirm versions on the framework's own release page before quoting.

Patterns for coordinating multiple AI agents, decomposing complex tasks, managing handoffs, and
building robust agent workflows. Start with the lowest level of complexity that meets the
requirement (one model call, then a fixed workflow, then one agent, then several agents), as
`SOUL.md` value 2 asks.

---

## Orchestration Fundamentals

### Agent Hierarchy Model
```
┌─────────────────────────────────────────────────────┐
│              ORCHESTRATOR AGENT                      │
│  (Strategic coordination, task routing, synthesis)   │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  Specialist  │  │  Specialist  │  │ Specialist │ │
│  │   Agent A    │  │   Agent B    │  │  Agent C   │ │
│  │  (Domain 1)  │  │  (Domain 2)  │  │ (Domain 3) │ │
│  └──────────────┘  └──────────────┘  └────────────┘ │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Core Principles

1. **Single Responsibility**: Each agent has one clear domain
2. **Explicit Handoffs**: Clear protocols for transferring work
3. **Context Preservation**: State travels with the task
4. **Graceful Degradation**: System works if agents fail
5. **Observable Execution**: Can see what each agent is doing

---

## Task Decomposition Patterns

### Pattern 1: Hierarchical Decomposition
```
Complex Task: "Build a feature for user authentication"

Decomposed:
├── Research Phase (Research Agent)
│   ├── Analyze existing auth patterns in codebase
│   ├── Identify dependencies and constraints
│   └── Document findings
│
├── Design Phase (Architect Agent)
│   ├── Design auth flow
│   ├── Define API contracts
│   └── Create component structure
│
├── Implementation Phase (Developer Agent)
│   ├── Implement backend auth logic
│   ├── Build frontend components
│   └── Add error handling
│
├── Testing Phase (QA Agent)
│   ├── Write unit tests
│   ├── Integration tests
│   └── Security review
│
└── Documentation Phase (Docs Agent)
    ├── API documentation
    ├── User guide
    └── Developer notes
```

### Pattern 2: Parallel Decomposition
```
Task: "Analyze codebase and suggest improvements"

Parallel Execution:
┌─────────────────────────────────────────────────────┐
│                    ORCHESTRATOR                      │
│                Spawns parallel agents                │
└───────────┬─────────────┬─────────────┬────────────┘
            │             │             │
            ▼             ▼             ▼
    ┌───────────┐  ┌───────────┐  ┌───────────┐
    │ Security  │  │Performance│  │   Code    │
    │  Analyst  │  │  Analyst  │  │  Quality  │
    └─────┬─────┘  └─────┬─────┘  └─────┬─────┘
          │              │              │
          ▼              ▼              ▼
    [Security     [Performance   [Quality
     Report]       Report]        Report]
          │              │              │
          └──────────────┼──────────────┘
                         │
                         ▼
              ┌─────────────────┐
              │   ORCHESTRATOR  │
              │    Synthesizes  │
              └─────────────────┘
```

### Pattern 3: Iterative Refinement
```
Task: "Write a technical blog post"

Iteration Loop:
1. Researcher → Gathers information
2. Writer → Creates draft
3. Editor → Reviews and critiques
4. Writer → Revises based on feedback
5. Editor → Approves or requests more changes
6. Repeat 4-5 until quality threshold met
7. Publisher → Formats and publishes
```

---

## Handoff Patterns

### Pattern 1: Explicit Handoff Protocol
```typescript
interface TaskHandoff {
  from_agent: string;
  to_agent: string;
  task_id: string;
  context: {
    original_request: string;
    work_completed: string[];
    current_state: any;
    next_steps: string[];
  };
  artifacts: {
    files_created: string[];
    files_modified: string[];
    decisions_made: Decision[];
  };
}

// Example handoff
const handoff: TaskHandoff = {
  from_agent: "ArchitectAgent",
  to_agent: "DeveloperAgent",
  task_id: "auth-feature-123",
  context: {
    original_request: "Implement user authentication",
    work_completed: [
      "Analyzed existing patterns",
      "Designed auth flow",
      "Created API contracts"
    ],
    current_state: {
      design_doc: "/docs/auth-design.md",
      api_spec: "/specs/auth-api.yaml"
    },
    next_steps: [
      "Implement AuthService class",
      "Create login/logout endpoints",
      "Build session management"
    ]
  },
  artifacts: {
    files_created: ["/docs/auth-design.md", "/specs/auth-api.yaml"],
    files_modified: [],
    decisions_made: [
      { decision: "Use JWT for tokens", rationale: "Stateless, scalable" },
      { decision: "Redis for session store", rationale: "Fast, supports TTL" }
    ]
  }
};
```

### Pattern 2: Capability-Based Routing
```typescript
const agentCapabilities = {
  ResearchAgent: ["search", "analyze", "summarize", "compare"],
  ArchitectAgent: ["design", "plan", "structure", "evaluate"],
  DeveloperAgent: ["implement", "refactor", "debug", "optimize"],
  ReviewerAgent: ["review", "critique", "validate", "approve"],
  DocsAgent: ["document", "explain", "format", "publish"]
};

function routeTask(task: string): string {
  const taskVerb = extractVerb(task);

  for (const [agent, capabilities] of Object.entries(agentCapabilities)) {
    if (capabilities.includes(taskVerb)) {
      return agent;
    }
  }

  return "GeneralAgent"; // Fallback
}
```

### Pattern 3: Context Window Management
```typescript
// Problem: Context grows as agents work
// Solution: Summarize and compress at handoffs

interface CompressedContext {
  essential: {
    task_goal: string;
    key_decisions: string[];
    current_blockers: string[];
  };
  reference: {
    file_paths: string[];      // Can be re-read if needed
    doc_links: string[];       // External references
  };
  discarded: {
    exploration_notes: string; // Summarized, not full content
    rejected_approaches: string[];
  };
}

function compressForHandoff(fullContext: any): CompressedContext {
  return {
    essential: extractEssentials(fullContext),
    reference: extractReferences(fullContext),
    discarded: summarizeDiscarded(fullContext)
  };
}
```

---

## Coordination Patterns

### Pattern 1: Conductor Model
```
One orchestrator coordinates all activity:

┌─────────────────────────────────────────────┐
│             CONDUCTOR AGENT                  │
│  - Receives initial request                  │
│  - Decomposes into subtasks                  │
│  - Assigns to specialist agents              │
│  - Monitors progress                         │
│  - Synthesizes results                       │
│  - Handles failures and retries              │
└─────────────────────────────────────────────┘

Best for: Complex projects with many dependencies
Example: the weighted-synthesis council in the worked example below
```

### Pattern 2: Pipeline Model
```
Sequential processing through specialized stages:

Request → [Agent A] → [Agent B] → [Agent C] → Result
             │            │            │
           Stage 1     Stage 2      Stage 3
          Research     Design      Execute

Best for: Well-defined workflows with clear stages
Example: Content creation pipeline
```

### Pattern 3: Swarm Model
```
Multiple agents work in parallel, coordinating peer-to-peer:

     ┌────────┐
     │Agent A │←──────────────────┐
     └───┬────┘                   │
         │                        │
    ┌────▼────┐              ┌────┴───┐
    │ Agent B │◄────────────►│Agent D │
    └────┬────┘              └────┬───┘
         │                        │
     ┌───▼────┐                   │
     │Agent C │◄──────────────────┘
     └────────┘

Best for: Exploratory tasks, parallel research
Example: Codebase analysis from multiple angles
```

### Pattern 4: Blackboard Model
```
Shared workspace that all agents read/write:

┌─────────────────────────────────────────┐
│             BLACKBOARD                   │
│  ┌─────────────────────────────────┐    │
│  │ Current State: { ... }          │    │
│  │ Hypotheses: [ ... ]             │    │
│  │ Evidence: [ ... ]               │    │
│  │ Conclusions: [ ... ]            │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
        │           │           │
   ┌────▼───┐  ┌────▼───┐  ┌────▼───┐
   │Agent A │  │Agent B │  │Agent C │
   │ reads  │  │ reads  │  │ reads  │
   │ writes │  │ writes │  │ writes │
   └────────┘  └────────┘  └────────┘

Best for: Complex problem-solving with evolving understanding
Example: Debugging a complex system issue
```

---

## Error handling, recovery and observability

Retry with backoff, fallback agents, checkpoint and resume, structured logging, progress tracking and
a decision audit trail, each with TypeScript sketches, are in
[references/resilience-and-observability.md](references/resilience-and-observability.md).

---

## Worked example: weighted synthesis

A conductor that asks several specialist perspectives for a view on one strategic decision, then
weights and reconciles them. The weights are illustrative, not measured; set them per decision type
and record why.

```
┌────────────────────────────────────────────────────┐
│              SYNTHESIS ORCHESTRATOR                 │
│        (coordinates perspectives, not domains)      │
├────────────────────────────────────────────────────┤
│                                                     │
│  Example weight distribution for one decision:      │
│  ├── Systems architect: 30%   (systems design)      │
│  ├── Product lead: 25%        (content/product)     │
│  ├── Strategist: 25%          (future strategy)     │
│  └── Risk reviewer: 20%       (constraints, risk)   │
│                                                     │
│  Synthesis process:                                 │
│  1. Each agent provides perspective                 │
│  2. Orchestrator weights by domain relevance        │
│  3. Conflicts are explicitly surfaced               │
│  4. Final recommendation synthesizes all views      │
│                                                     │
└────────────────────────────────────────────────────┘
```

### Example team compositions

**Book writing team:**
- Story architect → Design
- Genre writer → Draft
- Editor → Review cycles
- Sensitivity reader → Final check
- Continuity checker → Consistency

**Product development team:**
- Architect → Design
- Frontend specialist → UI
- Backend specialist → API
- AI specialist → Model integration
- DevOps → Deployment

---

## Anti-patterns to avoid

### God Agent
One agent that does everything - no specialization, no delegation.

### Agent Explosion
Too many tiny agents with overlapping responsibilities.

### Lost Context
Handoffs that don't preserve essential information.

### Infinite Loops
Agents that keep handing work back and forth.

### Silent Failures
Agents that fail without proper error reporting.

### Unobservable Execution
Can't see what agents are doing or why.

## Changelog

- 1.2.0: frontmatter to agentskills.io spec, stale figures dated and sourced, depth moved to references/, personal-brand example replaced by a neutral worked example.
- 1.1.0: updated for 2026 agent frameworks (LangGraph 1.0 GA, OpenAI Agents 0.6.4), as of 2026-01-06.
- 1.0.0: initial skill with orchestration patterns.
