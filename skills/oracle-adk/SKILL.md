---
name: oracle-adk
description: Reference for building agent applications with the OCI Generative AI Agents Agent Development Kit (ADK), a client-side Python library over the OCI Generative AI Agents service - multi-turn conversations, function tools, agent-as-a-tool and routing multi-agent patterns, deterministic workflows, FastAPI and Slack embedding, OCI IAM auth, logging and monitoring. Use when a design places agents on OCI Generative AI Agents, when writing or reviewing ADK code, when connecting an agent to Autonomous Database, Object Storage or Oracle applications through tools, or when deciding between the ADK, Agent Spec, LangGraph and other agent SDKs. Trigger on "OCI ADK", "Agent Development Kit", "OCI Generative AI Agents", "GenAI Agents", "ADK function tool". pack-oci does not exist yet; see docs/research/providers/oracle-oci.md. Built on public OCI documentation; not affiliated with Oracle.
metadata:
  version: "1.2.0"
  asOf: "2026-10-05"
  contentAsOf: "2026-01-06"
  scope: reference
---

# OCI Generative AI Agents ADK

Content as of 2026-01-06. Package names, model names and API shapes below were not re-checked on
2026-10-05; confirm on the ADK documentation
(https://docs.oracle.com/en-us/iaas/Content/generative-ai-agents/adk/) before quoting. The
documentation page refused an automated fetch on 2026-10-05 (HTTP 403), so nothing here was
re-verified that day.

**Code samples are illustrative.** They import from a placeholder module `oci_adk` and show the
pattern, not the exact current API. Take the install command, import path and class signatures
from the ADK documentation and API reference before writing real code.

## Purpose
Guidance for building agent applications on the OCI Generative AI Agents service
(https://docs.oracle.com/en-us/iaas/Content/generative-ai-agents/overview.htm) with the ADK's
code-first approach and its orchestration patterns.

## Platform overview

### OCI Agent Development Kit
Client-side library for building agent applications on top of the OCI Generative AI Agents
service. An earlier version of this skill gave a release date of 2025-05-22 [UNVERIFIED]; the
release notes in the ADK documentation are the source.

**Key Value:** Code-first approach for embedding agents in applications (web apps, Slackbots, enterprise systems).

**Requirements:** Python 3.10 or later as of 2026-01-06 [UNVERIFIED]; check the ADK installation page.

## Core capabilities

### 1. Multi-turn conversations
Build agents that maintain context across multiple interactions.

**Pattern:**
```python
from oci_adk import Agent

agent = Agent(
    name="customer_support",
    model="cohere.command-r-plus",
    system_prompt="You are a helpful customer support agent"
)

# Multi-turn conversation
conversation = agent.create_conversation()
response1 = conversation.send("I need help with my order")
response2 = conversation.send("It's order #12345")
# Agent remembers context from previous messages
```

### 2. Multi-agent orchestration

**Routing Pattern:**
```python
# Route requests to specialized agents
def orchestrator(user_query):
    if requires_technical_support(user_query):
        return technical_agent.handle(user_query)
    elif requires_billing(user_query):
        return billing_agent.handle(user_query)
    else:
        return general_agent.handle(user_query)
```

**Agent-as-a-Tool Pattern:**
```python
# One agent uses another agent as a tool
main_agent = Agent(
    name="supervisor",
    tools=[research_agent, analysis_agent, report_agent]
)

# Main agent orchestrates specialist agents
result = main_agent.execute("Research and analyze Q4 performance")
```

### 3. Deterministic workflows
Build predictable, orchestrated workflows with explicit control flow.

```python
from oci_adk import Workflow, Step

workflow = Workflow([
    Step("validate_input", validation_agent),
    Step("process_request", processing_agent),
    Step("generate_response", response_agent)
])

result = workflow.execute(user_input)
```

### 4. Function tools
Add custom capabilities to agents through function tools.

```python
from oci_adk import FunctionTool

@FunctionTool(
    name="get_customer_data",
    description="Retrieve customer information from CRM",
    parameters={
        "customer_id": {"type": "string", "required": True}
    }
)
def get_customer_data(customer_id: str):
    return crm_api.get_customer(customer_id)

agent = Agent(
    name="customer_agent",
    tools=[get_customer_data]
)
```

## Architectural patterns

### Pattern 1: Hierarchical orchestration
```
Supervisor Agent
    ├─→ Research Agent (gathers information)
    ├─→ Analysis Agent (processes data)
    └─→ Report Agent (generates output)
```

**Use Case:** Complex tasks requiring specialized subtask agents

**Implementation:**
```python
supervisor = Agent(
    name="supervisor",
    system_prompt="Coordinate specialist agents to complete complex tasks",
    tools=[research_tool, analysis_tool, report_tool]
)
```

### Pattern 2: Sequential pipeline
```
Input → Agent 1 → Agent 2 → Agent 3 → Output
```

**Use Case:** Linear workflows with dependencies

**Implementation:**
```python
pipeline = AgentPipeline([
    ("extract", data_extraction_agent),
    ("transform", data_transformation_agent),
    ("load", data_loading_agent)
])

result = pipeline.execute(raw_data)
```

### Pattern 3: Parallel processing
```
Coordinator
    ├──→ Agent A ──┐
    ├──→ Agent B ──┤→ Aggregator Agent
    └──→ Agent C ──┘
```

**Use Case:** Independent tasks that can run concurrently

**Implementation:**
```python
import asyncio

async def parallel_processing(task):
    results = await asyncio.gather(
        agent_a.execute_async(task),
        agent_b.execute_async(task),
        agent_c.execute_async(task)
    )
    return aggregator_agent.synthesize(results)
```

## OCI integration practices

### 1. Use OCI services as tools
```python
# Integrate with OCI services
from oci import object_storage, database

agent = Agent(
    name="data_agent",
    tools=[
        object_storage_tool,
        autonomous_db_tool,
        analytics_cloud_tool
    ]
)
```

### 2. IAM authentication
```python
# Use OCI IAM for authentication
from oci.config import from_file

config = from_file("~/.oci/config")

agent = Agent(
    name="secure_agent",
    oci_config=config,
    compartment_id="ocid1.compartment..."
)
```

### 3. Multi-region deployment
```python
# Deploy agents across OCI regions
regions = ["us-ashburn-1", "eu-frankfurt-1", "ap-tokyo-1"]

for region in regions:
    deploy_agent(
        agent=my_agent,
        region=region,
        config=regional_config[region]
    )
```

## Production deployment

### Application integration
```python
# Embed in FastAPI application
from fastapi import FastAPI
from oci_adk import Agent

app = FastAPI()
support_agent = Agent.load("customer_support_v2")

@app.post("/support/chat")
async def chat_endpoint(message: str, session_id: str):
    conversation = support_agent.get_conversation(session_id)
    response = await conversation.send_async(message)
    return {"reply": response.text}
```

### Slackbot integration
```python
from slack_sdk import WebClient
from oci_adk import Agent

slack_client = WebClient(token=slack_token)
agent = Agent.load("slack_assistant")

@slack_app.event("message")
def handle_message(event):
    user_message = event["text"]
    response = agent.execute(user_message)
    slack_client.chat_postMessage(
        channel=event["channel"],
        text=response.text
    )
```

## Monitoring and observability

### Logging
```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("oci_agent")

agent = Agent(
    name="monitored_agent",
    on_tool_call=lambda tool: logger.info(f"Calling tool: {tool}"),
    on_error=lambda error: logger.error(f"Agent error: {error}")
)
```

### Metrics collection
```python
from oci.monitoring import MonitoringClient

def track_agent_metrics(agent_id, metrics):
    monitoring_client.post_metric_data(
        post_metric_data_details={
            "namespace": "agent_performance",
            "dimensions": {"agent_id": agent_id},
            "datapoints": metrics
        }
    )
```

## Cost optimization

### Model selection

Model IDs below were in the OCI Generative AI catalogue as of 2026-01-06 [UNVERIFIED]. Read the
current list and any retirement dates at
https://docs.oracle.com/en-us/iaas/Content/generative-ai/pretrained-models.htm.

```python
# Use appropriate models for tasks
simple_agent = Agent(
    model="cohere.command-light",  # Cheaper for simple tasks
)

complex_agent = Agent(
    model="cohere.command-r-plus",  # More capable for complex reasoning
)
```

### Caching strategies
```python
from functools import lru_cache

@lru_cache(maxsize=1000)
def cached_agent_call(prompt: str):
    return agent.execute(prompt)
```

## Testing

### Unit testing agents
```python
def test_customer_agent():
    agent = Agent.load("customer_support")
    response = agent.execute("What's your return policy?")
    assert "30 days" in response.text.lower()
```

### Integration testing
```python
def test_agent_workflow():
    workflow = Workflow([
        Step("classify", classification_agent),
        Step("process", processing_agent)
    ])

    result = workflow.execute(test_input)
    assert result.status == "success"
```

## Integration with Oracle applications and databases

### Fusion Applications
```python
# Integrate with Oracle Fusion Cloud Applications through tools you define
fusion_agent = Agent(
    name="fusion_assistant",
    tools=[
        fusion_hcm_tool,
        fusion_erp_tool,
        fusion_scm_tool
    ]
)
```

### Database integration
```python
# Connect to Autonomous Database
from oci_adk.tools import SQLTool

db_tool = SQLTool(
    connection_string=autonomous_db_connection,
    allowed_tables=["customers", "orders", "products"]
)

agent = Agent(
    name="data_agent",
    tools=[db_tool]
)
```

## Decision framework

**Use the OCI ADK when:**
- Building on OCI infrastructure
- Integrating with Oracle Fusion/Cloud applications
- Need OCI IAM, compartments and audit logging around agent calls
- Want code-first agent development
- Deploying multi-region applications

**Consider alternatives when:**
- Not on OCI (use the Claude Agent SDK, the OpenAI Agents SDK or LangGraph)
- Need visual builder interface (use AgentKit)
- Want framework-agnostic approach (use Agent Spec)

## Resources

**Documentation:**
- ADK documentation: https://docs.oracle.com/en-us/iaas/Content/generative-ai-agents/adk/
- Generative AI Agents overview: https://docs.oracle.com/en-us/iaas/Content/generative-ai-agents/overview.htm
- API Reference: https://docs.oracle.com/en-us/iaas/Content/generative-ai-agents/adk/api-reference/
- Tutorials: https://docs.public.content.oci.oraclecloud.com/en-us/iaas/Content/generative-ai-agents/add-tool-adk.htm

**Support:**
- OCI Documentation
- Oracle Support Portal
- Oracle Cloud Community

## Principles

1. **Code-first** - Use existing developer tooling and workflows
2. **Bounded** - Give each agent a scoped tool set and an exit condition in code
3. **OCI-native** - Use IAM, compartments, Vault and Monitoring around agent calls
4. **Multi-agent when needed** - Start with one agent; add orchestration when a second specialist earns it
5. **Deterministic** - Explicit control flow for predictable behavior

## Changelog

- 1.2.0: frontmatter to agentskills.io spec, stale figures dated and sourced, nominative non-affiliated wording; code marked illustrative, model IDs dated
- 1.1.0: 2026 refresh against ADK 1.0 and OCI Generative AI GA (content as of 2026-01-06)
