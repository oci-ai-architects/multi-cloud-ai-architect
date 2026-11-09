---
name: architect-method
description: Vendor-neutral method for taking an AI agent system from idea to production on two clouds - size the change, write a spec with an NFR and autonomy budget, record eval-gated ADRs, draw a C4 agentic profile, write AGENTS.md and SKILL.md contracts, build an eval plan, score providers against the AWS Well-Architected Agentic AI Lens, then deploy the same agent on two clouds and compare with one eval set. Use when starting or reviewing any agentic system design, choosing between AWS, Azure, Google Cloud, Cloudflare, Vercel and Railway, writing an ADR or spec for an agent, drawing agent architecture in C4, or defining acceptance evals. Trigger on "design an agent system", "agent architecture review", "which cloud for this agent", "write the ADR", "C4 for agents", "eval plan", "spec-driven agent", "multi-cloud agent". Templates live in assets/; the scoring rubric in references/.
metadata:
  version: "1.0.0"
  asOf: "2026-10-05"
  scope: method
  companions: pack-aws pack-azure pack-google-cloud pack-cloudflare pack-vercel pack-railway
---

# Architect method: spec, ADR, C4, contracts, evals, two clouds

One traceable chain from the problem to two running deployments, where **every decision is accepted
by an eval, not by a reviewer's taste**. The chain:

```
size → spec.md → adr-NNN.md (eval-gated) → c4-agentic.md → AGENTS.md + SKILL.md → eval-plan.md
     → provider scorecard → deploy on cloud A and cloud B → same evals → compare → accept or revise ADRs
```

Why this shape: spec-driven tools (Spec Kit, OpenSpec, BMAD, Kiro) start at the feature and skip
architecture; cloud architecture centres stop at diagrams; nobody ties ADRs to evals
(`docs/research/leadership-benchmarks.md`, read 2026-10-05). Böckeler's critique of SDD tools
(verbose specs, over-specification, non-determinism; [martinfowler.com](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html),
2025-10-15) is answered by step 0 and by the eval gate.

## Step 0. Size the change before writing anything

| Size | Signal | Artifacts required |
|---|---|---|
| S | One agent, existing tools, no new data class, reversible actions only | Spec sections 1, 4, 7 only; one ADR if a model or runtime changes; eval plan with ≥ 20 cases |
| M | New agent or new tool with writes; new data class; one cloud | Full spec; ADRs per decision; C4 context + container; eval plan; scorecard optional |
| L | Multi-agent, cross-team, regulated data, irreversible actions, or two clouds | Everything below, plus C4 component view per agent, threat model in the ADRs, and the two-cloud deployment |

A bug fix is never M. If the spec takes longer to review than the change takes to build, the size is wrong.

## Step 1. Spec (`assets/spec.md`)

The spec fixes *what* and *how good*, never *how*. Three sections carry most of the value:

- **Autonomy budget**: per action class, the autonomy level (see the scale in the template) and who approves. Irreversible or external actions default to human approval.
- **NFR budget**: p95 latency, cost per completed task, quality thresholds, availability, data residency. Numbers, not adjectives. These become eval thresholds.
- **Acceptance evals**: named eval suites with thresholds. A spec without them is not ready.

## Step 2. Eval-gated ADRs (`assets/adr.md`)

One decision per ADR, MADR-style, with one addition: an **Acceptance** block naming the eval and the
threshold that moves the ADR from *Proposed* to *Accepted*. Typical ADRs for an agent system:

1. Complexity level: direct call, single agent with tools, or multi-agent (use Azure's ladder: lowest level that reliably meets requirements; see `pack-azure`).
2. Orchestration pattern (sequential, concurrent, group chat, handoff, magentic) if multi-agent.
3. Harness/framework (ADK, Strands, Agent Framework, AI SDK/eve, Agents SDK, LangGraph).
4. Model and routing (primary, fallback, gateway).
5. Runtime per cloud (from the provider packs).
6. Memory design (short-term, long-term, retention, tenant isolation).
7. Tool exposure (MCP servers, gateway, authZ model).
8. Human oversight model (which actions, which approver, timeout behaviour).

Superseding is normal. An ADR whose acceptance eval fails after deploy goes back to *Proposed*.

## Step 3. C4 agentic profile (`assets/c4-agentic.md`)

C4 has no notation for agents, tools, memory or trust boundaries. The profile adds element
stereotypes (`agent`, `model`, `tool`, `memory`, `gateway`, `human`, `eval`) and relationship labels
(`invokes`, `delegates`, `retrieves`, `approves`, `observes`), plus three mandatory annotations per
agent: autonomy level, tool scope, and trust zone. Draw context and container views at size M;
add a component view per agent at size L. A Structurizr DSL skeleton is in the template.

## Step 4. Contracts: AGENTS.md and SKILL.md

Two different readers, two files:

| File | Reader | Must contain |
|---|---|---|
| `AGENTS.md` (repo root) | Coding agents working on the codebase | Build/test/eval commands; the spec and ADR locations; which files are generated; authority (what an agent may change without review, what needs a human); the eval gate command that must pass before a PR is ready |
| `SKILL.md` (per capability of the runtime agent, agentskills.io format) | The production agent at runtime | `name` + a `description` that states when to trigger; procedure; tool usage rules; failure handling; links to references loaded on demand |

Keep both short. Thoughtworks Radar Vol. 34 puts "agent instruction bloat" in Caution; every line in
AGENTS.md should be something an agent would otherwise get wrong. Every runtime SKILL.md gets at
least one eval case in the eval plan that proves it triggers and one that proves it does not.

## Step 5. Eval plan (`assets/eval-plan.md`)

Four layers, cheapest first: deterministic checks (schemas, tool-call trajectory, policy denials),
model-graded checks (rubric LLM-as-judge, calibrated against human labels), human review on a sample,
and online monitoring after deploy. Outcome metrics *and* trajectory metrics. Thresholds come from
the spec's NFR budget; ADR acceptance blocks reference eval IDs. Evals run in CI against preview
deployments, and the same suite runs against both clouds in step 7.

## Step 6. Provider selection (`references/provider-scoring-rubric.md`)

Score candidate providers with the rubric. It uses the AWS Well-Architected Agentic AI Lens
(published 2026-06-10) question areas as rows, because it is the only pillar-structured agentic
review any provider publishes, and maps each row to native controls on AWS, Azure, Google Cloud,
Cloudflare, Vercel and Railway. Workload fit (data gravity, team language, latency, statefulness)
is scored separately so a cloud cannot win on features it will not use. Pick **two** providers:
the top score, and the best-scoring provider with a *different* runtime model (for example a
hyperscaler plus an edge or PaaS column). The second deployment is the portability evidence.

## Step 7. Deploy on two clouds, compare with one eval set

1. Keep the **portable core** cloud-free: agent logic, prompts, SKILL.md files, tool contracts (MCP schemas), eval sets.
2. Put each cloud behind a **runtime adapter**: entrypoint, session/memory binding, secrets, telemetry export.
3. Route models through a gateway or a thin client so model choice is a config change.
4. Run the full eval plan on both deployments. Record per cloud: pass rates, p95 latency, cost per completed task, operational incidents during the run.
5. Write the comparison into the runtime ADR. Accept, or supersede with the evidence.

Common pairings and why (detail in the packs):

| Pair | Good for |
|---|---|
| AWS AgentCore + Google Agent Runtime | Python agents; enterprise data; proves the harness is not tied to one managed runtime |
| Azure Foundry + AWS AgentCore | .NET or Microsoft estate with an AWS data side |
| Vercel Workflows + Railway workers | TS product teams; durable orchestration plus long-running workers, no hyperscaler |
| Cloudflare Agents + any hyperscaler | Per-user stateful front agents at the edge, heavy tools near the data |

## Review checklist (run at each gate)

- [ ] Size declared and artifacts proportional to it.
- [ ] Every NFR in the spec has a number and an eval that measures it.
- [ ] Every ADR has an Acceptance block with an eval ID and threshold.
- [ ] Every agent in the C4 view has autonomy level, tool scope and trust zone.
- [ ] Every irreversible action has an approver and a timeout behaviour.
- [ ] AGENTS.md names the eval gate command; every runtime SKILL.md has trigger and non-trigger cases.
- [ ] Scorecard filled with evidence links, not adjectives; security rows have no score below 2.
- [ ] Both deployments ran the same eval set; the comparison is in the runtime ADR.
- [ ] Every price or limit cited carries a source URL and asOf date.

## Anti-patterns

- Writing the spec as a task list. Tasks belong to the coding agent; the spec owns outcomes and budgets.
- ADRs accepted in a meeting. Acceptance is an eval result.
- A C4 diagram where "the agent" is one box with every tool inside it.
- Choosing the cloud before the workload-fit scores exist.
- A "multi-cloud" claim backed by Terraform for two clouds and evals for one.

## Sources
[AWS Agentic AI Lens](https://docs.aws.amazon.com/wellarchitected/latest/agentic-ai-lens/agentic-ai-lens.html) · [Azure orchestration patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns) · [Google: choose agentic components](https://docs.cloud.google.com/architecture/choose-agentic-ai-architecture-components) · [C4 model](https://c4model.com/) · [MADR](https://adr.github.io/madr/) · [Anthropic: building effective agents](https://www.anthropic.com/engineering/building-effective-agents) · [Anthropic: demystifying evals](https://anthropic.com/engineering/demystifying-evals-for-ai-agents) · [agentskills.io spec](https://github.com/agentskills/agentskills) · [AGENTS.md](https://github.com/agentsmd/agents.md) · research: `docs/research/leadership-benchmarks.md`
