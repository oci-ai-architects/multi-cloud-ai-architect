# Free path: the self-serve route into the cohort

About 25 hours, no account, no payment, no form until the end. Everything here stays free:
reading, labs, the plugin, the sample submission and the machine preflight. What costs money later
is human time: two reviewers, a defence and a cohort room. Draft v0.1, 2026-10-05.

Reference bar: the Google/Kaggle 5-Day AI Agents Intensive (free, large reach, a capstone) and
DeepLearning.AI's free short courses. This path has to be at least that good and stay
vendor-neutral. It beats them on one dimension: you finish holding your own scored design artifact
and a calibrated reviewer's eye, where they end at a notebook or a quiz.

AA = [`frankxai/ai-architect-academy`](https://github.com/frankxai/ai-architect-academy),
AR = [`frankxai/ai-architect`](https://github.com/frankxai/ai-architect).

## The six steps

| # | step | hours | do | you leave with |
|---|---|---|---|---|
| 1 | Learn the shape | 3 | read AR `guide/manuscript/01-the-architects-job.md`, `02-four-decisions.md`, `03-seven-planes.md` | the four decisions and seven planes the whole credential is built on |
| 2 | Watch the team work | 1 | install the plugin (`/plugin marketplace add frankxai/ai-architect`, or `npx skills add frankxai/ai-architect`) and read the support-triage worked run in AR `examples/` | what a gated architecture run leaves in a repository, including an honest red gate |
| 3 | Build | 15 | clone AA, open Claude Code, `/start-lab 01`, `02`, `03` (RAG pipeline, multi-agent system, MCP server); the instructor asks before it tells | three passing lab test suites |
| 4 | Decide | 2 | take the ADR template from the academy site (the waitlist gift, also free without signing up) and write one ADR for a decision you face at work | one ADR you can self-check against rubric c2.2 |
| 5 | Review like a reviewer | 2 | read [`SAMPLE-SUBMISSION/`](SAMPLE-SUBMISSION/README.md) in its reading order; score it yourself against [`RUBRIC.json`](RUBRIC.json) before opening `submission.json`; then compare | your scores beside two reviewers', with the notes that explain each gap |
| 6 | Preflight your own | 2+ | start a capstone repo with the submission layout and run `node score.mjs <your-repo> --preflight-only` | the list of what a reviewer would mark "asserted" today |

Step 5 is the part no free course offers: learning the bar by grading a full submission and seeing
where two trained reviewers disagreed and why (c6.2 in the sample went to adjudication).

## Optional free credentials alongside

These do not count toward this credential and are not required. They are useful context and cost
nothing (per [provider research](../research/providers/)):

- Oracle Agentic AI Foundations Associate: free course and exam (40 questions, 60 minutes).
- Google/Kaggle 5-Day AI Agents Intensive: free, with a capstone.
- Anthropic Academy courses: free.
- Vercel Academy, "Builders Guide to the AI SDK": free completion certificate.
- DeepLearning.AI short courses: videos free; labs and certificates need Pro
  ($25/mo annual, $30/mo monthly [UNVERIFIED]).

## Ready for the cohort when

- labs 01 to 03 pass their test suites;
- your own ADR scores at least 3 on c2.2 by your own blind check, and you can name the rejected
  option a reasonable engineer would have chosen;
- your blind score of the sample is within 1 of the final score on at least 15 of 20 criteria;
- preflight runs on your capstone skeleton, even if most criteria are still dirty.

None of this is checked by anyone. It is the honest test of whether ten weeks of cohort time will
be spent on architecture or on catching up.

## Where it leads

The last screen of the free path is the waitlist: email first, then three skippable questions
(expected price band, who you are, what you are trying to do). The answers decide whether a cohort
runs, at what price, and for whom. See [`PRICING-AND-WAITLIST.md`](PRICING-AND-WAITLIST.md).

Publishing note for the site: per AA `CONTENT-CONTRACT.md` rule 2, the site renders this path as
links to the files above. It does not copy their prose, and it states no count that a command did
not produce.
