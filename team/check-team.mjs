#!/usr/bin/env node
// Validates every team/*.md definition against the operating rules in AGENTS.md:
// frontmatter shape, required sections, grounding provenance, maker != checker,
// one writer per path, and that the AGENTS.md roster and the files agree.
//
// Usage: node team/check-team.mjs [--json]
// Exit 0 when every check passes, 1 otherwise.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter } from '../loops/lib/yaml-lite.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..');
const asJson = process.argv.includes('--json');

const TOOLS = new Set(['Read', 'Grep', 'Glob', 'Write', 'Edit', 'Bash', 'WebFetch', 'WebSearch', 'Skill', 'Task']);
const TIERS = new Set(['judgment', 'build', 'mechanical']);
const SECTIONS = ['Scope', 'Inputs', 'Outputs', 'Tools and MCP', 'Grounding', 'Definition of done', 'Failure modes', 'Stop conditions', 'Handoff'];
const EXTERNAL_CHECKER = 'human-or-other-provider';
const NAME_RULE = /^(?!-)(?!.*--)[a-z0-9-]{1,64}(?<!-)$/;

const corpus = buildCorpus();
const ledger = new Set(JSON.parse(readFileSync(path.join(here, 'grounding-ledger.json'), 'utf8')).entries.map((e) => norm(e.url)));

const files = readdirSync(here).filter((f) => f.endsWith('.md')).sort();
const agents = new Map();
const problems = [];
const err = (agent, msg) => problems.push({ agent, msg });

for (const f of files) {
  const id = f.replace(/\.md$/, '');
  const src = readFileSync(path.join(here, f), 'utf8');
  let parsed;
  try { parsed = parseFrontmatter(src, `team/${f}`); } catch (e) { err(id, e.message); continue; }
  const { data: fm, body } = parsed;
  if (!fm) { err(id, 'missing frontmatter'); continue; }
  agents.set(id, { fm, body, src });

  if (fm.name !== id) err(id, `name "${fm.name}" does not match filename`);
  if (!NAME_RULE.test(id)) err(id, 'name breaks the agentskills.io naming rule');
  if (typeof fm.description !== 'string' || fm.description.length < 1 || fm.description.length > 1024) err(id, 'description must be 1-1024 characters');
  else if (!/\bUse when\b/.test(fm.description)) err(id, 'description must say when to use the agent ("Use when ...")');
  if (!TIERS.has(fm.model_tier)) err(id, `model_tier "${fm.model_tier}" not in ${[...TIERS].join('|')}`);
  if (!Array.isArray(fm.tools) || fm.tools.length === 0) err(id, 'tools must be a non-empty list');
  else for (const t of fm.tools) if (!TOOLS.has(t)) err(id, `unknown tool "${t}"`);
  if (!Array.isArray(fm.mcp)) err(id, 'mcp must be a list (may be empty)');
  if (!Array.isArray(fm.write_scope) || fm.write_scope.length === 0) err(id, 'write_scope must be a non-empty list');
  if (!fm.checker) err(id, 'checker is required');
  if (fm.checker === id) err(id, 'maker cannot be its own checker');

  if (fm.extends) {
    const target = path.resolve(repo, '..', fm.extends);
    if (!existsSync(target)) err(id, `extends target not found: ${fm.extends}`);
  }
  if (fm.provider_research && !['all', 'none'].includes(fm.provider_research)) {
    if (!existsSync(path.join(repo, fm.provider_research))) err(id, `provider_research not found: ${fm.provider_research}`);
  }

  const sections = sectionMap(body);
  for (const s of SECTIONS) if (!sections.has(s)) err(id, `missing section "## ${s}"`);

  const grounding = sections.get('Grounding') || '';
  const urlLines = grounding.split('\n').filter((l) => /https?:\/\//.test(l));
  if (urlLines.length < 3) err(id, `grounding lists ${urlLines.length} URLs, needs at least 3`);
  const providerDoc = fm.provider_research && !['all', 'none'].includes(fm.provider_research)
    ? readFileSync(path.join(repo, fm.provider_research), 'utf8') + readFileSync(path.join(repo, 'data/provider-matrix.json'), 'utf8')
    : null;
  for (const line of urlLines) {
    const url = norm(line.match(/https?:\/\/[^\s)>\]]+/)[0]);
    if (line.includes('[UNVERIFIED]')) continue;
    const inScope = providerDoc ? providerDoc.includes(url) : corpus.includes(url);
    if (!inScope && !ledger.has(url)) {
      err(id, `grounding URL not in ${providerDoc ? fm.provider_research + ' or the matrix' : 'the research corpus'} or the ledger, and not marked [UNVERIFIED]: ${url}`);
    }
  }

  const dod = sections.get('Definition of done') || '';
  const dodItems = dod.split('\n').filter((l) => /^\d+\.\s/.test(l.trim()));
  if (dodItems.length < 3) err(id, `definition of done has ${dodItems.length} numbered items, needs at least 3`);
}

for (const [id, { fm }] of agents) {
  if (fm.checker && fm.checker !== EXTERNAL_CHECKER && !agents.has(fm.checker)) err(id, `checker "${fm.checker}" is not a team member`);
}
const checkers = new Set([...agents.values()].map((a) => a.fm.checker).filter((c) => agents.has(c)));
for (const c of checkers) {
  const tools = agents.get(c).fm.tools || [];
  if (tools.includes('Write') || tools.includes('Edit')) err(c, 'a checker must not hold Write or Edit tools');
  if (agents.get(c).fm.checker !== EXTERNAL_CHECKER) err(c, `a checker must itself be checked by "${EXTERNAL_CHECKER}"`);
}

const scopes = [];
for (const [id, { fm }] of agents) for (const s of fm.write_scope || []) scopes.push({ id, s });
for (let i = 0; i < scopes.length; i++) {
  for (let j = i + 1; j < scopes.length; j++) {
    const a = scopes[i]; const b = scopes[j];
    if (a.id !== b.id && globsOverlap(a.s, b.s)) err(a.id, `write scope "${a.s}" overlaps ${b.id}'s "${b.s}" (one writer per path)`);
  }
}

const roster = readRoster();
for (const id of roster) if (!agents.has(id)) err('AGENTS.md', `roster lists ${id} but team/${id}.md does not exist`);
for (const id of agents.keys()) if (!roster.includes(id)) err(id, 'not listed in the AGENTS.md roster');

const report = {
  checked: agents.size,
  roster: roster.length,
  checkers: [...checkers],
  writeScopes: scopes.length,
  problems,
};

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`team: ${agents.size} definitions, ${roster.length} roster rows, ${scopes.length} write scopes, checkers: ${[...checkers].join(', ') || 'none'}`);
  for (const [id, { fm }] of agents) {
    const mine = problems.filter((p) => p.agent === id);
    console.log(`${mine.length ? 'FAIL' : 'ok  '} ${id.padEnd(26)} tier=${String(fm.model_tier).padEnd(9)} checker=${fm.checker}`);
  }
  for (const p of problems) console.log(`  - [${p.agent}] ${p.msg}`);
  console.log(problems.length ? `FAIL ${problems.length} problem(s)` : 'PASS all team checks');
}
process.exit(problems.length ? 1 : 0);

function sectionMap(body) {
  const map = new Map();
  const parts = body.split(/^## /m).slice(1);
  for (const p of parts) {
    const nl = p.indexOf('\n');
    map.set(p.slice(0, nl).trim(), p.slice(nl + 1));
  }
  return map;
}

function norm(u) {
  return u.replace(/[.,;]+$/, '').replace(/\/+$/, '');
}

function buildCorpus() {
  const parts = [readFileSync(path.join(repo, 'data/provider-matrix.json'), 'utf8')];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.md')) parts.push(readFileSync(p, 'utf8'));
    }
  };
  walk(path.join(repo, 'docs/research'));
  return parts.join('\n');
}

function literalPrefix(glob) {
  const i = glob.search(/[*?[]/);
  return i === -1 ? glob : glob.slice(0, i);
}

function globsOverlap(a, b) {
  if (a === b) return true;
  const pa = literalPrefix(a); const pb = literalPrefix(b);
  const wa = pa !== a; const wb = pb !== b;
  if (!wa && !wb) return false;
  if (wa && b.startsWith(pa) && (a.includes('**') || !b.slice(pa.length).includes('/'))) return true;
  if (wb && a.startsWith(pb) && (b.includes('**') || !a.slice(pb.length).includes('/'))) return true;
  return false;
}

function readRoster() {
  const agentsMd = path.join(repo, 'AGENTS.md');
  if (!existsSync(agentsMd)) return [];
  const src = readFileSync(agentsMd, 'utf8');
  const m = src.match(/<!-- roster:start -->([\s\S]*?)<!-- roster:end -->/);
  if (!m) return [];
  return [...m[1].matchAll(/\(team\/([a-z0-9-]+)\.md\)/g)].map((x) => x[1]);
}
