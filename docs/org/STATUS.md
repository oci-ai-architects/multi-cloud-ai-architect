# Status: AI Architects org reshape

As of 2026-10-06. Branch `agent/claude/org-reshape`, draft PR 1.

## Landed as drafts (nothing merged)

| PR | What |
|---|---|
| [multi-cloud-ai-architect 1](https://github.com/oci-ai-architects/multi-cloud-ai-architect/pull/1) | Research, charter, business plan, roadmap, SOUL and AGENTS, 15 specialists, loops, architecture graph, ontology, 7 skill packs, academy credential and scorer, static portal, Apache-2.0 LICENSE |
| [multi-cloud-ai-architect 5](https://github.com/oci-ai-architects/multi-cloud-ai-architect/pull/5) | 23 legacy skills brought to the agentskills.io rules (`node skills/check-skills.mjs`: 30 skills, 0 failing) |
| [multi-cloud-ai-architect 6](https://github.com/oci-ai-architects/multi-cloud-ai-architect/pull/6) | Ledgerline two-cloud reference build, evals run locally with a stub model |
| oci-genai-guides 1, invoice-oci 1, .github 1 | Affiliation text corrected, licence statements, org profile. Codex SIGN-OFF at the reviewed heads |
| claude-code-oci-ai-architect-skills 5 | Strict-manifest install fix, work-mode reframed. Needs a fresh review at head `9e8f8ff` |
| oci-one-click-stacks 11, openclaw-on-oci 1 | Add Apache-2.0 LICENSE |

Issues: 33 created from `docs/org/issues.json` across the org and the three frankxai repos.

## Verify

```
node team/check-team.mjs
node loops/check-loops.mjs
node graph/archgraph.mjs validate graph/examples/edge-gemini-railway-vercel.graph.json
node ontology/validate.mjs
node skills/check-skills.mjs
node docs/academy/score.mjs docs/academy/SAMPLE-SUBMISSION --fixture
```

## Decisions applied as reversible defaults

- Railway is a primary provider with Google Cloud, Cloudflare and Vercel.
- Licence: Apache-2.0 for repos that had none.
- Credential working title: "AI Architect Credential". No refund guarantee until a first cohort has run.
- Waitlist stays closed until the estate demand-capture store is provisioned.

## Open

1. Org rename (recommended `ai-architect-guild`, free on 2026-10-06). Web UI only.
2. Merge the two Codex-approved PRs: `oci-genai-guides` 1 and `invoice-oci` 1.
3. Independent review of PR 5 (skills) and PR 6 (two-cloud build) before merge.
4. Pre-rename hygiene items, tracked privately.
5. Real-model run and live deploys for the reference build. Not done; the stub model shows only that the pipeline and guards behave as specified.
