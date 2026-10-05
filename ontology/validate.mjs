#!/usr/bin/env node
// Validates the architecture ontology and the AWS Agentic AI Lens mapping, then reports which
// providers realise each capability and how much of each lens pillar each provider can answer.
//
// Usage:
//   node ontology/validate.mjs              # validate and print the coverage report
//   node ontology/validate.mjs --json       # machine-readable report
//   node ontology/validate.mjs --write-md   # also regenerate ontology/LENS-MAPPING.md
// Exit 0 when valid (capability gaps are reported, not failures), 1 on any integrity error.

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..');
const args = new Set(process.argv.slice(2));

const onto = JSON.parse(readFileSync(path.join(here, 'architecture.jsonld'), 'utf8'));
const lens = JSON.parse(readFileSync(path.join(here, 'agentic-ai-lens.questions.json'), 'utf8'));
const lensMap = JSON.parse(readFileSync(path.join(here, 'lens-capability-map.json'), 'utf8'));
const corpus = buildCorpus();

const errors = [];
const warnings = [];
const ctx = onto['@context'] || {};
const graph = onto['@graph'] || [];
const byId = new Map();
const CONFIDENCE = new Set(['sourced', 'secondary', 'unverified']);

if (!onto['@context']) errors.push('missing @context');
for (const n of graph) {
  const id = n['@id'];
  if (!id) { errors.push(`node without @id: ${JSON.stringify(n).slice(0, 80)}`); continue; }
  if (byId.has(id)) errors.push(`duplicate @id ${id}`);
  byId.set(id, n);
  for (const term of [id, n['@type']].filter(Boolean)) {
    const prefix = term.includes(':') ? term.split(':')[0] : null;
    if (prefix && !(prefix in ctx)) errors.push(`${id}: prefix "${prefix}" is not declared in @context`);
  }
}

const classes = new Set(graph.filter((n) => n['@type'] === 'rdfs:Class').map((n) => n['@id']));
const properties = new Map(graph.filter((n) => n['@type'] === 'rdf:Property').map((n) => [n['@id'].split(':')[1], n]));
const typeOf = (id) => byId.get(id)?.['@type'];
const ofType = (t) => graph.filter((n) => n['@type'] === t);

for (const n of graph) {
  const t = n['@type'];
  if (t !== 'rdfs:Class' && t !== 'rdf:Property' && !classes.has(t)) errors.push(`${n['@id']}: unknown type ${t}`);
  for (const [key, prop] of properties) {
    if (!(key in n)) continue;
    if (t !== prop.domain) errors.push(`${n['@id']}: property ${key} has domain ${prop.domain}, node is ${t}`);
    for (const v of [].concat(n[key])) {
      if (!byId.has(v)) errors.push(`${n['@id']}: ${key} -> ${v} does not resolve`);
      else if (typeOf(v) !== prop.range) errors.push(`${n['@id']}: ${key} -> ${v} is ${typeOf(v)}, expected ${prop.range}`);
    }
  }
}

const questionIds = new Set(lens.questions.map((q) => q.id));
const checkLensRefs = (n) => {
  for (const q of n.lensQuestion || []) if (!questionIds.has(q)) errors.push(`${n['@id']}: unknown lens question ${q}`);
};

for (const s of ofType('mcaa:Service')) {
  if (!s.providedBy) errors.push(`${s['@id']}: missing providedBy`);
  if (!s.realizes?.length) errors.push(`${s['@id']}: realizes no capability`);
  if (!CONFIDENCE.has(s.confidence)) errors.push(`${s['@id']}: confidence must be one of ${[...CONFIDENCE].join(', ')}`);
  if (s.confidence === 'unverified' && !s.comment) errors.push(`${s['@id']}: unverified link needs a comment saying what to check`);
  checkSource(s);
}
for (const p of ofType('mcaa:Pattern')) {
  if (!p.requiresCapability?.length) errors.push(`${p['@id']}: requires no capability`);
  checkSource(p);
}
for (const p of ofType('mcaa:Protocol')) if (p.source) checkSource(p);
for (const r of ofType('mcaa:Risk')) {
  checkLensRefs(r);
  if (!ofType('mcaa:Control').some((c) => (c.mitigates || []).includes(r['@id']))) errors.push(`${r['@id']}: no control mitigates this risk`);
}
for (const c of ofType('mcaa:Control')) {
  if (!c.mitigates?.length) errors.push(`${c['@id']}: mitigates no risk`);
  if (!c.usesCapability?.length) errors.push(`${c['@id']}: uses no capability`);
  if (!c.lensQuestion?.length) errors.push(`${c['@id']}: answers no lens question`);
  checkLensRefs(c);
}
for (const cap of ofType('mcaa:Capability')) if (!Array.isArray(cap.concernsPlane)) errors.push(`${cap['@id']}: concernsPlane must be a list (empty means cross-cutting)`);

if (lens.questions.length !== new Set(lens.questions.map((q) => q.id)).size) errors.push('lens questions file has duplicate ids');
for (const q of lens.questions) {
  const row = lensMap.map[q.id];
  if (!row) { errors.push(`lens map is missing ${q.id}`); continue; }
  if (!row.capabilities?.length) errors.push(`${q.id}: maps to no capability`);
  if (!row.why) errors.push(`${q.id}: mapping has no reason`);
  for (const c of row.capabilities || []) if (typeOf(c) !== 'mcaa:Capability') errors.push(`${q.id}: ${c} is not a capability`);
}
for (const k of Object.keys(lensMap.map)) if (!questionIds.has(k)) errors.push(`lens map has unknown question ${k}`);

const providers = ofType('mcaa:Provider');
const capabilities = ofType('mcaa:Capability');
const realisers = new Map(capabilities.map((c) => [c['@id'], new Map()]));
for (const s of ofType('mcaa:Service')) {
  for (const c of s.realizes || []) {
    const m = realisers.get(c);
    if (!m) continue;
    const prev = m.get(s.providedBy);
    if (!prev || rank(s.confidence) > rank(prev)) m.set(s.providedBy, s.confidence);
  }
}
for (const [cap, m] of realisers) {
  const firm = [...m].filter(([, conf]) => conf !== 'unverified');
  if (firm.length === 0) warnings.push(`${cap}: no provider realises this with a sourced or secondary link`);
  else if (firm.length === 1) warnings.push(`${cap}: only ${firm[0][0]} realises this; no portable alternative recorded`);
}

const firmProviders = (cap) => [...(realisers.get(cap) || new Map())].filter(([, c]) => c !== 'unverified').map(([p]) => p);
const pillarStats = lens.pillars.map((pl) => {
  const qs = lens.questions.filter((q) => q.pillar === pl.id);
  const perProvider = Object.fromEntries(providers.map((p) => [p['@id'], qs.filter((q) => lensMap.map[q.id]?.capabilities.every((c) => firmProviders(c).includes(p['@id']))).length]));
  const primaryIds = providers.filter((p) => p.tier === 'primary').map((p) => p['@id']);
  const primaryCombined = qs.filter((q) => lensMap.map[q.id]?.capabilities.every((c) => firmProviders(c).some((p) => primaryIds.includes(p)))).length;
  return { pillar: pl.name, questions: qs.length, perProvider, primaryCombined };
});

const report = {
  counts: Object.fromEntries(['Provider', 'Service', 'Capability', 'Plane', 'Pattern', 'DecisionType', 'Risk', 'Control', 'Protocol'].map((t) => [t, ofType(`mcaa:${t}`).length])),
  lensQuestions: lens.questions.length,
  pillarStats,
  errors,
  warnings,
};

if (args.has('--write-md') && errors.length === 0) {
  writeFileSync(path.join(here, 'LENS-MAPPING.md'), renderMarkdown());
}

if (args.has('--json')) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`ontology: ${Object.entries(report.counts).map(([k, v]) => `${v} ${k}`).join(', ')}; ${report.lensQuestions} lens questions`);
  const short = providers.map((p) => p['@id'].split(':')[1]);
  console.log(`\nquestions each provider can answer alone (all mapped capabilities realised with a sourced or secondary link;\ncounts reflect the services the provider research cites, not each provider's full catalogue):`);
  console.log(`${'pillar'.padEnd(24)}${'qs'.padStart(4)}  ${short.map((s) => s.padStart(12)).join('')}  ${'4 primary'.padStart(10)}`);
  for (const s of pillarStats) {
    console.log(`${s.pillar.padEnd(24)}${String(s.questions).padStart(4)}  ${providers.map((p) => String(s.perProvider[p['@id']]).padStart(12)).join('')}  ${String(s.primaryCombined).padStart(10)}`);
  }
  if (warnings.length) { console.log(`\nwarnings (${warnings.length}):`); for (const w of warnings) console.log(`  - ${w}`); }
  if (errors.length) { console.log(`\nerrors (${errors.length}):`); for (const e of errors) console.log(`  - ${e}`); }
  if (args.has('--write-md') && !errors.length) console.log('\nwrote ontology/LENS-MAPPING.md');
  console.log(errors.length ? `\nFAIL ${errors.length} error(s)` : '\nPASS ontology and lens mapping are consistent');
}
process.exit(errors.length ? 1 : 0);

function rank(c) { return { unverified: 0, secondary: 1, sourced: 2 }[c] ?? -1; }

function checkSource(n) {
  const src = n.source;
  if (!src) return errors.push(`${n['@id']}: missing source`);
  if (/^https?:\/\//.test(src)) {
    if (!corpus.includes(src.replace(/\/+$/, ''))) errors.push(`${n['@id']}: source ${src} is not cited in docs/research, data/provider-matrix.json or team/grounding-ledger.json`);
  } else if (!existsSync(path.resolve(repo, src))) {
    errors.push(`${n['@id']}: source path ${src} does not exist`);
  }
}

function buildCorpus() {
  const parts = [readFileSync(path.join(repo, 'data/provider-matrix.json'), 'utf8')];
  const ledger = path.join(repo, 'team/grounding-ledger.json');
  if (existsSync(ledger)) parts.push(readFileSync(ledger, 'utf8'));
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

function renderMarkdown() {
  const label = (id) => byId.get(id)?.label ?? id;
  const provLabel = (id) => byId.get(id)?.label ?? id;
  const lines = [];
  lines.push('# AWS Agentic AI Lens to capability mapping');
  lines.push('');
  lines.push('Generated by `node ontology/validate.mjs --write-md`. Do not edit by hand: change');
  lines.push('`lens-capability-map.json` or `architecture.jsonld` and regenerate.');
  lines.push('');
  lines.push(`Lens: ${lens.lens}, published ${lens.published} (${lens.docs}). Question ids and titles extracted`);
  lines.push(`from the machine-readable lens on ${lens.extracted}. The mapping is this organisation's judgement`);
  lines.push('and names no provider service; the provider columns are computed from the ontology.');
  lines.push('');
  lines.push('A provider is listed for a capability when one of its services realises it with a sourced or');
  lines.push('secondary citation. Unverified links are excluded. The counts reflect what the provider research in');
  lines.push('this repository cites, not everything each provider sells: a zero means not cited yet. Widen the');
  lines.push('research, then regenerate.');
  lines.push('');
  lines.push('## Pillar summary');
  lines.push('');
  lines.push(`| Pillar | Questions | ${providers.map((p) => provLabel(p['@id'])).join(' | ')} | Four primary combined |`);
  lines.push(`|---|---|${providers.map(() => '---').join('|')}|---|`);
  for (const s of pillarStats) lines.push(`| ${s.pillar} | ${s.questions} | ${providers.map((p) => s.perProvider[p['@id']]).join(' | ')} | ${s.primaryCombined} |`);
  lines.push('');
  lines.push('Each cell counts questions whose every mapped capability that provider realises on its own.');
  for (const pl of lens.pillars) {
    lines.push('');
    lines.push(`## ${pl.name}`);
    lines.push('');
    lines.push('| Question | Title | Capabilities | Providers that realise all of them |');
    lines.push('|---|---|---|---|');
    for (const q of lens.questions.filter((x) => x.pillar === pl.id)) {
      const caps = lensMap.map[q.id].capabilities;
      const all = providers.filter((p) => caps.every((c) => firmProviders(c).includes(p['@id']))).map((p) => provLabel(p['@id']));
      lines.push(`| ${q.id} | ${q.title} | ${caps.map(label).join('; ')} | ${all.length ? all.join(', ') : 'none alone'} |`);
    }
  }
  lines.push('');
  lines.push('## Capability realisation by provider');
  lines.push('');
  lines.push(`| Capability | ${providers.map((p) => provLabel(p['@id'])).join(' | ')} |`);
  lines.push(`|---|${providers.map(() => '---').join('|')}|`);
  for (const c of capabilities) {
    const m = realisers.get(c['@id']);
    lines.push(`| ${c.label} | ${providers.map((p) => m.get(p['@id']) ?? '').join(' | ')} |`);
  }
  lines.push('');
  return lines.join('\n');
}
