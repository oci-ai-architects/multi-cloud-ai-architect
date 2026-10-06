// A strict YAML subset parser so the validators in this repo need no dependencies.
// Supported: block maps, block sequences (of scalars or maps), flow sequences [a, b],
// quoted and plain scalars, numbers, booleans, null, comments. Not supported, and rejected
// loudly rather than misread: anchors, aliases, tags, multi-line block scalars (| and >),
// flow maps, multi-document streams.

export function parseYaml(src, origin = 'yaml') {
  const lines = [];
  src.split(/\r?\n/).forEach((raw, i) => {
    if (raw.includes('\t') && /^\s*\t/.test(raw)) fail(origin, i + 1, 'tabs are not allowed for indentation');
    const text = stripComment(raw);
    if (!text.trim()) return;
    const trimmed = text.trim();
    if (trimmed === '---' || trimmed === '...') return;
    if (/^[&*!]/.test(trimmed) || /:\s*[|>][-+]?\s*$/.test(trimmed) || /:\s*[&*!]/.test(trimmed)) {
      fail(origin, i + 1, `unsupported YAML feature in "${trimmed}"`);
    }
    lines.push({ indent: text.match(/^ */)[0].length, text: trimmed, n: i + 1 });
  });
  if (lines.length === 0) return null;
  let pos = 0;

  const isSeqItem = (t) => t === '-' || t.startsWith('- ');
  const MAP_ENTRY = /^("(?:[^"\\]|\\.)*"|'[^']*'|[^\s"'#\-\[{][^:]*?|-[^\s][^:]*?):(?:\s+(.*))?$/;
  const isMapEntry = (t) => MAP_ENTRY.test(t) && !/^[a-z][a-z0-9+.-]*:\/\//i.test(t);

  function parseNode(indent) {
    return isSeqItem(lines[pos].text) ? parseSeq(indent) : parseMap(indent);
  }

  function parseSeq(indent) {
    const arr = [];
    while (pos < lines.length && lines[pos].indent === indent && isSeqItem(lines[pos].text)) {
      const line = lines[pos];
      const rest = line.text === '-' ? '' : line.text.slice(2).trim();
      if (rest === '') {
        pos++;
        if (pos >= lines.length || lines[pos].indent <= indent) fail(origin, line.n, 'empty sequence item');
        arr.push(parseNode(lines[pos].indent));
      } else if (isMapEntry(rest)) {
        const virtual = indent + 2;
        lines[pos] = { indent: virtual, text: rest, n: line.n };
        arr.push(parseMap(virtual));
      } else {
        arr.push(scalar(rest, origin, line.n));
        pos++;
      }
    }
    return arr;
  }

  function parseMap(indent) {
    const obj = {};
    while (pos < lines.length && lines[pos].indent === indent && !isSeqItem(lines[pos].text)) {
      const line = lines[pos];
      const m = line.text.match(MAP_ENTRY);
      if (!m) fail(origin, line.n, `expected "key: value", got "${line.text}"`);
      const key = unquote(m[1].trim());
      if (Object.prototype.hasOwnProperty.call(obj, key)) fail(origin, line.n, `duplicate key "${key}"`);
      const val = m[2];
      pos++;
      if (val === undefined || val === '') {
        const next = lines[pos];
        if (next && (next.indent > indent || (next.indent === indent && isSeqItem(next.text)))) {
          obj[key] = parseNode(next.indent);
        } else {
          obj[key] = null;
        }
      } else {
        obj[key] = scalar(val, origin, line.n);
      }
    }
    if (pos < lines.length && lines[pos].indent > indent) {
      fail(origin, lines[pos].n, `unexpected indentation (${lines[pos].indent} inside a map at ${indent})`);
    }
    return obj;
  }

  const root = parseNode(lines[0].indent);
  if (pos < lines.length) fail(origin, lines[pos].n, `could not parse "${lines[pos].text}"`);
  return root;
}

export function parseFrontmatter(src, origin = 'markdown') {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: null, body: src };
  return { data: parseYaml(m[1], origin), body: m[2] };
}

function stripComment(raw) {
  let quote = null;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (quote) {
      if (c === '\\' && quote === '"') { i++; continue; }
      if (c === quote) quote = null;
    } else if (c === '"' || c === "'") {
      quote = c;
    } else if (c === '#' && (i === 0 || /\s/.test(raw[i - 1]))) {
      return raw.slice(0, i).replace(/\s+$/, '');
    }
  }
  return raw.replace(/\s+$/, '');
}

function unquote(s) {
  if (s.startsWith('"')) return JSON.parse(s);
  if (s.startsWith("'")) return s.slice(1, -1).replace(/''/g, "'");
  return s;
}

function scalar(s, origin, n) {
  const t = s.trim();
  if (t.startsWith('[')) {
    if (!t.endsWith(']')) fail(origin, n, 'unterminated flow sequence');
    const inner = t.slice(1, -1).trim();
    if (!inner) return [];
    return splitFlow(inner).map((x) => scalar(x, origin, n));
  }
  if (t.startsWith('{')) fail(origin, n, 'flow maps are not supported');
  if (t.startsWith('"') || t.startsWith("'")) {
    try { return unquote(t); } catch { fail(origin, n, `bad quoted string ${t}`); }
  }
  if (t === 'null' || t === '~') return null;
  if (t === 'true') return true;
  if (t === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
  return t;
}

function splitFlow(s) {
  const out = [];
  let cur = '';
  let quote = null;
  for (const c of s) {
    if (quote) { cur += c; if (c === quote) quote = null; continue; }
    if (c === '"' || c === "'") { quote = c; cur += c; continue; }
    if (c === ',') { out.push(cur.trim()); cur = ''; continue; }
    cur += c;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function fail(origin, n, msg) {
  throw new Error(`${origin}:${n}: ${msg}`);
}
