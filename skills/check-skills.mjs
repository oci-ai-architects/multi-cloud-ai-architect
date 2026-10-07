#!/usr/bin/env node
// Validates every skills/<dir>/SKILL.md against the Agent Skills specification
// (https://agentskills.io/specification, read 2026-10-05) plus this repo's house rules.
// Zero dependencies. Usage: node skills/check-skills.mjs [--json]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const ALLOWED_KEYS = new Set(['name', 'description', 'license', 'compatibility', 'metadata', 'allowed-tools']);
const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_LINES = 500;
const STALE_YEAR_RE = /\b(as of|as-of|asOf)\b/i;

function unquote(v) {
  const t = v.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) return t.slice(1, -1);
  return t;
}

// Parses the YAML subset skills use: top-level scalars, block scalars (| and >), and one-level maps.
export function parseFrontmatter(text) {
  const lines = text.split(/\r?\n/);
  if (lines[0] !== '---') return { error: 'SKILL.md does not start with a --- frontmatter line' };
  const end = lines.indexOf('---', 1);
  if (end < 0) return { error: 'frontmatter has no closing --- line' };
  const fm = {};
  const errors = [];
  for (let i = 1; i < end; i++) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) { errors.push(`line ${i + 1}: expected "key: value" at top level, got "${line.trim()}"`); continue; }
    const [, key, rest] = m;
    if (rest === '|' || rest === '>' || rest === '|-' || rest === '>-') {
      const body = [];
      while (i + 1 < end && (/^\s+\S/.test(lines[i + 1]) || !lines[i + 1].trim())) body.push(lines[++i].trim());
      fm[key] = rest.startsWith('>') ? body.filter(Boolean).join(' ') : body.join('\n').trim();
    } else if (rest === '') {
      const map = {};
      while (i + 1 < end && /^\s+\S/.test(lines[i + 1])) {
        const sub = lines[++i].match(/^\s+([A-Za-z0-9_.-]+):\s*(.*)$/);
        if (!sub) { errors.push(`line ${i + 1}: "${key}" must be a map of string keys to string values`); continue; }
        if (sub[2] === '' || sub[2] === '|' || sub[2] === '>') errors.push(`line ${i + 1}: ${key}.${sub[1]} must be a single-line string`);
        map[sub[1]] = unquote(sub[2]);
      }
      fm[key] = map;
    } else {
      fm[key] = unquote(rest);
    }
  }
  return { fm, errors, bodyStart: end + 1 };
}

function checkSkill(dir) {
  const file = path.join(root, dir, 'SKILL.md');
  const problems = [];
  const text = fs.readFileSync(file, 'utf8');
  const lineCount = text.replace(/\n$/, '').split('\n').length;
  const { fm, errors, error } = parseFrontmatter(text);
  if (error) return { dir, lines: lineCount, problems: [error] };
  problems.push(...errors);

  for (const k of Object.keys(fm)) if (!ALLOWED_KEYS.has(k)) problems.push(`frontmatter key "${k}" is not in the spec; move it under metadata`);

  const name = typeof fm.name === 'string' ? fm.name : '';
  if (!name) problems.push('name is missing');
  else {
    if (name.length > 64) problems.push(`name is ${name.length} characters (max 64)`);
    if (!NAME_RE.test(name)) problems.push(`name "${name}" must be lowercase letters, digits and single hyphens`);
    if (name !== dir) problems.push(`name "${name}" does not match directory "${dir}"`);
  }

  const desc = typeof fm.description === 'string' ? fm.description : '';
  if (!desc) problems.push('description is missing or not a string');
  else {
    if (desc.length > 1024) problems.push(`description is ${desc.length} characters (max 1024)`);
    if (!/\buse when\b/i.test(desc)) problems.push('description has no "Use when ..." trigger');
  }

  if ('compatibility' in fm) {
    const c = fm.compatibility;
    if (typeof c !== 'string' || c.length < 1 || c.length > 500) problems.push('compatibility must be a 1-500 character string');
  }
  if ('metadata' in fm && (typeof fm.metadata !== 'object' || Array.isArray(fm.metadata))) problems.push('metadata must be a map');
  if ('allowed-tools' in fm && typeof fm['allowed-tools'] !== 'string') problems.push('allowed-tools must be a space-separated string');

  if (lineCount >= MAX_LINES) problems.push(`SKILL.md has ${lineCount} lines (keep under ${MAX_LINES}; move depth to references/)`);

  const links = [...text.matchAll(/\]\(([^)#\s]+)(?:#[^)]*)?\)/g)].map((m) => m[1]).filter((l) => !/^[a-z]+:/i.test(l));
  for (const l of links) if (!fs.existsSync(path.join(root, dir, l))) problems.push(`broken relative link: ${l}`);

  const refDir = path.join(root, dir, 'references');
  if (fs.existsSync(refDir)) {
    for (const f of fs.readdirSync(refDir)) {
      if (!f.endsWith('.md')) continue;
      if (!text.includes(`references/${f}`)) problems.push(`references/${f} is not linked from SKILL.md`);
    }
  }

  return { dir, name, lines: lineCount, descLength: desc.length, trigger: /\buse when\b/i.test(desc), problems };
}

const dirs = fs.readdirSync(root, { withFileTypes: true })
  .filter((d) => d.isDirectory() && fs.existsSync(path.join(root, d.name, 'SKILL.md')))
  .map((d) => d.name)
  .sort();

const results = dirs.map(checkSkill);
const failed = results.filter((r) => r.problems.length);

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ checked: results.length, failed: failed.length, results }, null, 2));
} else {
  for (const r of results) {
    console.log(`${r.problems.length ? 'FAIL' : 'ok  '} ${r.dir.padEnd(26)} ${String(r.lines).padStart(4)} lines  desc ${String(r.descLength ?? 0).padStart(4)}  ${r.trigger ? 'use-when' : 'no-trigger'}`);
    for (const p of r.problems) console.log(`       - ${p}`);
  }
  console.log(`\n${results.length} skills checked, ${failed.length} failing`);
}
process.exit(failed.length ? 1 : 0);
