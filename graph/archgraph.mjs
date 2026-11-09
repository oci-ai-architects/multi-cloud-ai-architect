#!/usr/bin/env node
// Architecture graph tool. Zero dependencies.
//
//   node graph/archgraph.mjs validate <instance.json> [--json]
//   node graph/archgraph.mjs mermaid  <instance.json> [--view flowchart|c4] [--controls] [--out <file>]
//
// validate: JSON Schema check against graph/architecture-graph.schema.json (a draft 2020-12 subset
// implemented below), then semantic rules the schema cannot express, then a report of boundary
// crossings, providers, capabilities and AWS Agentic AI Lens coverage computed from the ontology.
// Exit 0 when valid (warnings allowed), 1 on any error, 2 on bad usage.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..');
const [cmd, file, ...rest] = process.argv.slice(2);
const flags = parseFlags(rest);

if (!['validate', 'mermaid'].includes(cmd) || !file) {
  console.error('usage: archgraph.mjs validate|mermaid <instance.json> [--json] [--view flowchart|c4] [--controls] [--out file]');
  process.exit(2);
}

const errors = [];
const warnings = [];

function main() {
  const instancePath = path.resolve(file);
  const g = JSON.parse(readFileSync(instancePath, 'utf8'));
  const schema = JSON.parse(readFileSync(path.join(here, 'architecture-graph.schema.json'), 'utf8'));

  validateSchema(g, schema, '$', schema, errors);
  const onto = loadOntology(g, instancePath);
  const facts = errors.length ? null : semanticChecks(g, onto);

  if (cmd === 'validate') {
    const report = { instance: path.relative(repo, instancePath), valid: errors.length === 0, errors, warnings, ...(facts || {}) };
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else printReport(report);
    process.exit(errors.length ? 1 : 0);
  }

  if (errors.length) {
    console.error(`refusing to emit Mermaid for an invalid graph (${errors.length} errors); run validate first`);
    process.exit(1);
  }
  const mmd = flags.view === 'c4' ? toC4(g, flags.controls) : toFlowchart(g, flags.controls);
  if (flags.out) { writeFileSync(path.resolve(flags.out), mmd); console.log(`wrote ${flags.out}`); }
  else process.stdout.write(mmd);
}

// ---------------------------------------------------------------- JSON Schema subset

function validateSchema(value, s, at, root, out) {
  if (s.$ref) {
    const target = s.$ref.replace(/^#\//, '').split('/').reduce((o, k) => o[k], root);
    return validateSchema(value, target, at, root, out);
  }
  if ('const' in s && value !== s.const) out.push(`${at}: must equal ${JSON.stringify(s.const)}`);
  if (s.enum && !s.enum.includes(value)) out.push(`${at}: ${JSON.stringify(value)} is not one of ${s.enum.join(', ')}`);
  if (s.type && !typeMatches(value, s.type)) { out.push(`${at}: expected ${s.type}, got ${kindOf(value)}`); return; }
  if (typeof value === 'string') {
    if (s.minLength != null && value.length < s.minLength) out.push(`${at}: shorter than ${s.minLength}`);
    if (s.pattern && !new RegExp(s.pattern).test(value)) out.push(`${at}: "${value}" does not match ${s.pattern}`);
  }
  if (typeof value === 'number' && s.minimum != null && value < s.minimum) out.push(`${at}: below minimum ${s.minimum}`);
  if (Array.isArray(value)) {
    if (s.minItems != null && value.length < s.minItems) out.push(`${at}: needs at least ${s.minItems} item(s)`);
    if (s.items) value.forEach((v, i) => validateSchema(v, s.items, `${at}[${i}]`, root, out));
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const r of s.required || []) if (!(r in value)) out.push(`${at}: missing required "${r}"`);
    for (const [k, v] of Object.entries(value)) {
      if (s.properties && k in s.properties) validateSchema(v, s.properties[k], `${at}.${k}`, root, out);
      else if (s.additionalProperties === false) out.push(`${at}: unexpected property "${k}"`);
    }
  }
  for (const sub of s.allOf || []) {
    if (sub.if) {
      const probe = [];
      validateSchema(value, sub.if, at, root, probe);
      if (probe.length === 0 && sub.then) validateSchema(value, sub.then, at, root, out);
    } else {
      validateSchema(value, sub, at, root, out);
    }
  }
}

function typeMatches(v, t) {
  return [].concat(t).some((x) => (x === 'integer' ? Number.isInteger(v) : kindOf(v) === x));
}
function kindOf(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  return typeof v === 'number' ? 'number' : typeof v;
}

// ---------------------------------------------------------------- ontology

function loadOntology(graph, at) {
  const p = path.resolve(path.dirname(at), graph.ontology || '');
  if (!graph.ontology || !existsSync(p)) {
    errors.push(`ontology file not found: ${graph.ontology} (resolved ${p})`);
    return { byId: new Map(), lens: { questions: [] }, lensMap: { map: {} } };
  }
  const o = JSON.parse(readFileSync(p, 'utf8'));
  const byId = new Map(o['@graph'].map((n) => [n['@id'], n]));
  const dir = path.dirname(p);
  const lens = JSON.parse(readFileSync(path.join(dir, 'agentic-ai-lens.questions.json'), 'utf8'));
  const lensMap = JSON.parse(readFileSync(path.join(dir, 'lens-capability-map.json'), 'utf8'));
  return { byId, lens, lensMap };
}

// ---------------------------------------------------------------- semantic rules

const EDGE_RULES = {
  uses: [['person'], ['ui']],
  approves: [['person'], ['ui', 'agent', 'workflow']],
  calls: [['ui', 'agent', 'workflow', 'service', 'tool-server', 'gateway'], ['ui', 'agent', 'workflow', 'service', 'tool-server', 'gateway', 'external-system']],
  'calls-model': [['agent', 'workflow'], ['gateway', 'model']],
  'routes-model': [['gateway'], ['model']],
  'invokes-tool': [['agent', 'workflow'], ['tool-server']],
  delegates: [['agent', 'workflow'], ['agent']],
  reads: [['agent', 'workflow', 'service', 'tool-server'], ['datastore']],
  writes: [['agent', 'workflow', 'service', 'tool-server'], ['datastore']],
  fetches: [['agent', 'workflow', 'tool-server'], ['external-system']],
  'emits-telemetry': [['ui', 'agent', 'workflow', 'gateway', 'tool-server', 'service', 'model'], ['observability']],
  evaluates: [['eval-harness'], ['agent', 'workflow', 'model', 'gateway']],
  enforces: [['control'], ['ui', 'agent', 'workflow', 'model', 'gateway', 'tool-server', 'datastore', 'service', 'eval-harness', 'observability']],
};

function semanticChecks(graph, { byId, lens, lensMap }) {
  const nodes = new Map();
  const edges = new Map();
  const boundaries = new Map(graph.boundaries.map((b) => [b.id, b]));
  const dup = (kind, id, map) => { if (map.has(id)) errors.push(`duplicate ${kind} id ${id}`); };

  for (const b of graph.boundaries) if (b.provider && !byId.has(b.provider)) errors.push(`boundary ${b.id}: provider ${b.provider} not in ontology`);
  for (const n of graph.nodes) { dup('node', n.id, nodes); nodes.set(n.id, n); }
  for (const e of graph.edges) { dup('edge', e.id, edges); if (nodes.has(e.id)) errors.push(`edge id ${e.id} collides with a node id`); edges.set(e.id, e); }

  for (const n of nodes.values()) {
    if (!boundaries.has(n.boundary)) errors.push(`node ${n.id}: boundary ${n.boundary} not declared`);
    if (n.provider && !byId.has(n.provider)) errors.push(`node ${n.id}: provider ${n.provider} not in ontology`);
    if (n.plane && !byId.has(n.plane)) errors.push(`node ${n.id}: plane ${n.plane} not in ontology`);
    if (n.service) {
      const s = byId.get(n.service);
      if (!s) errors.push(`node ${n.id}: service ${n.service} not in ontology`);
      else {
        if (n.provider && s.providedBy !== n.provider) errors.push(`node ${n.id}: service ${n.service} is provided by ${s.providedBy}, node says ${n.provider}`);
        if (s.confidence === 'unverified') warnings.push(`node ${n.id}: ontology link for ${n.service} is unverified (${s.comment || 'see ontology'})`);
      }
    }
    const bp = boundaries.get(n.boundary)?.provider;
    if (bp && n.provider && bp !== n.provider) errors.push(`node ${n.id}: provider ${n.provider} sits in boundary ${n.boundary} owned by ${bp}`);
    if (n.control && byId.get(n.control)?.['@type'] !== 'mcaa:Control') errors.push(`node ${n.id}: ${n.control} is not an ontology control`);
    if (n.kind === 'control' && !graph.edges.some((e) => e.kind === 'enforces' && e.from === n.id)) errors.push(`control ${n.id} enforces nothing`);
    if (['agent', 'ui', 'gateway', 'datastore', 'tool-server', 'eval-harness'].includes(n.kind) && !n.owner) warnings.push(`node ${n.id}: no owner named`);
    for (const q of n.openQuestions || []) warnings.push(`open: ${n.id}: ${q}`);
  }

  const crossings = [];
  for (const e of edges.values()) {
    const a = nodes.get(e.from); const b = nodes.get(e.to);
    if (!a) { errors.push(`edge ${e.id}: from ${e.from} is not a node`); continue; }
    if (!b) { errors.push(`edge ${e.id}: to ${e.to} is not a node`); continue; }
    const rule = EDGE_RULES[e.kind];
    if (!rule[0].includes(a.kind)) errors.push(`edge ${e.id} (${e.kind}): source ${a.id} is ${a.kind}, allowed ${rule[0].join('|')}`);
    if (!rule[1].includes(b.kind)) errors.push(`edge ${e.id} (${e.kind}): target ${b.id} is ${b.kind}, allowed ${rule[1].join('|')}`);
    if (e.kind !== 'enforces' && !e.protocol) errors.push(`edge ${e.id}: protocol is required`);
    if (e.kind === 'delegates' && !String(e.protocol).startsWith('a2a-')) errors.push(`edge ${e.id}: delegation between agents must use an A2A binding, got ${e.protocol}`);
    if (e.kind === 'invokes-tool' && !String(e.protocol).startsWith('mcp-') && e.protocol !== 'in-process') errors.push(`edge ${e.id}: tool invocation must use MCP or be in-process, got ${e.protocol}`);
    if (a.boundary !== b.boundary && e.kind !== 'enforces') {
      const target = boundaries.get(b.boundary);
      if (!e.auth) errors.push(`edge ${e.id}: crosses ${a.boundary} -> ${b.boundary} without an auth method`);
      else if (e.auth === 'none' && target?.trust !== 'untrusted') errors.push(`edge ${e.id}: auth "none" into trusted boundary ${b.boundary}`);
      crossings.push({ edge: e.id, from: `${a.id}@${a.boundary}`, to: `${b.id}@${b.boundary}`, protocol: e.protocol, auth: e.auth });
    }
  }

  const enforcedBy = (nodeId, ctl) => graph.edges.some((e) => e.kind === 'enforces' && e.to === nodeId && nodes.get(e.from)?.control === ctl);

  const gateways = [...nodes.values()].filter((n) => n.kind === 'gateway');
  if (gateways.length) {
    for (const e of edges.values()) {
      if (e.kind === 'calls-model' && nodes.get(e.to)?.kind === 'model') errors.push(`edge ${e.id}: ${e.from} calls a model directly, bypassing the gateway seam`);
    }
  }

  for (const n of nodes.values()) {
    if (n.kind !== 'agent' && n.kind !== 'workflow') continue;
    const untrustedIn = graph.edges.filter((e) => e.from === n.id && ['reads', 'fetches', 'invokes-tool', 'calls'].includes(e.kind)).filter((e) => {
      const t = nodes.get(e.to);
      return t && (t.contentTrust === 'untrusted' || boundaries.get(t.boundary)?.trust === 'untrusted');
    });
    if (untrustedIn.length && !enforcedBy(n.id, 'ctl:retrieved-content-as-data')) {
      errors.push(`node ${n.id} takes in untrusted content (${untrustedIn.map((e) => e.id).join(', ')}) and no ctl:retrieved-content-as-data control enforces on it`);
    }
    if (n.kind === 'agent' && !enforcedBy(n.id, 'ctl:loop-budget-in-code')) errors.push(`agent ${n.id}: no ctl:loop-budget-in-code control enforces its exit condition`);
  }

  for (const e of edges.values()) {
    if (!e.irreversible) continue;
    if (!enforcedBy(e.from, 'ctl:approval-for-irreversible')) errors.push(`edge ${e.id} is irreversible and ${e.from} has no ctl:approval-for-irreversible control`);
    if (!graph.edges.some((x) => x.kind === 'approves')) errors.push(`edge ${e.id} is irreversible and no person approves anything in this graph`);
  }

  const evalCases = new Set([...nodes.values()].flatMap((n) => n.cases || []));
  for (const d of graph.decisions || []) {
    if (byId.get(d.decisionType)?.['@type'] !== 'mcaa:DecisionType') errors.push(`${d.id}: ${d.decisionType} is not an ontology decision type`);
    for (const a of d.affects) if (!nodes.has(a) && !edges.has(a)) errors.push(`${d.id}: affects unknown ${a}`);
    if (d.acceptanceEval && !evalCases.has(d.acceptanceEval)) errors.push(`${d.id}: acceptance eval ${d.acceptanceEval} is not a case of any eval-harness node`);
  }
  for (const t of ['decision:model-call-seam', 'decision:orchestration-shape', 'decision:trust-boundary', 'decision:long-run-home']) {
    if (!(graph.decisions || []).some((d) => d.decisionType === t)) warnings.push(`no ADR records ${t}`);
  }

  for (const r of graph.risks || []) {
    const ontoRisk = byId.get(r.risk);
    if (ontoRisk?.['@type'] !== 'mcaa:Risk') { errors.push(`${r.id}: ${r.risk} is not an ontology risk`); continue; }
    for (const a of r.affects) if (!nodes.has(a) && !edges.has(a)) errors.push(`${r.id}: affects unknown ${a}`);
    for (const c of r.controls) {
      const cn = nodes.get(c);
      if (!cn || cn.kind !== 'control') { errors.push(`${r.id}: ${c} is not a control node`); continue; }
      if (!(byId.get(cn.control)?.mitigates || []).includes(r.risk)) errors.push(`${r.id}: control ${c} (${cn.control}) does not mitigate ${r.risk} in the ontology`);
    }
    const enforcedTargets = new Set(graph.edges.filter((e) => e.kind === 'enforces' && r.controls.includes(e.from)).map((e) => e.to));
    const neighbours = (id) => graph.edges.filter((e) => e.kind !== 'enforces' && (e.from === id || e.to === id)).map((e) => (e.from === id ? e.to : e.from));
    const covered = (id) => enforcedTargets.has(id) || neighbours(id).some((x) => enforcedTargets.has(x));
    for (const a of r.affects) {
      const ids = nodes.has(a) ? [a] : [edges.get(a)?.from, edges.get(a)?.to].filter(Boolean);
      if (!ids.some(covered)) warnings.push(`${r.id}: none of its controls enforce on ${a} or a direct neighbour`);
    }
  }

  const providers = [...new Set([...nodes.values()].map((n) => n.provider).filter(Boolean))].sort();
  const capabilities = new Set();
  for (const n of nodes.values()) for (const c of byId.get(n.service)?.realizes || []) capabilities.add(c);
  const controlsPresent = new Set([...nodes.values()].filter((n) => n.control).map((n) => n.control));
  const answeredByControl = new Set([...controlsPresent].flatMap((c) => byId.get(c)?.lensQuestion || []));

  const lensCoverage = lens.questions.map((q) => {
    const caps = lensMap.map[q.id]?.capabilities || [];
    const present = caps.filter((c) => capabilities.has(c));
    const status = answeredByControl.has(q.id) && present.length === caps.length ? 'answered'
      : answeredByControl.has(q.id) || present.length ? 'partial' : 'gap';
    return { id: q.id, pillar: q.pillar, status, missingCapabilities: caps.filter((c) => !capabilities.has(c)) };
  });
  const byPillar = {};
  for (const c of lensCoverage) {
    byPillar[c.pillar] ??= { answered: 0, partial: 0, gap: 0 };
    byPillar[c.pillar][c.status]++;
  }

  return {
    counts: { boundaries: graph.boundaries.length, nodes: nodes.size, edges: edges.size, decisions: (graph.decisions || []).length, risks: (graph.risks || []).length },
    providers,
    crossings,
    capabilities: [...capabilities].sort(),
    lens: { byPillar, gaps: lensCoverage.filter((c) => c.status === 'gap').map((c) => c.id), coverage: lensCoverage },
  };
}

// ---------------------------------------------------------------- output

function printReport(r) {
  console.log(`archgraph validate ${r.instance}`);
  if (r.counts) {
    console.log(`  ${r.counts.nodes} nodes, ${r.counts.edges} edges, ${r.counts.boundaries} boundaries, ${r.counts.decisions} decisions, ${r.counts.risks} risks`);
    console.log(`  providers: ${r.providers.join(', ')}`);
    console.log(`  boundary crossings (${r.crossings.length}):`);
    for (const c of r.crossings) console.log(`    ${c.edge.padEnd(16)} ${c.from} -> ${c.to}  [${c.protocol}; ${c.auth}]`);
    console.log(`  capabilities realised (${r.capabilities.length}): ${r.capabilities.map((c) => c.replace('cap:', '')).join(', ')}`);
    console.log('  AWS Agentic AI Lens coverage (answered = control present and every mapped capability realised):');
    for (const [p, s] of Object.entries(r.lens.byPillar)) console.log(`    ${p.padEnd(22)} answered ${s.answered}  partial ${s.partial}  gap ${s.gap}`);
    if (r.lens.gaps.length) console.log(`    gaps: ${r.lens.gaps.join(', ')}`);
  }
  if (r.warnings.length) { console.log(`  warnings (${r.warnings.length}):`); for (const w of r.warnings) console.log(`    - ${w}`); }
  if (r.errors.length) { console.log(`  errors (${r.errors.length}):`); for (const e of r.errors) console.log(`    - ${e}`); }
  console.log(r.valid ? 'PASS graph is valid' : `FAIL ${r.errors.length} error(s)`);
}

const SHAPES = {
  person: (id, l) => `${id}(("${l}"))`,
  ui: (id, l) => `${id}("${l}")`,
  agent: (id, l) => `${id}[["${l}"]]`,
  workflow: (id, l) => `${id}[["${l}"]]`,
  model: (id, l) => `${id}{{"${l}"}}`,
  gateway: (id, l) => `${id}>"${l}"]`,
  'tool-server': (id, l) => `${id}[/"${l}"/]`,
  datastore: (id, l) => `${id}[("${l}")]`,
  service: (id, l) => `${id}["${l}"]`,
  'external-system': (id, l) => `${id}["${l}"]`,
  'eval-harness': (id, l) => `${id}[\\"${l}"\\]`,
  observability: (id, l) => `${id}[("${l}")]`,
  control: (id, l) => `${id}[/"${l}"\\]`,
};

function mid(s) { return s.replace(/[^A-Za-z0-9_]/g, '_'); }
function esc(s) { return String(s).replace(/"/g, "'"); }

function toFlowchart(graph, withControls) {
  const out = ['%% Generated by graph/archgraph.mjs from ' + graph.id + ' (' + graph.asOf + '). Do not edit by hand.', 'flowchart LR'];
  const show = (n) => withControls || n.kind !== 'control';
  for (const b of graph.boundaries) {
    const members = graph.nodes.filter((n) => n.boundary === b.id && show(n));
    if (!members.length) continue;
    out.push(`  subgraph ${mid('b_' + b.id)}["${esc(b.name)}${b.trust === 'untrusted' ? ' (untrusted)' : ''}"]`);
    for (const n of members) out.push('    ' + SHAPES[n.kind](mid(n.id), esc(n.name)));
    out.push('  end');
  }
  const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));
  const crossIdx = [];
  graph.edges.forEach((e) => {
    const a = nodeById.get(e.from); const b = nodeById.get(e.to);
    if (!show(a) || !show(b)) return;
    const label = esc([e.label || e.kind, e.protocol].filter(Boolean).join(' / '));
    const arrow = e.kind === 'enforces' ? '-.->' : a.boundary !== b.boundary ? '==>' : '-->';
    out.push(`  ${mid(e.from)} ${arrow}|"${label}${e.irreversible ? ' (irreversible)' : ''}"| ${mid(e.to)}`);
  });
  out.push('  classDef untrusted stroke-dasharray: 4 3;');
  const untrusted = graph.nodes.filter((n) => show(n) && (n.contentTrust === 'untrusted' || graph.boundaries.find((b) => b.id === n.boundary)?.trust === 'untrusted'));
  if (untrusted.length) out.push(`  class ${untrusted.map((n) => mid(n.id)).join(',')} untrusted;`);
  void crossIdx;
  return out.join('\n') + '\n';
}

function toC4(graph, withControls) {
  const out = ['%% Generated by graph/archgraph.mjs from ' + graph.id + ' (' + graph.asOf + '). Do not edit by hand.', 'C4Container', `  title ${esc(graph.name)}`];
  const show = (n) => withControls || n.kind !== 'control';
  const fn = (n) => {
    const tech = esc(n.technology || n.service || n.kind);
    if (n.c4 === 'person') return `Person(${mid(n.id)}, "${esc(n.name)}")`;
    if (n.c4 === 'external') return n.kind === 'datastore' ? `ContainerDb_Ext(${mid(n.id)}, "${esc(n.name)}", "${tech}")` : `System_Ext(${mid(n.id)}, "${esc(n.name)}", "${tech}")`;
    if (n.kind === 'datastore' || n.kind === 'observability') return `ContainerDb(${mid(n.id)}, "${esc(n.name)}", "${tech}")`;
    if (n.kind === 'agent') return `Container(${mid(n.id)}, "${esc(n.name)}", "${tech}", "agent; exit: ${n.exitCondition.kind} in code")`;
    return `Container(${mid(n.id)}, "${esc(n.name)}", "${tech}")`;
  };
  for (const b of graph.boundaries) {
    const members = graph.nodes.filter((n) => n.boundary === b.id && show(n));
    if (!members.length) continue;
    const persons = members.filter((n) => n.c4 === 'person');
    for (const p of persons) out.push('  ' + fn(p));
    const rest = members.filter((n) => n.c4 !== 'person');
    if (!rest.length) continue;
    out.push(`  Boundary(${mid('b_' + b.id)}, "${esc(b.name)}") {`);
    for (const n of rest) out.push('    ' + fn(n));
    out.push('  }');
  }
  const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));
  for (const e of graph.edges) {
    if (!show(nodeById.get(e.from)) || !show(nodeById.get(e.to))) continue;
    out.push(`  Rel(${mid(e.from)}, ${mid(e.to)}, "${esc(e.label || e.kind)}", "${esc(e.protocol || '')}")`);
  }
  return out.join('\n') + '\n';
}

function parseFlags(args) {
  const f = { json: false, controls: false, view: 'flowchart', out: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--json') f.json = true;
    else if (args[i] === '--controls') f.controls = true;
    else if (args[i] === '--view') f.view = args[++i];
    else if (args[i] === '--out') f.out = args[++i];
  }
  return f;
}

main();
