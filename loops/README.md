# Loops

Loop designs that run the team in `team/` through gated stages. Each loop is a YAML file in a
strict subset that `lib/yaml-lite.mjs` parses without dependencies, and `check-loops.mjs` validates.

```
node loops/check-loops.mjs          # human-readable
node loops/check-loops.mjs --json   # machine-readable
```

## The loops

| Loop | Stages | Ends at |
|---|---|---|
| `architecture-delivery.loop.yaml` | intake, spec, adr, c4, build, eval-gate, claims-audit, ship | `gate.ship`, which only the operator can pass |
| `provider-refresh.loop.yaml` | sweep, audit | a human merging or rejecting proposed research changes |

`architecture-delivery` extends the AI Architect lifecycle in `../ai-architect`. Its intake stage
runs the inherited frame, discover and flow stages; the adr stage also runs the inherited cost and
trust stages; build runs the inherited operate stage; claims-audit includes the inherited
`gate.verify`. Five gates are new and live in `gates/`: `gate.spec`, `gate.c4`, `gate.build`,
`gate.claims`, `gate.ship`. They follow `../ai-architect/schemas/operating-excellence-gate.schema.json`.

## What the validator enforces

- Required keys on the loop and on every stage.
- Budgets are numbers, say whether they are policy defaults or measured, and `max_spend_usd` is 0.
- Retry caps are integers no greater than 3, and a no-progress rule exists.
- Stop conditions cover human gates, budgets and retry caps; every stage has its own `stop_if`.
- Human gates are drawn from the eight in the AI Architect SOP.
- Maker and checker differ on every stage, and every agent reference resolves to `team/`, to
  `../ai-architect/agents/`, or to `operator`, `human-or-other-provider` or `external:*`.
- Every gate resolves to `gates/` or `../ai-architect/gates/` and carries the schema's required fields.
- `on_pass` only moves forward; `on_fail` only moves back or stays.
- Every stage output lies inside one of its makers' `write_scope` globs in `team/`.
- The final stage requires a human gate, and some stage reaches `done`.
- The worst case (every stage fails as often as its cap allows, retries never reset) fits
  `budgets.max_stage_runs`. The current figures are printed on each run.

## Budgets

The numbers in `budgets` are policy defaults this organisation chose, and say so in
`budgets.basis`. They are not measurements of how long an engagement takes. Once an engagement
has run, record measured values with `basis: measured` and the receipt that produced them.

## Retry semantics

A retry re-runs the maker with the checker's failed criteria as its only new input. Two consecutive
failures with identical failed criteria stop the loop: repeating the same attempt is not progress.
A failure in a later stage can send work back to an earlier one (for example `c4` back to `adr`),
and that return consumes the later stage's retry budget.
