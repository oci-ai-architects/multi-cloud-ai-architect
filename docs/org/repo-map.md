# oci-ai-architects: repo map and reshape plan

Audit date: 2026-10-05. Scope: all 14 public repos in `oci-ai-architects` plus the related
`frankxai` repos. Read-only audit: nothing was committed, pushed or edited in any audited repo.
Companion file: [`issues.json`](issues.json) (the work list to reach the target state).

This file sits in a public repository, so it carries no customer, personal or deal data.

## 1. Pre-rename hygiene

A small set of pre-rename items is tracked privately by the maintainer and is not described in this public file. They are scheduled as week-1 work in `ROADMAP.md` and must finish before any repo is renamed or made public again.

Public-safe items (P0-3, affiliation text) are tracked as issues: `oci-genai-guides` and `invoice-oci` carried statements that presented personal work as an Oracle team output. Fixed in draft PRs on both repos.

Secret scan result: clean. Working trees and full history of the five local clones and the HEAD of the seven remote-only repos were scanned for cloud credentials, API tokens, private keys and quoted secrets. Every hit was a placeholder.

## 2. Naming scheme

Org: rename `oci-ai-architects` to **`ai-architects-community`**. The name is free as of 2026-10-05.
`ai-architects` and `aiarchitects` are taken by dormant user accounts. `cloud-ai-architects` is
free and is the fallback. GitHub redirects the old repo URLs after a rename. The old org name then
becomes claimable by anyone, and if someone claims it the redirects stop. Decide whether to accept
that risk or to update every inbound link (frankxai stubs, Academy, frankx.ai, marketplace
commands) on rename day.

Repos inside the org:

| Kind | Pattern | Examples | Rule |
|---|---|---|---|
| Vendor-neutral core | `<topic>` | `architect-skills`, `patterns`, `genai-guides`, `ai-coe-starter-kit` | No provider mark in the name. |
| Provider pack | `pack-<provider>` | `pack-oci`, `pack-aws`, `pack-azure`, `pack-gcp`, `pack-cloudflare`, `pack-vercel`, `pack-railway` | The provider's mark appears only as a descriptive suffix (nominative use). Every pack README carries the standard disclaimer. |
| Deploy stacks | `stacks-<provider>` | `stacks-oci` | One repo per provider, one folder per stack, release ZIPs per stack. |
| Worked example | `example-<use-case>` | `example-invoice-extraction` | Provider adapters live inside. |
| Org meta | `.github` | | Profile, shared workflows, CODEOWNERS, SECURITY, CONTRIBUTING. |

Harness is **not** a naming axis any more. Repos named `claude-code-*`, `cline-*` and `codex-*`
held near-identical content. One `SKILL.md` set plus thin `adapters/` (`.clinerules/`,
`.cursor/rules/`, `.roo/`, `.windsurf/`, `AGENTS.md`, `.claude-plugin/`) in each pack covers all
of them.

Plugin and skill identifiers follow the same rule. `oracle-adk` becomes `oci-adk`,
`oracle-ai-architect-skills` becomes `pack-oci`, and `oracle-infogenius` becomes
`architecture-visuals` (it is not provider-specific).

Standard disclaimer (already used verbatim in `oci-ai-coe-starter-kit/README.md:3`; extend it to
every pack):

> Unofficial community project. Not affiliated with, endorsed by, or sponsored by
> &lt;Provider&gt;. &lt;Marks&gt; are trademarks of their respective owners.

Licence: **Apache-2.0** everywhere, with `LICENSING.md` and `NOTICE`. This matches the decision Frank
already applied to the frankxai copies on 2026-08-27 ("Adopt Apache-2.0 and correct ownership") and
to `frankxai/ai-architect`. Every org repo has one human contributor (`frankxai`), so relicensing
needs no third-party sign-off. The open PR #4 from `evangineer` is unmerged, so ask for a DCO
sign-off or Apache-2.0 consent when it is merged. Derived material keeps its upstream licence:
`invoice-oci` adapts `gruntemannen/invoice-vNext` (MIT), so the MIT notice goes into `NOTICE`.

## 3. Repo-by-repo audit

Quality is an honest 1-5. 1 means broken or misleading, 3 means usable with caveats, 5 means a
stranger would pay for it. Size is GitHub `diskUsage` in KB. "OCI share" is my estimate of how much
of the content only makes sense on Oracle Cloud.

### 3.1 Summary table

| Repo | Size KB | Licence | Last push | Quality | OCI share | Duplicates | Verdict | Target |
|---|---|---|---|---|---|---|---|---|
| `claude-code-oci-ai-architect-skills` | 4711 | MIT | 2026-02-24 | 3 | ~90% | `frankxai/claude-code-oracle-skills` (full divergent copy); `cline-*` and `codex-*` content | RENAME + GENERALISE (absorbs cline, codex, cline-engineer) | `pack-oci` |
| `multi-cloud-ai-architect` | 282 | **none** | 2026-01-28 | 2 | ~35% | 9 files byte-identical with `oci-ai-architect`; 6 skills identical apart from line endings | RENAME + GENERALISE (OCI skills move out) | `architect-skills` |
| `oci-ai-architect` | 734 | **none** | 2026-01-28 | 1 (salvage: patterns 2) | ~60% | knowledge-base and 6 skills duplicate `multi-cloud-ai-architect`; `ai-coe/` and `methodology/` duplicate each other | P0 scrub, then split: patterns go to `patterns`, OCI skills to `pack-oci`, rest ARCHIVE | `patterns` (new, from a scrubbed export) |
| `oci-genai-guides` | 80 | MIT | 2026-01-28 | 2 | ~70% | `frankxai/oracle-genai-guides` (copy); overlaps `agentic-architecture-field-guide` | RENAME + GENERALISE | `genai-guides` |
| `oci-ai-coe-starter-kit` | 30 | MIT | 2026-02-26 | 3 | ~75% | overlaps `frankxai/ai-coe`, `awesome-ai-coe` | RENAME + GENERALISE | `ai-coe-starter-kit` |
| `cline-oci-ai-architect-skills` | 97 | MIT | 2026-03-06 | 2 | ~90% | 11 workflows byte-identical with `cline-oci-ai-engineer`; skills duplicate `pack-oci` | MERGE-INTO `pack-oci` (as `adapters/cline`, `cursor`, `roo`, `windsurf`) | archive after merge |
| `codex-oci-ai-architect-skills` | 44 | MIT | 2026-03-06 | 2 | ~90% | same 11 workflow titles as cline | MERGE-INTO `pack-oci` (as `adapters/codex` + `AGENTS.md`) | archive after merge |
| `cline-oci-ai-engineer` | 31 | **none** | 2026-02-10 | 1 | ~95% | 100% duplicate of cline workflows | MERGE-INTO `pack-oci` (nothing unique), ARCHIVE | archive |
| `oci-one-click-stacks` | 27 | **none** | 2026-02-19 | 3 | 100% | `openclaw-on-oci` is its stage-7 stack | RENAME, absorb openclaw | `stacks-oci` |
| `openclaw-on-oci` | 16 | **none** | 2026-02-19 | 3 | 100% | `frankxai/oracleclaw-on-oci` (fork) | MERGE-INTO `stacks-oci` (as `stacks/openclaw`) | archive after merge, keep release ZIP URLs alive |
| `invoice-oci` | 665 | MIT | 2026-02-03 | 3 | ~80% | none | RENAME + GENERALISE | `example-invoice-extraction` |
| `oci_open-webui` | 386 | MIT | 2026-02-18 | n/a | 100% | fork of `dariomanda/oci_open-webui`, 0 ahead / 5 behind; also `frankxai/oci-open-webui` | ARCHIVE then delete (no own commits); `stacks-oci/stacks/openwebui-oci` already covers it | delete |
| `oci-ai-life-sciences` | 24465 | none | 2026-01-27 | n/a | 0% | fork of `anthropics/life-sciences`, 0 ahead / 4 behind | ARCHIVE then delete. An Anthropic repo republished under an "oci-" name implies an affiliation nobody has. | delete |
| `.github` | 6 | none | 2026-02-28 | 2 | 100% | n/a | KEEP, rewrite | `.github` |

### 3.2 Detail

**`claude-code-oci-ai-architect-skills`** is the strongest repo. It has 101 files, 13 skills,
8 plugins, `.claude-plugin/marketplace.json`, `tests/check_skill_completeness.py`,
`tests/validate_code_examples.py`, a quality-gates workflow, 4 stars, 2 forks and the only
outside contributor.
- Broken: an outside user reported that the plugins cannot be installed (issues #1, #2, #3 by
  `evangineer`, 2026-02-25). The fix (PR #4, +82/-224, mergeable) has been open since 2026-02-26.
  `frankxai/claude-code-oracle-skills` already has a newer fix ("pass claude plugin validate
  --strict", #2, 2026-09-30) that the org copy lacks. The two copies have diverged.
- CI: `Quality Gates` fails on Lint Markdown, Check Links and Check Skill Completeness. The last
  runs were 2026-04-13/20/27, after which the schedule was disabled for inactivity.
- Stale or wrong links: `README.md` installs from `frankxai/claude-code-oracle-skills` and links
  docs to `frankxai.github.io/claude-code-oracle-skills` (Pages is off on the org repo).
  `manifest.yaml` points to `github.com/FrankX/...`. `marketplace.json` says
  `"repository": "https://github.com/frankxai/claude-code-oracle-skills"`. Versions disagree:
  the README badge says 3.1.0, `marketplace.json` 3.0.0, `manifest.yaml` 1.0.0.
- Internal planning published: `IP_AND_NAMING_STRATEGY.md` (discusses "Employer considerations"
  and account strategy), `STRATEGIC_ASSESSMENT.md`, `MASTER_PLAN.md`,
  `docs/logs/SESSION_2026-01-27_COMPLETE.md`.
- Trademark: plugin IDs start with `oracle-` (`oracle-adk`, `oracle-ai-architect`,
  `oracle-work-mode`, `oracle-infogenius`, and so on), and the marketplace name is
  `oracle-ai-architect-skills`. The org README has no disclaimer; the frankxai copy does.
  `plugins/oracle-diagram-generator/ORACLE_ICONS_SETUP.md` tells users to fetch icons rather than
  bundling them, which is correct and should stay that way.
- Reusable: `agentic-orchestration`, `oracle-diagram-generator` (Draw.io/Mermaid/Python
  diagrams), `oracle-infogenius` (visual generation), `oracle-confidentiality` (codename
  protocol), and the `tests/` harness. Most of these are vendor-neutral under an Oracle name.
  They go to `architect-skills`.

**`multi-cloud-ai-architect`**: 88 files, 23 skills, 4 Terraform templates (~1,240 lines),
2 MCP servers (`mcp-servers/oci-infrastructure/server.py`, `terraform-ops/server.py`, untested),
D2 templates, cheatsheets and prompts.
- No LICENSE, so the code is "all rights reserved" despite being public.
- The repo is named multi-cloud but the README tagline says "with Oracle Cloud Infrastructure
  focus". The quick start runs `cd claude-ai-architect` (wrong directory name) and the tree
  diagram uses the old name. The README says "14 specialized skills"; there are 23.
- About 35% is OCI-only: `genai-dac-specialist`, `oci-services-expert`, `oracle-adk`,
  `oracle-agent-spec`, `knowledge-base/oci-genai/`, `knowledge-base/ai-infrastructure/OCI-GPU-INFRASTRUCTURE.md`,
  `templates/terraform/oci-*`, `mcp-servers/oci-infrastructure`.
- Reusable core: `rag-expert`, `mcp-architecture`, `mcp-2025-patterns`, `langgraph-patterns`,
  `agentic-orchestration`, `ai-security-expert`, `finops-ai`, `architecture-diagramming`,
  `terraform-iac`, `kubernetes-ai`, `enterprise-ai-patterns`, plus `aws-ai-services` and
  `azure-ai-services` (seeds for `pack-aws`/`pack-azure`) and `nvidia-nim`.
- Stale: model references from 2024-25 throughout the knowledge base, and the "Model Selection
  (January 2026)" table in `CLAUDE.md`. `CLAUDE.md` also says "Full Autonomy Mode: All operations
  pre-approved", which is the same unsafe advice found in `oci-ai-architect`.
- The `CLAUDE.md` "Recommended Stack (Vendor-Neutral)" table (OpenRouter, Vercel AI SDK,
  Vercel/Railway, pgvector) already points toward the multi-cloud scope this reshape is after.
- A different agent is working in `docs/research/` on this branch right now. This audit did not
  touch it.

**`oci-ai-architect`**: 225 files with no README. Besides the P0 material:
- `CLAUDE.md` lines 7-9 tell users the project "runs with `--dangerously-skip-permissions`. All
  operations are pre-approved." That is unsafe advice to ship in a public template.
- `resources/sdlc/` holds a zipped coding-session export: `__MACOSX/`, 7 `.DS_Store` files,
  `._settings.local.json`, and an HR-attrition prototype whose task outputs read like a workshop
  run.
- `ai-coe/` and `methodology/` both contain `THE_FRANK_METHOD.md` and `WORKSHOP_CURRICULUM.md`
  (byte-identical). `ai-coe/TODAY_ACCOMPLISHMENTS.md` (2025-10-14) is a session log.
  `ai-coe/EXECUTIVE_BRIEF.md` claims "$2.4M+ annual ROI" and "40-85%" efficiency without a
  source. `ai-coe/EXECUTIVE_SUMMARY.md:377` and `methodology/WORKSHOP_CURRICULUM.md:1023` pitch
  against named consulting firms.
- `ai-coe/006-oracle-aicoe-design-system.css` imitates vendor trade dress by name.
- Salvage: `patterns/` holds 24 solution patterns in 7 families (intelligent ops, CX, data
  intelligence, platform enablement, AI infra, business process, content) with business,
  technical and agent-spec files. They are mostly vendor-neutral and worth about 2/5 after
  removing the stats. `ai-coe/*/agents/agent-spec/*.yaml` (automotive, creative-marketing,
  web3, cloud-infra blueprints) and `agents/python/*.py` are also salvageable.
- Do not rename this repo in place. After the history purge, export the salvage into a fresh
  `patterns` repo and archive this one as private.

**`oci-genai-guides`**: 19 files. Four of the seven root documents are internal content strategy
(`CONTENT_STRATEGY.md`, `MASTER_CONTENT_STRATEGY.md`, `SYNTHESIS_REPORT.md` titled "FrankX
Oracle GenAI Content Strategy", `VALIDATION_REPORT.md`). The useful part is `docs/decision-guides/`
(`MULTI_CLOUD_COMPARISON.md` with 49 Bedrock/Azure/Vertex references,
`MIGRATION_BEDROCK_TO_OCI.md`, `INFRASTRUCTURE_ARCHITECTURE.md`,
`ORACLE_AI_SERVICES_DECISION_GUIDE.md`), `content/blog/series-production-genai-oci/` (3 parts) and
`github-ai-coe/QUICKSTART.py`. The README claim "GenerateText/SummarizeText APIs are deprecated as
of June 2026" was written in January 2026 and needs checking against current docs. P0-3 (the
affiliation header) is on line 3.

**`oci-ai-coe-starter-kit`**: 20 files, clean, with the correct disclaimer and
`CONTRIBUTING.md:27` "No credentials". It has 4 packs (`oci-genai-research`, `oci-adb-analytics`
with 5 real SQL scripts, `oci-clinical-ai`, `oci-coding-agent`) plus `shared/` (model matrix,
credential chain, pricing reference). The README promises `references/` and `scripts/` in every
pack, but only `oci-genai-research` has `references/`, and `oci-clinical-ai` is a single
`SKILL.md`. `shared/pricing-reference.md` needs a retrieved-on date per row. The structure is the
reusable part: SKILL.md, references and scripts, plus a "which team gets which pack" matrix. That
is the right shape for a provider-neutral CoE kit with OCI as the first implementation.

**`cline-oci-ai-architect-skills`**: 39 files with good cross-harness rule files for Cline,
Cursor, Roo and Windsurf. `.clinerules/intelligence/state/routing-history.jsonl` and
`routing-metrics.json` are runtime state committed by accident. `.windsurf/rules/` has
`oracle-standards.md` but no `execution-mode.md`. The skills duplicate the Claude pack.

**`codex-oci-ai-architect-skills`**: 25 files: `AGENTS.md`, 4 profiles, 3 instruction modules
and 12 workflows. `profiles/oracle-work.md` and `instructions/oracle-naming-standards.md` are
OCI-only. This becomes the `adapters/codex` layer of `pack-oci`.

**`cline-oci-ai-engineer`**: 12 files. Its README describes `.clinerules/` and `skills/`, which do
not exist, and clones `oci-ai-architects/oci-ai-engineer-skills`, a repo that does not exist. All 11
workflows are byte-identical to `cline-oci-ai-architect-skills/workflows/`. Nothing in it is unique.

**`oci-one-click-stacks`**: 37 files. Three real Resource Manager stacks (`hello-oci-vm`,
`uptime-kuma-oci`, `openwebui-oci`) with `schema.yaml`, `scripts/validate-stack.sh` and
`package-stack.sh`. Releases v0.1.0 and v0.2.0. Seven open roadmap issues (#2-#9: umami, n8n, dify,
onyx, ragflow, chatwoot, openhands). No LICENSE and no disclaimer. `docs/enterprise-token-*.md`
and `catalog/enterprise-token-*.yaml` frame stacks by "token demand". That is planning, not user
documentation.

**`openclaw-on-oci`**: 15 files with a working "Deploy to Oracle Cloud" button pinned to release
`v0.2.1`, Bastion, a private subnet and a Podman-first design. No LICENSE and no disclaimer.
`variables.tf:112` and `cloud-init.tftpl:22-44` optionally clone an ACOS repo into the instance,
which couples a personal product into a community stack. The default must stay empty and be
documented as optional. After the merge, the old release ZIP URL must keep resolving, or the
deploy button breaks.

**`invoice-oci`**: 16 files. Two OCI Functions (`functions/invoice-processor`,
`functions/fusion-transformer`), Terraform with `schema.yaml`, and an architecture image.
`docs/images/CLAUDE.md` is a stray claude-mem activity log. It properly credits the MIT upstream
`gruntemannen/invoice-vNext` (`README.md:242`). P0-3 is in `DISCLAIMER.md`. The extraction pattern
(object storage, LLM, JSON, ERP interface) is provider-neutral and makes a good worked example
across providers.

**`.github`**: one file. It links `oci-ai-architects/oci-coe-starter-kit`, which does not exist
(the repo is `oci-ai-coe-starter-kit`). It has a typo ("build for ai systems") and makes
unverifiable claims ("battle-tested", "Built by enterprise AI architects who run production AI
systems"). The org itself has no display name, description or URL, and no repo has topics.

## 4. Related frankxai repos

| Repo | State | Relation | Verdict |
|---|---|---|---|
| `frankxai/claude-code-oracle-skills` | Apache-2.0, pushed 2026-09-30, "MOVED" banner but **full content** | Ahead of the org copy (Apache relicense, LICENSING/NOTICE, strict-manifest fix #2) | Port its changes into `pack-oci`, then cut it to a pointer README and archive it |
| `frankxai/oci-ai-architect` | Apache-2.0, 2026-08-27, full content minus `resources/` | Older copy | Pointer README, then archive |
| `frankxai/oracle-genai-guides` | Apache-2.0, 2026-08-27, full content including strategy docs | Same as org copy | Pointer README, then archive |
| `frankxai/oracleclaw-on-oci` | fork of `openclaw-on-oci`, no licence | Duplicate | Archive |
| `frankxai/oci-open-webui` | fork of `dariomanda/oci_open-webui` | Duplicate of the org fork | Archive |
| `frankxai/ai-architect` | Apache-2.0, active (2026-10-01), 9-stage gated lifecycle, `skills/cloud-harness` overlay, `prices/prices.json` | The product. Its `cloud-harness` already names AWS Bedrock, Azure OpenAI, GCP Vertex, Vercel and Railway | Keep on frankxai. The org's `pack-*` repos become the evidence that `/architect-cloud` reads: each pack ships `prices.json` rows with `source_url` and `retrieved_at` |
| `frankxai/ai-architect-academy` (+ private `AI-Architect-Academy/*`) | own brand, `11-hyperscalers/{aws,azure,gcp,oci}` | Learning layer | Keep. Link to the packs from `11-hyperscalers/*` |
| `frankxai/ai-coe` | no licence, 2026-09-08 | CoE operating model | Keep. `ai-coe-starter-kit` links to it as the operating model and stays the skill-pack layer. It needs its own licence |
| `frankxai/awesome-ai-coe` | CC0, 2026-09-29 | Catalog | Keep. List the org repos in it |
| `frankxai/agentic-architecture-field-guide` | MIT, 2026-10-03, vendor-neutral | Overlaps `genai-guides` on architecture decisions | Keep. `genai-guides` stays provider-comparison and migration, and links the field guide for agent OS architecture |

## 5. Target repo set (14)

| # | Target repo | Built from | Purpose |
|---|---|---|---|
| 1 | `.github` | `.github` | Org profile, reusable CI workflows, CONTRIBUTING, SECURITY, CODEOWNERS, disclaimer text, pack contract |
| 2 | `architect-skills` | `multi-cloud-ai-architect` (rename) + neutral skills from `claude-code-oci-ai-architect-skills` | Vendor-neutral skills: RAG, MCP, orchestration, security, FinOps, diagramming, IaC, Kubernetes, confidentiality, visuals |
| 3 | `pack-oci` | `claude-code-oci-ai-architect-skills` (rename, keeps stars, forks, issues) + cline + codex + cline-engineer + OCI skills from 2 and the old `oci-ai-architect` | OCI provider pack with adapters for every harness |
| 4 | `pack-aws` | new; seed `multi-cloud-ai-architect/skills/aws-ai-services` | Bedrock, AgentCore, SageMaker, Bedrock Knowledge Bases |
| 5 | `pack-azure` | new; seed `skills/azure-ai-services` | Azure OpenAI / AI Foundry, AI Search |
| 6 | `pack-gcp` | new | Vertex AI, Gemini API, Agent Builder, ADK, A2A |
| 7 | `pack-cloudflare` | new | Workers AI, AI Gateway, Vectorize, Agents SDK, Durable Objects, D1/R2 |
| 8 | `pack-vercel` | new | AI SDK, AI Gateway, Fluid compute, Sandbox, Workflow |
| 9 | `pack-railway` | new | Templates, services, volumes, private networking for agent runtimes |
| 10 | `patterns` | fresh repo from the scrubbed `oci-ai-architect/patterns/` + agent-spec blueprints | 24 solution patterns, vendor-neutral, provider mappings per pattern |
| 11 | `genai-guides` | `oci-genai-guides` (rename) | Provider comparison, migration guides between providers, production series |
| 12 | `ai-coe-starter-kit` | `oci-ai-coe-starter-kit` (rename) | Team-by-team skill packs; OCI is the first implementation, other providers follow |
| 13 | `stacks-oci` | `oci-one-click-stacks` (rename) + `openclaw-on-oci` | One-click Resource Manager stacks |
| 14 | `example-invoice-extraction` | `invoice-oci` (rename) | End-to-end worked example with provider adapters (OCI first) |

Each provider pack follows one contract, defined in `.github`: `skills/` (SKILL.md),
`adapters/{claude,codex,cline,cursor,roo,windsurf}`, `references/`, `prices.json` (a row per
service with `source_url` and `retrieved_at`, which `frankxai/ai-architect` can read), `evals/`
(trigger and answer cases), `DISCLAIMER.md`, `LICENSE` (Apache-2.0) and `NOTICE`.

## 6. Old to new mapping

| Old (`oci-ai-architects/…`) | Action | New (`ai-architects-community/…`) |
|---|---|---|
| `claude-code-oci-ai-architect-skills` | rename + absorb 3 repos | `pack-oci` |
| `cline-oci-ai-architect-skills` | merge into `pack-oci/adapters/{cline,cursor,roo,windsurf}`, archive | (archived) |
| `codex-oci-ai-architect-skills` | merge into `pack-oci/adapters/codex`, archive | (archived) |
| `cline-oci-ai-engineer` | archive (nothing unique) | (archived) |
| `multi-cloud-ai-architect` | rename, move OCI skills to `pack-oci`, AWS/Azure seeds to packs | `architect-skills` |
| `oci-ai-architect` | P0 purge, make private, export salvage, archive | `patterns` (new) |
| `oci-genai-guides` | rename, drop strategy docs | `genai-guides` |
| `oci-ai-coe-starter-kit` | rename, generalise | `ai-coe-starter-kit` |
| `oci-one-click-stacks` | rename, absorb openclaw | `stacks-oci` |
| `openclaw-on-oci` | merge into `stacks-oci/stacks/openclaw`, keep release asset URL, archive | (archived) |
| `invoice-oci` | rename, generalise | `example-invoice-extraction` |
| `oci_open-webui` | delete (fork, 0 own commits) | n/a |
| `oci-ai-life-sciences` | delete (fork, 0 own commits) | n/a |
| `.github` | rewrite | `.github` |
| new | create | `pack-aws`, `pack-azure`, `pack-gcp`, `pack-cloudflare`, `pack-vercel`, `pack-railway` |

## 7. Order of work

1. **Pre-rename hygiene, privately:** clear the privately tracked items (section 1). Fix the P0-3
   affiliation text in `oci-genai-guides` and `invoice-oci`. That fix is a one-line change in two
   repos and needs no history rewrite.
2. **Stop the bleeding in `pack-oci`:** reconcile it with `frankxai/claude-code-oracle-skills`,
   merge PR #4 or the strict-manifest fix, make `claude plugin validate --strict` pass in CI, and
   reply on issues #1-#3.
3. **Hygiene sweep across every repo:** Apache-2.0 + `LICENSING.md` + `NOTICE`, the disclaimer,
   removal of internal docs and junk, org-wide secret scanning with push protection, and the shared
   CI workflow.
4. **Rename the org and the repos,** then do the merges. Update inbound links the same day.
5. **Write the pack contract,** then build the provider packs. `pack-gcp` and `pack-vercel` come
   first because demand signals already exist in the estate: the `partner-google-specialist` and
   `partner-vercel-specialist` agents, and `ai-architect`'s `cloud-harness` list. Then
   `pack-cloudflare`, `pack-aws`, `pack-azure`, `pack-railway`.

## 8. Method

- Local clones (full history; none shallow): `multi-cloud-ai-architect`, `oci-ai-architect`,
  `oci-genai-guides`, `oci-ai-coe-starter-kit`, `claude-code-oci-ai-architect-skills`. The other
  seven non-fork repos were shallow-cloned read-only into `starlight/scratch/org-audit/`.
  Forks and frankxai repos were read through `gh api`.
- Secret patterns: OCID (`ocid1.<type>.oc1..` + 40 chars), `AKIA…`, `sk-ant-`, `sk-proj-`,
  `ghp_`, `xox[bap]-`, `AIza…`, `nvapi-…`, PEM private-key headers, OCI key fingerprints, and quoted
  credential literals. Run over working trees and `git log -p --all`.
- Confidentiality patterns: "confidential", "internal use only", employer e-mail domains,
  NDA, employer/employee statements, a list of large-enterprise names, and "Client:" constructs.
- Duplication: md5 of every tracked file across repos, then `diff --strip-trailing-cr` on
  same-named skills.
- CI, issues, PRs, forks, contributors, releases: `gh run list`, `gh issue list`, `gh pr view`,
  `gh api …/forks`, `…/contributors`, `gh release list`.
