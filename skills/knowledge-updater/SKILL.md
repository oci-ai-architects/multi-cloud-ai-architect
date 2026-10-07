---
name: knowledge-updater
description: Procedure for refreshing version-sensitive facts in this toolkit - model names, agent framework and SDK versions, frontend framework versions and gateway catalogues - by checking primary release pages, diffing against dev-docs/VERSION-TRACKING.md, updating skill metadata, and writing a sourced change report. Use when a skill or doc may cite an outdated model or SDK version, before quoting a version in a design, or when asked to check what is current. Trigger on "update knowledge", "check versions", "outdated", "latest versions", "is this still current". Superseded for this repo by loops/provider-refresh.loop.yaml, which carries the budgets, gates and checker; use this skill only as the manual fallback.
metadata:
  version: "1.2.0"
  asOf: "2026-10-05"
  contentAsOf: "2026-01-06"
  scope: reference
  supersededBy: loops/provider-refresh.loop.yaml
---

# Knowledge updater

Content as of 2026-01-06. The source lists and file paths below were not re-checked on 2026-10-05. In this repository the scheduled refresh runs through `loops/provider-refresh.loop.yaml`; prefer it, and treat this file as the manual procedure behind it.

## Purpose

Keep version references across the toolkit current by checking them systematically against primary sources and updating them with a dated, sourced record.

## Why this matters

Model line-ups, agent SDKs and frontend frameworks change on a cycle of weeks. A skill that names last quarter's model or SDK version produces a recommendation that is wrong on the day it is given. Every version claim therefore carries the page it came from and the date it was read, or it is marked `[UNVERIFIED]`.

## Update workflow

### Step 1: discover current versions

**LLM models** (check monthly). Read each provider's own model or release page, never a search snippet or a third-party list:
```
- OpenAI: https://platform.openai.com/docs/models
- Anthropic: https://docs.anthropic.com/en/docs/about-claude/models
- Google: https://ai.google.dev/gemini-api/docs/models
- Meta: https://www.llama.com/
- Mistral: https://docs.mistral.ai/getting-started/models/
```

**Agent frameworks** (check weekly)
```
Sources:
- Vercel AI SDK: https://github.com/vercel/ai/releases
- OpenAI Agents: https://github.com/openai/openai-agents-python/releases
- LangGraph: https://github.com/langchain-ai/langgraph/releases
- Claude Agent SDK: https://github.com/anthropics/claude-agent-sdk-python/releases
```

**Frontend** (check monthly)
```
Sources:
- Next.js: https://github.com/vercel/next.js/releases
- React: https://github.com/facebook/react/releases
```

**AI gateways** (check monthly)
```
- OpenRouter: model catalogue at https://openrouter.ai/models (count it, do not quote a remembered figure)
- New providers and features on each gateway's changelog
```

### Step 2: compare against VERSION-TRACKING.md

Read current versions from `dev-docs/VERSION-TRACKING.md` and identify deltas.

### Step 3: update files

**If changes are detected:**

1. **VERSION-TRACKING.md**
   - Update version numbers, each with source URL and read date
   - Update the `Last Updated` date
   - Add any new technologies

2. **Affected skills.** Frontmatter follows the agentskills.io spec, so version data lives under `metadata`:
   ```yaml
   # In skills/*/SKILL.md frontmatter:
   metadata:
     version: "X.Y.(Z+1)"     # increment patch
     asOf: "<today>"          # date this skill was last reviewed
     contentAsOf: "<date>"    # date the body's facts were last checked
   ```
   Then update the as-of note under the skill's H1 and the as-of line on any table you re-checked. Run `node skills/check-skills.mjs` afterwards.

3. **CLAUDE.md** (if model changes)
   - Update the model selection table with sources, or remove rows that cannot be sourced
   - Update pricing only with a source URL and read date

4. **CONTEXT.md**
   - Add an entry to the Recent Changes table

### Step 4: generate a report

```markdown
## Knowledge update report - [DATE]

### Summary
- Technologies checked: X
- Updates found: Y
- Files modified: Z

### Version changes
| Technology | Previous | Current | Source (URL, read date) |
|------------|----------|---------|-------------------------|
| <name> | <old> | <new> | <url>, <date> |

### Skills updated
- skills/<skill>/SKILL.md

### Action required
- [ ] Review changes
- [ ] Commit with explicit pathspecs: `git commit -m "chore: update versions [date]" -- <paths>`
- [ ] Push to remote
```

## Automation patterns

### Cron-style schedule
```
Weekly: every Monday 9 AM
- Run full version check
- Update if changes found
- Generate report

Monthly: first of month
- Deep check of deprecations
- Update pricing if changed, with source and date
- Review deprecated technologies
```

### Event-triggered
```
Triggers:
- User says "outdated", "latest", "current version"
- Major AI announcement detected
- Before `/design-solution` command
```

## Best practices

### Do
- Cite a primary source URL and read date for every version claim
- Preserve existing skill content; update metadata and dated tables only
- Generate a diff-style report showing changes
- Include a benchmark score only with its source URL and read date, and label it as the vendor's figure

### Do not
- Update without verification
- Change skill content beyond metadata and dated facts
- Skip the report generation
- Forget to update the CONTEXT.md changelog

## Version numbering convention

For skills:
- **Major (X.0.0)**: complete rewrite, breaking changes
- **Minor (X.Y.0)**: new sections, significant additions
- **Patch (X.Y.Z)**: version updates, typo fixes, metadata only

## Integration with other commands

```
/update-knowledge → /design-solution
                 ↓
         (ensures current versions are used in recommendations)

/update-knowledge → /commit
                 ↓
         (saves updates to git)
```

## Changelog

- 1.2.0: frontmatter to agentskills.io spec, stale figures dated and sourced, primary release pages listed per provider, metadata update step rewritten for the spec, pointer to loops/provider-refresh.loop.yaml.
- 1.0.0: initial skill, dated 2026-01-06.
