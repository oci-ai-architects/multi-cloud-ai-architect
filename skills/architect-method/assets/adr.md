# ADR-<NNN>: <decision as a short imperative, e.g. "Run the support agent on AgentCore Runtime v2 and Google Agent Runtime">

| Field | Value |
|---|---|
| Status | Proposed / Accepted / Superseded by ADR-<NNN> / Rejected |
| Date | <YYYY-MM-DD> |
| Deciders | <names> |
| Spec | `spec.md` sections <n> |
| Lens areas | e.g. AGENTCOST01, AGENTREL02, AGENTSEC03 |

> MADR structure plus one addition: the **Acceptance** block. The ADR moves to *Accepted* when the
> named eval meets the threshold, not when a meeting agrees. If the eval later fails in production,
> the status returns to *Proposed*.

## Context

What forces the decision: the requirement, the NFR budget line, the constraint. Link the spec rows.
Two to six sentences. Facts that may change (prices, limits, product status) carry a source URL and asOf date.

## Decision drivers

- <driver 1, e.g. cost per task ≤ 0.04 EUR>
- <driver 2, e.g. sessions idle 85% of the time waiting on the model>
- <driver 3, e.g. team writes Python>

## Options considered

### Option A: <name>
- Good: <evidence>
- Bad: <evidence>
- Cost envelope: <number with source and asOf>

### Option B: <name>
- Good:
- Bad:
- Cost envelope:

### Option C: do nothing / simpler level
Always consider the simpler option. If it fails, say which eval or constraint rules it out.

## Decision

Chosen option and the one-sentence reason tied to the drivers.

## Consequences

- Positive:
- Negative (and how we contain them):
- Lock-in introduced, and the exit path:
- Operational load added (who runs it, what pages them):

## Acceptance

| Eval ID | What it measures | Threshold | Result (date, run link) |
|---|---|---|---|
| E-COST-01 | cost per completed task on golden set | ≤ 0.04 EUR | pending |
| E-PERF-01 | p95 task completion | ≤ 20 s | pending |

Accepted when every row passes on the target environment. Record the run link.

## Security and threat notes (required at size L)

| Threat | Where it enters | Control | Verified by |
|---|---|---|---|
| Prompt injection via retrieved docs | retrieval tool | instructions stripped, tool output treated as data, write tools need A3 approval | E-SEC-01 |

## Revisit when

Concrete triggers, e.g. "provider changes runtime pricing", "task volume exceeds 1M/month",
"second cloud deployment shows ≥ 20% cost delta".
