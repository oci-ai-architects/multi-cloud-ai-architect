#!/usr/bin/env node
// Validates loops/*.loop.yaml: required shape, budgets, retry caps, human gates, maker != checker,
// that every agent and gate reference resolves, that every stage output falls inside one of its
// makers' write scopes, and that the worst-case number of stage runs fits the loop's budget.
//
// Usage: node loops/check-loops.mjs [--json]
// Exit 0 when every loop passes, 1 otherwise.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseYaml, parseFrontmatter } from './lib/yaml-lite.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..');
const sibling = path.resolve(repo, '..', 'ai-architect');
const asJson = process.argv.includes('--json');

const HUMAN_GATES = ['publish', 'external_send', 'spend', 'dns', 'credentials', 'destructive', 'legal_ip', 'brand_identity'];
const EXTERNAL = new Set(['operator', 'human-or-other-provider']);
const TERMINAL = new Set(['done', 'stop']);
const TOP_KEYS = ['schema', 'id', 'purpose', 'budgets', 'retry_policy', 'human_gates', 'stop_conditions', 'stages'];
const STAGE_KEYS = ['id', 'summary', 'maker', 'checker', 'gates', 'inputs', 'outputs', 'retry_cap', 'on_pass', 'on_fail', 'stop_if'];
const BUDGET_KEYS = ['max_stage_runs', 'max_wall_clock_minutes', 'max_model_tokens', 'max_spend_usd'];

const gateSchemaRequired = loadGateSchemaRequired();
const teamScopes = loadTeamScopes();
const results = [];

for (const f of readdirSync(here).filter((x) => x.endsWith('.loop.yaml')).sort()) {
  const problems = [];
  const err = (m) => problems.push(m);
  let loop;
  try { loop = parseYaml(readFileSync(path.join(here, f), 'utf8'), `loops/${f}`); } catch (e) { results.push({ file: f, problems: [e.message] }); continue; }

  for (const k of TOP_KEYS) if (loop[k] == null) err(`missing top-level key "${k}"`);
  if (loop.schema !== 'mcaa.loop.v1') err(`schema must be mcaa.loop.v1, got ${loop.schema}`);
  if (`${loop.id}.loop.yaml` !== f) err(`id "${loop.id}" does not match filename`);

  const b = loop.budgets || {};
  for (const k of BUDGET_KEYS) if (typeof b[k] !== 'number') err(`budgets.${k} must be a number`);
  for (const k of BUDGET_KEYS.filter((x) => x !== 'max_spend_usd')) if (typeof b[k] === 'number' && b[k] <= 0) err(`budgets.${k} must be positive`);
  if (b.max_spend_usd !== 0) err('budgets.max_spend_usd must be 0: spending is a human gate');
  if (!['policy-default', 'measured'].includes(b.basis)) err('budgets.basis must say whether the numbers are policy-default or measured');

  const rp = loop.retry_policy || {};
  if (!Number.isInteger(rp.max_cap) || rp.max_cap > 3) err('retry_policy.max_cap must be an integer no greater than 3');
  if (!rp.no_progress_rule) err('retry_policy.no_progress_rule is required');

  for (const g of loop.human_gates || []) if (!HUMAN_GATES.includes(g)) err(`unknown human gate "${g}"`);
  if (!(loop.stop_conditions || []).some((s) => /human gate/.test(s))) err('stop_conditions must include reaching a human gate');
  if (!(loop.stop_conditions || []).some((s) => /budget/.test(s))) err('stop_conditions must include budget exhaustion');
  if (!(loop.stop_conditions || []).some((s) => /retry cap/.test(s))) err('stop_conditions must include exceeding a retry cap');

  const stages = Array.isArray(loop.stages) ? loop.stages : [];
  const ids = stages.map((s) => s.id);
  if (new Set(ids).size !== ids.length) err('stage ids must be unique');
  const index = new Map(ids.map((id, i) => [id, i]));
  const gatesSeen = new Set();

  stages.forEach((s, i) => {
    const where = `stage ${s.id ?? i}`;
    for (const k of STAGE_KEYS) if (s[k] == null) err(`${where}: missing "${k}"`);
    const makers = [...asList(s.maker), ...asList(s.optional_makers)];
    for (const m of makers) checkAgent(m, `${where} maker`, err);
    for (const m of asList(s.also_runs)) checkAgent(m, `${where} also_runs`, err);
    checkAgent(s.checker, `${where} checker`, err);
    if (makers.includes(s.checker)) err(`${where}: checker "${s.checker}" is also a maker`);
    if (!Number.isInteger(s.retry_cap) || s.retry_cap < 0 || s.retry_cap > (rp.max_cap ?? 3)) err(`${where}: retry_cap must be an integer from 0 to ${rp.max_cap ?? 3}`);
    for (const g of [...asList(s.gates), ...asList(s.also_gates)]) { gatesSeen.add(g); checkGate(g, where, err); }
    if (!TERMINAL.has(s.on_pass) && !(index.has(s.on_pass) && index.get(s.on_pass) > i)) err(`${where}: on_pass "${s.on_pass}" must be a later stage, done or stop`);
    if (!TERMINAL.has(s.on_fail) && !(index.has(s.on_fail) && index.get(s.on_fail) <= i)) err(`${where}: on_fail "${s.on_fail}" must be this or an earlier stage, or stop`);
    if (!asList(s.stop_if).length) err(`${where}: stop_if must list at least one condition`);

    const teamMakers = asList(s.maker).concat(asList(s.optional_makers)).filter((m) => teamScopes.has(m));
    if (teamMakers.length) {
      for (const out of asList(s.outputs)) {
        if (!/[/.]/.test(out) || out.includes(' ')) continue;
        if (!teamMakers.some((m) => teamScopes.get(m).some((g) => globMatch(g, out)))) {
          err(`${where}: output ${out} is outside every maker's write scope`);
        }
      }
    }
  });

  const last = stages[stages.length - 1];
  if (last && !last.human_gate_required) err('the final stage must set human_gate_required: true');
  if (!stages.some((s) => s.on_pass === 'done')) err('no stage reaches done');

  const worst = worstCaseRuns(stages, index);
  if (typeof b.max_stage_runs === 'number' && worst > b.max_stage_runs) err(`worst-case stage runs ${worst} exceed budgets.max_stage_runs ${b.max_stage_runs}`);

  results.push({ file: f, id: loop.id, stages: ids.length, gates: [...gatesSeen], worstCaseStageRuns: worst, budget: b.max_stage_runs, problems });
}

if (asJson) {
  console.log(JSON.stringify(results, null, 2));
} else {
  for (const r of results) {
    console.log(`${r.problems.length ? 'FAIL' : 'ok  '} ${r.file}  stages=${r.stages ?? '?'} worst-case-runs=${r.worstCaseStageRuns ?? '?'}/${r.budget ?? '?'} gates=${(r.gates || []).join(',')}`);
    for (const p of r.problems) console.log(`  - ${p}`);
  }
  const bad = results.filter((r) => r.problems.length).length;
  console.log(bad ? `FAIL ${bad} loop(s)` : `PASS ${results.length} loop(s)`);
}
process.exit(results.some((r) => r.problems.length) || results.length === 0 ? 1 : 0);

function asList(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

function checkAgent(ref, where, err) {
  if (typeof ref !== 'string' || !ref) return err(`${where}: missing agent reference`);
  if (EXTERNAL.has(ref) || ref.startsWith('external:')) return;
  if (ref.startsWith('ai-architect:')) {
    const p = path.join(sibling, 'agents', `${ref.slice('ai-architect:'.length)}.md`);
    if (!existsSync(p)) err(`${where}: ${ref} not found at ${path.relative(repo, p)}`);
    return;
  }
  if (!existsSync(path.join(repo, 'team', `${ref}.md`))) err(`${where}: team/${ref}.md does not exist`);
}

function checkGate(id, where, err) {
  const local = path.join(here, 'gates', `${id}.json`);
  const inherited = path.join(sibling, 'gates', `${id}.json`);
  const file = existsSync(local) ? local : existsSync(inherited) ? inherited : null;
  if (!file) return err(`${where}: gate ${id} not found in loops/gates/ or ../ai-architect/gates/`);
  const g = JSON.parse(readFileSync(file, 'utf8'));
  for (const k of gateSchemaRequired) if (g[k] == null) err(`${where}: gate ${id} missing required field "${k}"`);
  if (g.profile_kind !== 'operating_excellence_gate') err(`${where}: gate ${id} profile_kind must be operating_excellence_gate`);
  if (!Array.isArray(g.pass_criteria) || g.pass_criteria.length < 3) err(`${where}: gate ${id} needs at least 3 pass_criteria`);
}

function loadGateSchemaRequired() {
  const p = path.join(sibling, 'schemas', 'operating-excellence-gate.schema.json');
  if (existsSync(p)) return JSON.parse(readFileSync(p, 'utf8')).required;
  return ['id', 'name', 'type', 'source', 'status', 'trust_level', 'apps', 'profile_kind', 'gate_category', 'pass_criteria', 'evidence_sources', 'last_reviewed'];
}

function loadTeamScopes() {
  const map = new Map();
  const dir = path.join(repo, 'team');
  if (!existsSync(dir)) return map;
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.md'))) {
    const { data } = parseFrontmatter(readFileSync(path.join(dir, f), 'utf8'), `team/${f}`);
    if (data?.name) map.set(data.name, (data.write_scope || []).map(String));
  }
  return map;
}

function globMatch(glob, p) {
  const re = '^' + glob.replace(/[.+^${}()|\\]/g, '\\$&').replace(/\*\*/g, '\u0000').replace(/\*/g, '[^/]*').replace(/\u0000/g, '.*') + '$';
  return new RegExp(re).test(p);
}

// Worst case: every stage fails as often as its retry cap allows, each failure jumps back to
// on_fail, and retry counters are never reset. This bounds the loop without running it.
function worstCaseRuns(stages, index) {
  const used = new Map();
  let i = 0;
  let runs = 0;
  while (i < stages.length && runs < 10000) {
    const s = stages[i];
    runs++;
    const u = used.get(s.id) || 0;
    if (u < (s.retry_cap ?? 0) && index.has(s.on_fail)) {
      used.set(s.id, u + 1);
      i = index.get(s.on_fail);
    } else if (TERMINAL.has(s.on_pass)) {
      break;
    } else {
      i = index.has(s.on_pass) ? index.get(s.on_pass) : stages.length;
    }
  }
  return runs;
}
