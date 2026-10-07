---
name: oracle-agent-spec
description: Reference for the Open Agent Specification (Agent Spec), an open, framework-agnostic configuration language for describing agents and structured workflows in JSON or YAML so one definition can run on several runtimes (LangGraph, WayFlow, AutoGen, CrewAI adapters). Covers the component model, agent and flow definitions, orchestration and integration patterns, the PyAgentSpec Python package, and how Agent Spec sits beside MCP (tools) and A2A (agent-to-agent messaging). Use when an agent design must stay portable across frameworks, when writing or reviewing an Agent Spec file, when recording the swap cost of an agent runtime in an ADR, or when comparing declarative agent definitions with code-first SDKs. Trigger on "Agent Spec", "Open Agent Specification", "pyagentspec", "portable agent definition", "framework-agnostic agent", "WayFlow". pack-oci does not exist yet; see docs/research/providers/oracle-oci.md. Built on the public github.com/oracle/agent-spec repository; not affiliated with Oracle.
metadata:
  version: "1.2.0"
  asOf: "2026-10-05"
  contentAsOf: "2026-01-06"
  scope: reference
---

# Open Agent Specification (Agent Spec)

Content as of 2026-01-06. Version numbers, model names and API shapes below were not re-checked
against the full documentation on 2026-10-05; confirm on the linked primary source before quoting.

**Checked on 2026-10-05** against https://github.com/oracle/agent-spec (README): Agent Spec is "a
portable, platform-agnostic configuration language" for agents and agentic systems; the Python
package is PyAgentSpec (`pip install pyagentspec`); the README lists runtime adapters for
LangGraph, WayFlow, AutoGen and CrewAI; the project is dual-licensed Apache-2.0 or UPL-1.0; the
README names `Agent` and `Flow` components and `Property` for inputs.

**Examples are illustrative.** The node type names (`LLMNode`, `APINode`, `WorkflowNode`,
`MCPNode` and others), the `spec.compile(target=...)` call and the model names in the YAML below
come from the 2026-01-06 version of this skill and were not found on the README on 2026-10-05.
Take exact component class names and serialization calls from the Agent Spec documentation
(https://oracle.github.io/agent-spec/) before writing a real spec.

## Purpose
Design framework-agnostic, declarative agents with Agent Spec so they can be authored once and run
on more than one framework or runtime.

## What Agent Spec is

### Open Agent Specification
Framework-agnostic declarative language for defining agentic systems, building blocks for standalone agents and structured workflows, plus composition patterns for multi-agent systems.

**Key Innovation:** Decouple design from execution - write agents once, run anywhere.

**Release:** technical report on arXiv, 2510.04173 (https://arxiv.org/abs/2510.04173) [UNVERIFIED as of 2026-01-06]

## Core philosophy

**The Problem:** Fragmented agent development - each framework requires different implementation.

**Approach:** a unified representation. Agent Spec defines structure and behavior in JSON/YAML that any compatible runtime can execute.

**Benefit:** Author agents once, deploy across frameworks, and reduce redundant development.

## Architecture

### Component model
Agent Spec defines **conceptual building blocks** (components) that make up agent-based systems.

**Key Property:** All components are trivially serializable to JSON/YAML.

### Core components (illustrative)

#### 1. LLMNode
**Purpose:** Text generation via LLM

**Definition:**
```yaml
type: LLMNode
name: "text_generator"
model: "claude-sonnet-4-5"
system_prompt: "You are a helpful assistant"
temperature: 0.7
max_tokens: 2000
```

#### 2. APINode
**Purpose:** External API calls

**Definition:**
```yaml
type: APINode
name: "weather_api"
endpoint: "https://api.weather.com/v1/current"
method: "GET"
parameters:
  location: "{input.location}"
headers:
  Authorization: "Bearer {env.API_KEY}"
```

#### 3. AgentNode
**Purpose:** Multi-round conversational agent

**Definition:**
```yaml
type: AgentNode
name: "support_agent"
model: "gpt-4"
system_prompt: "You are a customer support specialist"
tools:
  - type: function
    name: "lookup_order"
  - type: function
    name: "process_refund"
```

#### 4. WorkflowNode
**Purpose:** Orchestrate sequence of nodes

**Definition:**
```yaml
type: WorkflowNode
name: "data_pipeline"
steps:
  - node: extract_node
  - node: transform_node
  - node: load_node
error_handling: retry
```

## Agent specification format (illustrative)

### Basic agent
```json
{
  "version": "1.0",
  "agent": {
    "name": "CustomerSupportAgent",
    "description": "Handles customer inquiries and support requests",
    "components": {
      "classifier": {
        "type": "LLMNode",
        "model": "claude-haiku-4",
        "system_prompt": "Classify customer inquiry type",
        "output": "inquiry_type"
      },
      "technical_support": {
        "type": "AgentNode",
        "model": "claude-sonnet-4-5",
        "tools": ["diagnose_issue", "escalate_ticket"]
      },
      "billing_support": {
        "type": "AgentNode",
        "model": "gpt-4",
        "tools": ["lookup_invoice", "process_refund"]
      },
      "router": {
        "type": "ConditionalNode",
        "conditions": [
          {
            "if": "inquiry_type == 'technical'",
            "then": "technical_support"
          },
          {
            "if": "inquiry_type == 'billing'",
            "then": "billing_support"
          }
        ]
      }
    },
    "entry_point": "classifier"
  }
}
```

### Multi-agent system
```yaml
version: "1.0"
system:
  name: "ResearchSystem"
  description: "Multi-agent research and analysis system"

  agents:
    researcher:
      type: AgentNode
      model: claude-sonnet-4-5
      tools:
        - web_search
        - fetch_document
      system_prompt: "Research topics thoroughly"

    analyzer:
      type: AgentNode
      model: gpt-4o
      tools:
        - analyze_data
        - generate_insights
      system_prompt: "Analyze research findings"

    synthesizer:
      type: AgentNode
      model: claude-sonnet-4-5
      system_prompt: "Synthesize findings into coherent report"

  workflow:
    - step: researcher
      output: research_data
    - step: analyzer
      input: research_data
      output: analysis
    - step: synthesizer
      input: [research_data, analysis]
      output: final_report

  output: final_report
```

## Node library (illustrative)

### Orchestration nodes

**SequentialNode:**
```yaml
type: SequentialNode
nodes:
  - step1_node
  - step2_node
  - step3_node
```

**ParallelNode:**
```yaml
type: ParallelNode
nodes:
  - agent_a
  - agent_b
  - agent_c
aggregator: synthesis_node
```

**ConditionalNode:**
```yaml
type: ConditionalNode
condition: "{output.confidence} > 0.8"
if_true: high_confidence_path
if_false: manual_review_path
```

**LoopNode:**
```yaml
type: LoopNode
condition: "{not output.success}"
max_iterations: 3
body: retry_agent
```

### Integration nodes

**MCPNode:**
```yaml
type: MCPNode
server: "github-server"
resource: "issues"
operation: "list"
filters:
  assignee: "me"
```

**DatabaseNode:**
```yaml
type: DatabaseNode
connection: "postgresql://..."
query: "SELECT * FROM customers WHERE id = {input.customer_id}"
```

## Design patterns

### Pattern 1: Triage and route
```yaml
name: TriageSystem
components:
  classifier:
    type: LLMNode
    model: claude-haiku-4
    prompt: "Classify: {input}"

  router:
    type: ConditionalNode
    conditions:
      - if: "category == 'urgent'"
        then: urgent_agent
      - if: "category == 'standard'"
        then: standard_agent
      - default: fallback_agent
```

### Pattern 2: Research-Analyze-Report
```yaml
name: ResearchPipeline
workflow:
  - name: gather
    type: AgentNode
    tools: [web_search, fetch_docs]

  - name: analyze
    type: LLMNode
    prompt: "Analyze: {gather.output}"

  - name: report
    type: LLMNode
    prompt: "Generate report from: {analyze.output}"
```

### Pattern 3: Parallel processing with synthesis
```yaml
name: MultiPerspective
components:
  parallel_agents:
    type: ParallelNode
    nodes:
      - technical_expert
      - business_expert
      - user_perspective

  synthesizer:
    type: AgentNode
    system_prompt: "Synthesize perspectives into unified recommendation"
    input: "{parallel_agents.outputs}"
```

## Framework portability

### Supported runtimes
Runtime adapters listed on the project README, read 2026-10-05 (https://github.com/oracle/agent-spec):

- **WayFlow** - the project's reference runtime
- **LangGraph** - adapter
- **AutoGen** - adapter
- **CrewAI** - adapter
- **Custom runtimes** - implement an Agent Spec loader for your framework

Direct support in the OCI Generative AI Agents ADK was claimed in the 2026-01-06 version of this
skill and is `[UNVERIFIED]`; check the ADK documentation
(https://docs.oracle.com/en-us/iaas/Content/generative-ai-agents/adk/).

### Compilation example (illustrative)
```python
# Illustrative only: check the Agent Spec docs for the real loader and adapter calls.
# Load Agent Spec definition
from agent_spec import load_spec

spec = load_spec("my_agent.yaml")

# Compile to target framework
langgraph_agent = spec.compile(target="langgraph")
autogen_agent = spec.compile(target="autogen")
oracle_adk_agent = spec.compile(target="oracle_adk")

# Behaviour equivalence across runtimes is a claim to test with one eval set, not an assumption
```

## Best practices

### DO:
✅ Use descriptive names for all components
✅ Document purpose in description fields
✅ Define explicit input/output schemas
✅ Specify error handling strategies
✅ Version your agent specifications
✅ Test across multiple runtimes for true portability

### DON'T:
❌ Embed runtime-specific logic in specs
❌ Hardcode credentials or secrets
❌ Use framework-specific syntax
❌ Skip input validation definitions
❌ Ignore version compatibility

## Integration with other specs

### MCP (Model Context Protocol)
**Relationship:** MCP standardizes tool/resource provisioning; Agent Spec standardizes agent configuration.

**Together:**
```yaml
agent:
  name: DataAgent
  tools:
    - type: MCPTool
      server: "postgres-mcp"
      resource: "customers"
    - type: MCPTool
      server: "github-mcp"
      resource: "issues"
```

### A2A (agent-to-agent communication)
**Relationship:** A2A standardizes inter-agent communication; Agent Spec defines agent structure.

**Together:**
```yaml
multi_agent_system:
  agents:
    - name: agent1
      a2a_endpoint: "https://agent1.example.com"
    - name: agent2
      a2a_endpoint: "https://agent2.example.com"
  communication: a2a_protocol
```

## Ecosystem benefits

### For developers
- **Write Once, Run Anywhere** - Single specification, multiple runtimes
- **Reusable Components** - Share agent definitions across projects
- **Version Control** - Track agent evolution in Git
- **Collaboration** - Common language for team communication

### For frameworks
- **Standardized Input** - Consistent agent definitions
- **Faster Adoption** - Lower barrier to entry
- **Interoperability** - Agents can migrate between frameworks

### For enterprises
- **Vendor Independence** - Not locked into single framework
- **Reproducible Deployments** - Consistent behavior across environments
- **Compliance** - Audit trail through declarative definitions

## Tools and resources

### PyAgentSpec (Python package)
```bash
pip install pyagentspec
```

```python
from pyagentspec import AgentSpec, LLMNode, AgentNode

spec = AgentSpec(
    name="MyAgent",
    components=[
        LLMNode(name="classifier", model="claude-haiku-4"),
        AgentNode(name="executor", model="gpt-4")
    ]
)

spec.save("my_agent.yaml")
spec.compile(target="oracle_adk")
```

### Validation
```python
from pyagentspec import validate_spec

is_valid, errors = validate_spec("agent.yaml")
if not is_valid:
    print(f"Validation errors: {errors}")
```

## Decision framework

**Use Agent Spec when:**
- Need framework portability (deploy across multiple platforms)
- Want declarative, version-controlled agent definitions
- Building reusable agent components
- Require reproducible deployments
- Team collaboration on agent design

**Combine with:**
- OCI Generative AI Agents ADK (for OCI deployment)
- LangGraph (for complex state machines)
- Claude SDK (for Anthropic models)
- MCP (for data source standardization)

## Resources

**Official:**
- GitHub: https://github.com/oracle/agent-spec
- Documentation: https://oracle.github.io/agent-spec/
- License: Apache-2.0 or UPL-1.0 (README, read 2026-10-05)
- Technical Paper: https://arxiv.org/pdf/2510.04173
- PyAgentSpec: https://pypi.org/project/pyagentspec/

**Citation:**
```
Oracle Corporation. (2025). Open Agent Specification (Agent Spec) Technical Report.
```

## Principles

1. **Framework-Agnostic** - Design once, deploy anywhere
2. **Declarative** - Describe what, not how
3. **Composable** - Build complex systems from simple components
4. **Versioned** - Track evolution over time
5. **Portable** - Migrate between frameworks without rewrite
6. **Interoperable** - Works with MCP, A2A, and other standards

## Changelog

- 1.2.0: frontmatter to agentskills.io spec, stale figures dated and sourced, nominative non-affiliated wording; runtime list and license checked against the README on 2026-10-05, examples marked illustrative
- 1.1.0: 2026 refresh against Agent Spec 1.0 (content as of 2026-01-06)
