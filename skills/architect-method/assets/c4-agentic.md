# C4 agentic profile: <system name>

C4 levels (context, container, component) stay as defined at [c4model.com](https://c4model.com/).
This profile adds element stereotypes, relationship labels and three mandatory annotations so agent
systems can be drawn without inventing notation each time.

## 1. Element stereotypes

| Stereotype | Is a | Draw as | Required properties |
|---|---|---|---|
| `agent` | Container (or component inside an agent host) that runs a reasoning loop | rounded box, thick border | autonomy level (A0–A4), tool scope, trust zone, harness, model ref, max steps |
| `model` | External or managed model endpoint | hexagon | provider, model id, region, data retention terms |
| `gateway` | Model or tool gateway (AI Gateway, AgentCore Gateway, APIM, MCP portal) | box with double left edge | policies enforced (rate, budget, allowlist, auth) |
| `tool` | MCP server, API or function the agent invokes | box | read or write, reversible or not, authZ model |
| `memory` | Session store, long-term memory, vector index | cylinder | scope (session, user, tenant), retention, encryption |
| `human` | Person who approves, supervises or receives escalations | person | which actions they approve, SLA, timeout behaviour |
| `eval` | Eval harness, judge, monitor | dashed box | suites, thresholds, where results land |
| trust zone | Boundary grouping elements with the same data and identity rules | dashed rounded group | name, data classes allowed, identity provider |

## 2. Relationship labels

| Label | Meaning | Annotate with |
|---|---|---|
| `invokes` | agent → tool / model call | protocol (MCP, HTTPS, gRPC), auth |
| `delegates` | agent → agent task handoff | protocol (A2A, in-process), what context is passed |
| `retrieves` / `writes` | agent → memory | scope key (tenant/user/session) |
| `approves` | human → agent action | action class, channel |
| `observes` | eval → agent / gateway | traces, logs, sampled transcripts |

## 3. Mandatory annotations on every `agent`

1. **Autonomy level** (A0–A4, as defined in `spec.md` §4). Draw the highest level of any action it can take.
2. **Tool scope**: list of tools, each marked R (read) or W (write) and ! (irreversible).
3. **Trust zone**: which zone it runs in. A relationship that crosses a zone boundary must name its auth.

A diagram that omits these for any agent fails review.

## 4. Views required by size

| Size | Views |
|---|---|
| S | none required; a sentence in the spec is enough |
| M | System context + container |
| L | Context + container + one component view per agent + a deployment view per cloud |

## 5. Structurizr DSL skeleton

```
workspace "<system name>" "C4 agentic profile v1" {
  model {
    customer = person "Customer"
    lead = person "Support lead" "Approves A3 refunds" "human"

    sys = softwareSystem "Support agent system" {
      group "Zone: customer-facing (EU, PII allowed)" {
        chat = container "Chat front end" "Streams responses" "Next.js"
        triage = container "Triage agent" "A1; tools: get_order(R), search_kb(R); max 8 steps" "ADK" "agent"
        orders = container "Orders agent" "A3; tools: update_address(W), refund(W!); max 12 steps" "ADK" "agent"
        mem = container "Session + long-term memory" "tenant-scoped, 30-day retention" "Agent Runtime Sessions / AgentCore Memory" "memory"
      }
      group "Zone: platform" {
        gw = container "Model gateway" "budget per tenant, provider allowlist, fallback" "AI Gateway" "gateway"
        evals = container "Eval harness" "E-OUT-01, E-TRAJ-01, E-SEC-01" "CI + traces" "eval"
      }
    }
    model = softwareSystem "Model provider" "region EU, zero retention" "model"
    ordersApi = softwareSystem "Order system MCP server" "R/W; OAuth client credentials" "tool"

    customer -> chat "chats with"
    chat -> triage "sends message"
    triage -> orders "delegates order changes" "A2A"
    triage -> mem "retrieves" "session key"
    orders -> ordersApi "invokes" "MCP over HTTPS, OAuth"
    triage -> gw "invokes model"
    orders -> gw "invokes model"
    gw -> model "invokes" "HTTPS, BYOK"
    lead -> orders "approves refunds" "Slack"
    evals -> gw "observes" "traces"
  }
  views {
    systemContext sys { include * autolayout lr }
    container sys { include * autolayout lr }
    styles {
      element "agent" { shape RoundedBox border solid thickness 4 }
      element "model" { shape Hexagon }
      element "memory" { shape Cylinder }
      element "gateway" { shape Box }
      element "eval" { border dashed }
      element "human" { shape Person }
    }
  }
}
```

## 6. Review questions for the diagram

- Can every write tool be traced to an approver or an A2 undo path?
- Does any agent hold both a write tool and untrusted retrieval in the same loop without a policy in between?
- Does any relationship cross a trust zone without a named auth mechanism?
- Is there exactly one place where model budgets are enforced?
- Does the eval harness observe every agent, or only the front one?
