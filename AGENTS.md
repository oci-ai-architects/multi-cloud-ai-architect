# AGENTS.md

Operating contract for any coding agent working in this repository (Claude Code, Codex, Gemini CLI,
Cursor or another harness). Identity, values and refusal rules are in `SOUL.md`; read it first.
Per the AGENTS.md convention (https://agents.md/, read 2026-10-05), a nearer `AGENTS.md` in a
subdirectory takes precedence for files under it.

## Precedence

1. The operator's instructions in the current session.
2. `SOUL.md` refusal rules R1 to R8. Nothing below overrides them.
3. This file.
4. The agent's own definition in `team/<name>.md`.
5. `CLAUDE.md`, the older Claude-specific command centre. Where it conflicts with this file, this
   file wins (see "Known conflicts" below).

## What this repository does

A vendor-neutral practice for designing multi-cloud agent systems. Primary platforms: Google Cloud,
Cloudflare, Vercel, Railway. Secondary: AWS, Microsoft Azure, Oracle OCI. The method extends the
evidence-gated AI Architect lifecycle in the sibling repository `../ai-architect` (nine stages, one
gate each, artifacts under the customer's `docs/architecture/`). This repository adds provider
architects, a spec stage, a typed architecture graph with C4 views, eval-gated ADRs, a claims audit
and a ship gate. It does not fork the lifecycle: stages, gates, human gates and the evidence rules
are inherited unchanged from `../ai-architect/templates/SOP.md`.

## Roster

<!-- roster:start -->
| Agent | Tier | Writes | Checked by |
|---|---|---|---|
| [lead-architect](team/lead-architect.md) | judgment | `SYSTEM.md`, `adr/*.md`, `architecture.json` | claims-auditor |
| [google-cloud-architect](team/google-cloud-architect.md) | build | `providers/google-cloud.md` | claims-auditor |
| [cloudflare-architect](team/cloudflare-architect.md) | build | `providers/cloudflare.md` | claims-auditor |
| [vercel-architect](team/vercel-architect.md) | build | `providers/vercel.md` | claims-auditor |
| [railway-architect](team/railway-architect.md) | build | `providers/railway.md` | claims-auditor |
| [aws-architect](team/aws-architect.md) | build | `providers/aws.md` | claims-auditor |
| [azure-architect](team/azure-architect.md) | build | `providers/azure.md` | claims-auditor |
| [oci-architect](team/oci-architect.md) | build | `providers/oci.md` | claims-auditor |
| [spec-driven-dev-lead](team/spec-driven-dev-lead.md) | build | `spec/*.md` | claims-auditor |
| [adlc-evals-lead](team/adlc-evals-lead.md) | build | `06-evals/*` | claims-auditor |
| [graph-ontology-engineer](team/graph-ontology-engineer.md) | build | `graph/*` (engagement), `graph/`, `ontology/` (this repo) | claims-auditor |
| [solution-designer](team/solution-designer.md) | build | `prd/*.md`, `portal/*` | claims-auditor |
| [academy-curriculum-lead](team/academy-curriculum-lead.md) | build | `academy/**` (this repo) | claims-auditor |
| [claims-auditor](team/claims-auditor.md) | judgment | `claims/*.md`, `receipts/*.md`, `review.md` | a human or a reviewer on another model provider |
| [visual-director](team/visual-director.md) | build | `visuals/**` | claims-auditor |
<!-- roster:end -->

Engagement paths are relative to the customer's `docs/architecture/`. Tiers follow the AI
Architect SOP model routing: judgment work on the strongest model, build work on the default
model, mechanical work on a script.

**Inherited agents**, used unchanged from `../ai-architect/agents/`: `discovery-analyst` (frame,
discover), `experience-designer` (flow), `economics-analyst` (cost), `trust-reviewer` (secure),
`delivery-engineer` (operate), and `red-team` / `blue-team` when the operator asks for them.
`lead-architect` extends `principal-architect`, `adlc-evals-lead` extends `eval-engineer`, and
`claims-auditor` extends `independent-verifier`.

## Operating rules

### 1. Maker is never checker

- No agent checks its own output. Every definition names a `checker` different from itself.
- The checker holds no Write or Edit tool. It writes receipts by shell redirection into its own scope only.
- The checker is itself checked by a human or by a reviewer running on a **different model
  provider** than the maker. This is mandatory for anything priced, published or provisioned.
- A checker's verdict is bound to the files it read. Change a file after the check and the check no longer counts.

### 2. One writer per path

- Every agent has a `write_scope`. No two agents' scopes overlap. `team/check-team.mjs` enforces this.
- An agent that needs a change outside its scope asks the owner; it does not make the change.
- Never overwrite an existing artifact. Write `<name>.proposed.md` beside it and say so (inherited rule).
- One agent per git branch or worktree. Stage files with explicit paths, never `git add .`.

### 3. Claims audit

Every sentence that states a fact carries one of these, inline or in a table column:

| Tag | Means | Example |
|---|---|---|
| source URL + read date | read on a primary page this session | `https://developers.cloudflare.com/ai-gateway/ (read 2026-10-05)` |
| `[MEASURED <cmd>, <date>]` | produced by running a command; the command is shown | `[MEASURED node graph/archgraph.mjs validate ..., 2026-10-05]` |
| `[UNVERIFIED]` | from a secondary source or memory; not checked on a primary page | third-party price figures |
| `[OPEN]` | unknown; names who or what would answer it | a latency budget the customer has not set |

Never fill `[OPEN]` with a plausible guess. Never hand-type a number a command can produce. The
`claims-auditor` re-derives a sample of every class of claim before a stage's gate can pass, and
refuses any vendor-affiliation, social-proof or customer-data claim outright (SOUL.md R2, R3, R6).

### 4. Human gates

Inherited from the AI Architect SOP. No agent crosses these; it names the action and stops:
`publish`, `external_send`, `spend`, `dns`, `credentials`, `destructive`, `legal_ip`,
`brand_identity`. Provider MCP servers are connected read-only for the same reason.

### 5. Live grounding

Before writing any version-sensitive fact (model names, SDK versions, limits, prices, product
names, status such as GA or archived), fetch the current page or query Context7. Add any primary
source you rely on that is not already in `docs/research/` to `team/grounding-ledger.json` with
the read date and what it confirmed.

### 6. Loops, budgets and stop conditions

Work runs through the loop in `loops/architecture-delivery.loop.yaml`: spec, ADR, C4 agentic
profile, build, eval gate, claims audit, ship. Each stage has a maker, a checker, a retry cap and a
budget; the loop stops on the conditions written there. `loops/check-loops.mjs` enforces the shape.

## Commands

Zero dependencies; Node 20 or later.

```
node team/check-team.mjs                 # roster, frontmatter, grounding, maker != checker, one writer per path
node loops/check-loops.mjs               # loop shape, budgets, retry caps, gates, agent references
node graph/archgraph.mjs validate graph/examples/edge-gemini-railway-vercel.graph.json
node graph/archgraph.mjs mermaid  graph/examples/edge-gemini-railway-vercel.graph.json
node ontology/validate.mjs               # ontology integrity and the lens-to-capability coverage
node skills/check-skills.mjs             # every SKILL.md against the agentskills.io rules
```

Run all of them before handing work over. A red check is reported, not hidden.

## Where things are

- `SOUL.md`: identity, values, voice, refusal rules, what excellence means
- `team/`: one definition per specialist, plus `check-team.mjs` and `grounding-ledger.json`
- `loops/`: loop designs (YAML), gate definitions, the YAML subset parser, `check-loops.mjs`
- `graph/`: architecture graph JSON Schema, example instance, `archgraph.mjs`
- `ontology/`: architecture ontology (JSON-LD), AWS Agentic AI Lens questions and capability map, `validate.mjs`
- `SKILLS.md`: skill index with triggers
- `docs/research/`, `data/provider-matrix.json`: the sourced provider research every agent grounds in

## Known conflicts

- `CLAUDE.md` declares "Full Autonomy Mode: all operations pre-approved". The human gates in rule 4
  still apply to every agent in this repository.
- `CLAUDE.md`'s model selection table (dated January 2026) and OCI DAC sizing table carry no sources.
  Do not quote them. Fetch current figures and cite them, or write `[OPEN]`.
- The reference-layer skills in `SKILLS.md` passed `node skills/check-skills.mjs` on 2026-10-05,
  but their figures are dated 2026-01-06 and mostly `[UNVERIFIED]`. Re-check before quoting.
