#!/usr/bin/env node
// Scores a Certified AI Architect submission against RUBRIC.json. Zero dependencies.
//
//   node score.mjs <submission-dir> [--fixture] [--preflight-only] [--json] [--rubric RUBRIC.json]
//                  [--reviews staff-scorecards.json --register reviewers.json]   (required unless --fixture or --preflight-only)
//
// Exit codes: 0 PASS (or preflight clean), 1 FAIL (or preflight dirty),
//             2 REFER (reviewers diverge, adjudication needed), 3 invalid input,
//             4 FIXTURE-ONLY (operator ran --fixture; never a credential).
// Fixture mode: node score.mjs SAMPLE-SUBMISSION --fixture
// Preflight-only needs no register: it scores nothing and is the candidate's free self-check.

import { readFileSync, existsSync, readdirSync, statSync, realpathSync } from 'node:fs'
import { join, dirname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const flag = (name) => args.includes(name)
const opt = (name, fallback) => {
  const i = args.indexOf(name)
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback
}
const valued = ['--rubric', '--reviews', '--register']
const positional = args.filter((a, i) => !a.startsWith('--') && !valued.includes(args[i - 1]))

const die = (msg) => {
  process.stderr.write(`score: ${msg}\n`)
  process.exit(3)
}

const subDir = resolve(positional[0] ?? join(here, 'SAMPLE-SUBMISSION'))
const rubricPath = resolve(opt('--rubric', join(here, 'RUBRIC.json')))
const preflightOnly = flag('--preflight-only')
const asJson = flag('--json')

const readJson = (p) => {
  try {
    return JSON.parse(readFileSync(p, 'utf8'))
  } catch (e) {
    die(`cannot parse ${p}: ${e.message}`)
  }
}

if (!existsSync(rubricPath)) die(`rubric not found: ${rubricPath}`)
if (!existsSync(subDir)) die(`submission not found: ${subDir}`)
const rubric = readJson(rubricPath)
const manifestPath = join(subDir, 'submission.json')
if (!existsSync(manifestPath)) die(`submission.json missing in ${subDir}`)
const manifest = readJson(manifestPath)

const criteria = rubric.domains.flatMap((d) => d.criteria.map((c) => ({ ...c, domain: d.id, domainTitle: d.title })))
const weightSum = criteria.reduce((s, c) => s + c.weight, 0)
if (weightSum !== 100) die(`rubric weights sum to ${weightSum}, expected 100`)

// --- preflight checks: deterministic, file-based, no network -----------------

const fileText = (rel) => {
  const p = join(subDir, rel)
  return existsSync(p) && statSync(p).isFile() ? readFileSync(p, 'utf8') : null
}
const headingsOf = (text) =>
  text
    .split(/\r?\n/)
    .filter((l) => /^#{1,6}\s/.test(l))
    .map((l) => l.replace(/^#+\s*/, '').toLowerCase())
const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj)
const parseJsonl = (text) =>
  text
    .split(/\r?\n/)
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l))
const mdFiles = (rel, ext) => {
  const p = join(subDir, rel)
  return existsSync(p) ? readdirSync(p).filter((f) => f.endsWith(ext)).sort() : []
}

const checks = {
  file: (c) => (fileText(c.path) !== null ? null : `${c.path} missing`),

  headings: (c) => {
    const t = fileText(c.path)
    if (t === null) return `${c.path} missing`
    const hs = headingsOf(t)
    const missing = c.all.filter((h) => !hs.some((x) => x.includes(h)))
    return missing.length ? `${c.path} lacks heading(s): ${missing.join(', ')}` : null
  },

  regex: (c) => {
    const t = fileText(c.path)
    if (t === null) return `${c.path} missing`
    const n = (t.match(new RegExp(c.pattern, 'g')) ?? []).length
    return n >= c.min ? null : `${c.path}: /${c.pattern}/ matched ${n}, need ${c.min}`
  },

  dirCount: (c) => {
    const n = mdFiles(c.path, c.ext).length
    return n >= c.min ? null : `${c.path}: ${n} ${c.ext} file(s), need ${c.min}`
  },

  eachFile: (c) => {
    const problems = mdFiles(c.path, c.ext).flatMap((f) => {
      const hs = headingsOf(fileText(join(c.path, f)))
      const missing = c.headings.filter((h) => !hs.some((x) => x.includes(h)))
      return missing.length ? [`${f} lacks ${missing.join(', ')}`] : []
    })
    return problems.length ? problems.join('; ') : null
  },

  evalCases: (c) => {
    const t = fileText(c.path)
    if (t === null) return `${c.path} missing`
    let cases
    try {
      cases = parseJsonl(t)
    } catch (e) {
      return `${c.path}: invalid JSONL (${e.message})`
    }
    const problems = []
    if (cases.length < c.min) problems.push(`${cases.length} cases, need ${c.min}`)
    for (const [kind, min] of Object.entries(c.kinds ?? {})) {
      const n = cases.filter((x) => x.kind === kind).length
      if (n < min) problems.push(`${n} ${kind} case(s), need ${min}`)
    }
    const incomplete = cases.filter((x) => !x.id || !x.input || !x.expect || !x.must_not)
    if (incomplete.length) problems.push(`${incomplete.length} case(s) missing id/input/expect/must_not`)
    return problems.length ? `${c.path}: ${problems.join('; ')}` : null
  },

  authorityMatrix: (c) => {
    const t = fileText(c.path)
    if (t === null) return `${c.path} missing`
    const m = JSON.parse(t)
    const problems = []
    const tools = m.tools ?? []
    const principals = m.principals ?? []
    if (!tools.length) problems.push('no tools')
    for (const tool of tools) if (typeof tool.sideEffecting !== 'boolean') problems.push(`${tool.name}: sideEffecting not boolean`)
    const writers = {}
    for (const tool of tools.filter((x) => x.sideEffecting)) (writers[tool.principal] ??= []).push(tool.name)
    for (const [p, ts] of Object.entries(writers)) if (ts.length > 1) problems.push(`principal ${p} backs ${ts.length} side-effecting tools (${ts.join(', ')})`)
    for (const tool of tools) if (!principals.some((p) => p.id === tool.principal)) problems.push(`${tool.name}: principal ${tool.principal} undeclared`)
    for (const p of principals) if (!p.revocationPath) problems.push(`principal ${p.id}: no revocationPath`)
    return problems.length ? `${c.path}: ${problems.join('; ')}` : null
  },

  adrEvalsResolve: (c) => {
    const t = fileText(c.cases)
    if (t === null) return `${c.cases} missing`
    const ids = new Set(parseJsonl(t).map((x) => x.id))
    const problems = mdFiles(c.path, '.md').flatMap((f) => {
      const body = fileText(join(c.path, f))
      const section = body.split(/^#+\s*acceptance eval.*$/im)[1]?.split(/^#+\s/m)[0] ?? ''
      const named = [...section.matchAll(/`([a-z]+-\d+)`/g)].map((m) => m[1])
      if (!named.length) return [`${f} names no eval id`]
      const unknown = [...new Set(named)].filter((id) => !ids.has(id))
      return unknown.length ? [`${f} names unknown case(s) ${unknown.join(', ')}`] : []
    })
    return problems.length ? problems.join('; ') : null
  },

  jsonKeys: (c) => {
    const t = fileText(c.path)
    if (t === null) return `${c.path} missing`
    const j = JSON.parse(t)
    const missing = c.keys.filter((k) => get(j, k) === undefined || get(j, k) === '')
    return missing.length ? `${c.path} lacks ${missing.join(', ')}` : null
  },

  priceRows: (c) => {
    const t = fileText(c.path)
    if (t === null) return `${c.path} missing`
    const rows = JSON.parse(t).prices ?? []
    if (!rows.length) return `${c.path}: no price rows`
    const asOf = new Date(manifest.submittedAt ?? Date.now())
    const problems = rows.flatMap((r) => {
      if (!r.source_url) return [`${r.item}: no source_url`]
      const age = (asOf - new Date(r.retrieved_at)) / 864e5
      if (!(age >= 0 && age <= c.maxAgeDays)) return [`${r.item}: retrieved_at ${r.retrieved_at} outside ${c.maxAgeDays} days`]
      return []
    })
    return problems.length ? `${c.path}: ${problems.join('; ')}` : null
  },

  providers: (c) => {
    const t = fileText(c.path)
    if (t === null) return `${c.path} missing`
    const d = JSON.parse(t)
    const providers = new Set((d.deployments ?? []).filter((x) => x.url && x.rollback && x.plane).map((x) => x.provider))
    return providers.size >= c.min ? null : `${c.path}: ${providers.size} provider(s) with url+rollback+plane, need ${c.min}`
  },

  manifest: (c) => {
    const missing = c.keys.filter((k) => !get(manifest, k))
    return missing.length ? `submission.json lacks ${missing.join(', ')}` : null
  },
}

const runPreflight = (criterion) =>
  criterion.preflight.flatMap((check) => {
    const fn = checks[check.type]
    if (!fn) die(`unknown check type ${check.type} in ${criterion.id}`)
    try {
      const problem = fn(check)
      return problem ? [problem] : []
    } catch (e) {
      return [`${check.type} on ${check.path ?? 'manifest'} threw: ${e.message}`]
    }
  })

// --- reviewer scores ---------------------------------------------------------

// A candidate controls submission.json, so for a real submission the scorecards come from a
// staff-held file (--reviews) and every reviewer must be in the calibrated register (--register).
// Inline reviews are accepted only in fixture mode.
//
// Fixture mode is an operator flag (--fixture). The manifest's own "fixture" field is a label the
// candidate controls, so it can never switch a check off: a manifest that claims fixture without the
// flag is refused, and fixture mode never awards a credential.
const rules = rubric.passRules
const fixtureRoot = realpathSync(join(here, 'SAMPLE-SUBMISSION'))
const subReal = realpathSync(subDir)
const underFixtureRoot = subReal === fixtureRoot || subReal.startsWith(fixtureRoot + sep)
const fixture = flag('--fixture')
if (fixture && !underFixtureRoot) die(`--fixture is honoured only for ${fixtureRoot}; ${subReal} is outside it`)
if (manifest.fixture === true && !underFixtureRoot) die(`submission.json claims "fixture": true outside ${fixtureRoot}; that claim is refused`)
if (manifest.fixture === true && !fixture) die('submission.json claims "fixture": true, but fixture mode is an operator flag. Re-run with --fixture (scores for teaching only, never a credential) or remove the claim and supply --reviews and --register.')
if (fixture && manifest.fixture !== true) die('--fixture was given for a manifest not marked as a fixture; real submissions are never scored in fixture mode')
const reviewsPath = opt('--reviews', null)
const registerPath = opt('--register', null)
let reviews = []
if (!preflightOnly) {
  if (!fixture && manifest.reviews) die('a real submission manifest must not carry reviews; scorecards come from the staff-held --reviews file')
  if (reviewsPath) reviews = readJson(resolve(reviewsPath)).reviews ?? []
  else if (fixture) reviews = manifest.reviews ?? []
  else die('real submissions need --reviews <staff-held scorecards> and --register <reviewer register>')
}
const primary = reviews.filter((r) => r.role === 'primary')
const adjudicators = reviews.filter((r) => r.role === 'adjudicator')
const adjudicator = adjudicators[0]
if (!preflightOnly) {
  if (reviews.some((r) => r.role !== 'primary' && r.role !== 'adjudicator')) die('every review needs role primary or adjudicator')
  if (primary.length !== rules.reviewersRequired) die(`exactly ${rules.reviewersRequired} primary scorecards required, found ${primary.length}`)
  if (adjudicators.length > 1) die('at most one adjudicator')
  const ids = reviews.map((r) => r.reviewer)
  if (new Set(ids).size !== ids.length) die('the same reviewer appears twice')
  if (ids.includes(manifest.candidate?.id)) die('a candidate cannot review their own submission')
  if (primary.some((r) => r.independent !== true)) die('every primary review must be independent (scored before seeing the other)')
  for (const r of reviews) {
    if (!Array.isArray(r.rederived) || r.rederived.length < 2) die(`reviewer ${r.reviewer} must list at least 2 evidence pointers they re-derived (rederived[])`)
  }
  if (!fixture) {
    if (!registerPath) die('--register is required for real submissions')
    const register = readJson(resolve(registerPath))
    for (const r of reviews) {
      const entry = (register.reviewers ?? []).find((x) => x.id === r.reviewer)
      if (!entry) die(`reviewer ${r.reviewer} is not in the register`)
      if (!(entry.calibratedFor ?? []).includes(rubric.version)) die(`reviewer ${r.reviewer} is not calibrated for rubric ${rubric.version}`)
      if ((entry.conflicts ?? []).includes(manifest.candidate?.id)) die(`reviewer ${r.reviewer} has a declared conflict with ${manifest.candidate?.id}`)
    }
  }
}

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b)
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2
}

const results = criteria.map((c) => {
  const preflightProblems = runPreflight(c)
  const row = { id: c.id, domain: c.domain, title: c.title, weight: c.weight, hardGate: !!c.hardGate, preflight: preflightProblems }
  if (preflightOnly) return row
  const scores = primary.map((r) => r.scores?.[c.id]?.score)
  if (scores.some((s) => !Number.isInteger(s) || s < 0 || s > 4)) die(`missing or invalid score for ${c.id}`)
  const spread = Math.max(...scores) - Math.min(...scores)
  let final
  let status = 'agreed'
  if (spread >= rules.adjudicationDelta) {
    const adj = adjudicator?.scores?.[c.id]?.score
    if (Number.isInteger(adj)) {
      final = median([...scores, adj])
      status = 'adjudicated'
    } else {
      status = 'refer'
      final = Math.min(...scores)
    }
  } else {
    final = scores.reduce((a, b) => a + b, 0) / scores.length
  }
  if (preflightProblems.length && final > rules.preflightCap) {
    final = rules.preflightCap
    status += '+capped'
  }
  return { ...row, scores, final, status, points: (c.weight * final) / 4 }
})

// --- verdict ----------------------------------------------------------------
const fixtureReuse = !fixture && rules.fixtureSystemIds.includes(manifest.system?.id)

let verdict
let total = null
let exitCode
const reasons = []

if (preflightOnly) {
  const dirty = results.filter((r) => r.preflight.length)
  verdict = dirty.length ? 'PREFLIGHT-DIRTY' : 'PREFLIGHT-CLEAN'
  exitCode = dirty.length ? 1 : 0
  reasons.push(`${results.length - dirty.length}/${results.length} criteria clean`)
} else {
  total = Math.round(results.reduce((s, r) => s + r.points, 0) * 100) / 100
  const refer = results.filter((r) => r.status === 'refer')
  const below = results.filter((r) => r.final < rules.minCriterionScore)
  const gateMisses = rules.hardGates.filter((g) => (results.find((r) => r.id === g.criterion)?.final ?? 0) < g.min)
  if (fixtureReuse) reasons.push('the submitted system is a published fixture; it cannot earn a credential')
  if (refer.length) reasons.push(`reviewers diverge by >= ${rules.adjudicationDelta} on ${refer.map((r) => r.id).join(', ')}; adjudication needed`)
  if (below.length) reasons.push(`below ${rules.minCriterionScore} on ${below.map((r) => r.id).join(', ')}`)
  if (gateMisses.length) reasons.push(`hard gate missed: ${gateMisses.map((g) => g.criterion).join(', ')}`)
  if (total < rules.passPercent) reasons.push(`total ${total} < ${rules.passPercent}`)

  if (refer.length && !fixtureReuse) {
    verdict = 'REFER'
    exitCode = 2
  } else if (reasons.length) {
    verdict = 'FAIL'
    exitCode = 1
  } else {
    const distinction = total >= rules.distinctionPercent && results.every((r) => r.final >= rules.distinctionMinCriterion)
    verdict = distinction ? 'PASS WITH DISTINCTION' : 'PASS'
    exitCode = 0
    reasons.push(`total ${total} >= ${rules.passPercent}; every criterion >= ${rules.minCriterionScore}; hard gates met`)
  }

}

if (fixture) {
  verdict = `FIXTURE-ONLY (would read ${verdict})`
  exitCode = 4
  reasons.push('fixture mode: scored for teaching and calibration; no credential is ever awarded')
}

// --- output -----------------------------------------------------------------

const label = fixture ? ' [FIXTURE: teaching example, not eligible for a credential]' : ''

if (asJson) {
  process.stdout.write(
    JSON.stringify(
      { rubric: `${rubric.schema}@${rubric.version}`, submission: manifest.system?.name, fixture, verdict, total, reasons, criteria: results },
      null,
      2,
    ) + '\n',
  )
} else {
  const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1))
  const out = []
  out.push(`Rubric ${rubric.schema}@${rubric.version} (${rubric.status})`)
  out.push(`Submission: ${manifest.system?.name ?? '?'} by ${manifest.candidate?.id ?? '?'}${label}`)
  out.push('')
  let lastDomain
  for (const r of results) {
    if (r.domain !== lastDomain) {
      const d = rubric.domains.find((x) => x.id === r.domain)
      out.push(`${d.id} ${d.title}`)
      lastDomain = r.domain
    }
    const gate = r.hardGate ? ' [gate]' : ''
    if (preflightOnly) {
      out.push(`  ${r.id.padEnd(5)} ${(r.preflight.length ? 'DIRTY' : 'clean').padEnd(6)} ${r.title}${gate}`)
    } else {
      const s = `${r.scores.join('/')}`.padEnd(7)
      out.push(`  ${r.id.padEnd(5)} w${String(r.weight).padEnd(2)} scores ${s} final ${fmt(r.final).padEnd(4)} ${r.points.toFixed(2).padStart(5)} pts  ${r.status.padEnd(12)} ${r.title}${gate}`)
    }
    for (const p of r.preflight) out.push(`        preflight: ${p}`)
  }
  out.push('')
  if (!preflightOnly) out.push(`Total: ${total} / 100`)
  out.push(`Verdict: ${verdict}`)
  for (const r of reasons) out.push(`  - ${r}`)
  process.stdout.write(out.join('\n') + '\n')
}

process.exit(exitCode)
