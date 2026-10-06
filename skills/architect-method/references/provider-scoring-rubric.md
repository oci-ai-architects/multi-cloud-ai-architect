# Provider scoring rubric (AWS Agentic AI Lens as yardstick)

asOf 2026-10-05. Yardstick: [AWS Well-Architected Agentic AI Lens](https://docs.aws.amazon.com/wellarchitected/latest/agentic-ai-lens/agentic-ai-lens.html),
published 2026-06-10, the only pillar-structured agentic review a provider publishes. Using AWS's
lens to score AWS's rivals is deliberate: its question set is the most complete; its service answers
are not. Score *controls you can show*, never brand familiarity.

Two parts, scored separately so a provider cannot win on features the workload will not use:

- **Part A, workload fit** (does this cloud suit *this* system?).
- **Part B, lens control coverage** (can this cloud satisfy each lens area with evidence?).

## Scale (both parts)

| Score | Meaning |
|---|---|
| 0 | Not possible, or only by building a product yourself |
| 1 | Possible with significant custom build and operational burden |
| 2 | Possible with a documented pattern and some glue; you own the glue |
| 3 | Native managed capability covers it; some configuration |
| 4 | Native, already proven in **your** eval run or an existing deployment (evidence link required) |

A 4 without a link is a 3.

## Part A: workload fit (weights sum to 100)

| Criterion | Default weight | Score with evidence such as |
|---|---|---|
| Data gravity: where the systems of record live | 25 | data location, egress cost, residency rules |
| Team language and skills | 15 | SDK maturity in that language (e.g. .NET → Agent Framework; TS → AI SDK / Agents SDK; Python → ADK, Strands) |
| Statefulness and session shape | 15 | per-entity long-lived state (Durable Objects), long waits (Workflows, AgentCore v2), long-running workers (Railway) |
| Latency and geography | 10 | user distribution vs regions or edge |
| Execution limits | 10 | function duration, sandbox session caps, memory per isolate (see pack limit tables) |
| Cost envelope at expected volume | 15 | computed cost per task from `prices.json` rows with asOf |
| Existing contracts, identity and compliance | 10 | enterprise agreement, IdP, certifications the buyer requires |

## Part B: lens control coverage

Rows are the lens question areas the lens itself lists in its reading paths. Weights are defaults;
raise security weights for regulated or A3/A4 systems. **Gate: any Security row below 2 disqualifies
the provider for that system**, whatever the total.

### Native coverage map (starting evidence, not scores)

N = native managed capability · P = documented pattern or partial, you own glue · G = gap, build it.
Each cell names the control so a reviewer can verify it. Re-verify before scoring; products move.

| Lens area | Weight | AWS | Azure | Google Cloud | Cloudflare | Vercel | Railway |
|---|---|---|---|---|---|---|---|
| AGENTOPS01 roles, success criteria, handoffs | 4 | P: spec + Registry | P: Agent Framework workflows | P: ADK agent defs | P: Agents SDK | P: Workflows | G |
| AGENTOPS05 tracing, anomaly detection | 6 | N: AgentCore Observability (OTel) | N: Foundry tracing → App Insights | N: Cloud Trace, agents-cli observability | P: Workers Observability + AI Gateway logs | N: Workflow traces, gateway trace drains | P: logs/metrics, bring OTel |
| AGENTOPS06 testing and LLM-as-judge | 8 | N: AgentCore Evaluations | N: Foundry evaluations | N: `adk eval`, eval-flywheel skill | G: bring harness | P: preview deployments as eval targets | G: bring harness |
| AGENTREL02 atomic tasks, least privilege | 6 | N: IAM role per agent, Policy | N: Entra agent identity, managed identity | N: service account per agent | P: Access + scoped tokens | P: Connect, OIDC | P: per-service variables |
| AGENTREL04 arbiter, fallbacks | 5 | P: Strands Graph/Swarm, Bedrock cross-region | P: orchestration patterns | P: A2A coordinator pattern | N: AI Gateway fallback | N: AI Gateway fallback | G |
| AGENTREL06 legacy integration, idempotency | 4 | N: Gateway (APIs/Lambda → MCP), Step Functions | P: APIM, Logic Apps [UNVERIFIED] | N: Apigee API Hub, MCP Toolbox | P: Workflows, DO | N: Workflows steps + retries | P: queue workers |
| AGENTSEC03 identity and authentication | 8 | N: AgentCore Identity | N: Entra ID, OBO | N: IAM, Workload Identity | N: Access, OAuth for MCP | P: Connect, team RBAC | P: tokens, private networking |
| AGENTSEC04 guardrails, human-in-the-loop | 8 | N: Bedrock Guardrails, Policy (Cedar) | P: content safety [UNVERIFIED], workflow approvals | P: Model Armor [UNVERIFIED], ADK callbacks | P: SDK human-in-the-loop | N: Workflow hooks for approval | G: app-level |
| AGENTSEC06 inter-agent trust | 5 | P: Gateway + A2A | P: Agent Framework | N: A2A (origin), agent cards | P: MCP portals | P: app-level | G |
| AGENTSEC07 protect oversight, rogue detection | 5 | P: Observability baselines + role revocation | P | P | P | P | G |
| AGENTSEC08 input validation, output filtering | 6 | N: Guardrails | P | P | P: AI Gateway [UNVERIFIED guardrail scope] | P: ZDR routing, app filters | G |
| AGENTPERF02 model selection, pipeline | 5 | N: Bedrock model choice | N: Foundry model catalogue | N: Model Garden | N: AI Gateway + Workers AI | N: AI Gateway (no markup) | G: external |
| AGENTPERF05 orchestration patterns | 4 | P: Strands patterns | N: five named patterns, Agent Framework | N: ADK workflow agents | P: Agents SDK patterns | P: Workflows | G |
| AGENTCOST01 reasoning-loop cost control | 6 | N: v2 scale-to-zero on I/O, Policy limits | P | P | N: per-agent budget in DO, gateway rate limits | N: gateway budgets, Active CPU billing | P: usage limits |
| AGENTCOST02 model right-sizing, tokens | 4 | N | N | N | N: gateway caching | N: gateway | G |
| AGENTCOST05 cost attribution multi-agent | 4 | P: tags + Observability | P | P | P: gateway logs per key | N: custom reporting tags | P: per-service usage |
| AGENTSUS03 organisational sustainability | 2 | P: aidlc-workflows rules | P: curricula | P: WAF as skills | G | G | G |

Weights above sum to 90. Add the remaining 10 to the areas your spec marks as top risk, so the total is 100.

### Scoring procedure

1. For each Part B row, score 0–4 per candidate using the map as a starting point and your own evidence. Paste the evidence link in the scorecard.
2. Weighted Part B score = Σ(weight × score) / (4 × Σweights) × 100.
3. Part A score the same way with Part A weights.
4. **Total = 0.5 × Part A + 0.5 × Part B.** Adjust the split only with an ADR (e.g. 0.3/0.7 for a regulated system).
5. Apply the security gate.
6. Choose cloud A = highest total. Choose cloud B = highest total among providers with a **different runtime model** (hyperscaler managed runtime vs edge isolate vs PaaS container vs web-platform workflow). Record both in the runtime ADR.

## Scorecard template

| Provider | Part A | Part B | Total | Security gate | Evidence folder |
|---|---|---|---|---|---|
| | | | | pass / fail | |

## Notes on fair use

- Composite stacks are allowed and often win: e.g. Vercel (UI + Workflows) + Railway (workers) + a gateway; score the composite as one candidate and list its parts.
- OCI is not in this rubric's column set; score it with the same rows using `oci-services-expert` if it is a candidate.
- Re-score when a provider changes pricing or ships a capability that moves a G to N; the provider packs carry asOf dates for that reason.
