// Structured data check for the seo plugin.
// Google rich-result requirements + schema.org vocabulary (@adobe/structured-data-validator),
// our required-field table for types Adobe skips (LocalBusiness, Event, Article, FAQPage),
// and a match of schema text against the page's visible text.
//
// Usage: node schema_check.mjs --vocab FILE --required FILE --out FILE URL [URL ...]
// Reads the raw HTML (structured data injected by JavaScript is not seen).
import Validator from '@adobe/structured-data-validator';
import WebAutoExtractor from '@marbec/web-auto-extractor';
import { readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const SKIP_KEYS = new Set(['@context', '@type', '@id', '@location', 'url', 'image', 'logo', 'sameAs',
  'contentUrl', 'embedUrl', 'thumbnailUrl']);
const URLISH = /^(https?:|\/|www\.)/i;
const UA = 'Mozilla/5.0 (compatible; seo-plugin-schema/1.0)';
const SOURCE = 'node/schema_check.mjs';
const QUESTIONS = {
  'tech.schema-valid': 'Is the structured data valid for Google rich results and schema.org?',
  'tech.schema-matches': 'Does structured data match visible text?',
};
// Types whose text is page metadata (Yoast puts the meta description here), not body content.
const METADATA_TYPES = ['WebPage', 'WebSite'];
const NAMED_ENTITIES = { nbsp: ' ', amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', hellip: '…',
  ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', copy: '©', reg: '®', trade: '™' };

export function decodeEntities(s) {
  return String(s).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = /^#x/i.test(e) ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) && code <= 0x10ffff ? String.fromCodePoint(code) : m;
    }
    return NAMED_ENTITIES[e.toLowerCase()] ?? m;
  });
}

export function visibleText(html) {
  return decodeEntities(String(html)
    .replace(/<(script|style|noscript|template)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' '))
    .replace(/[’‘]/g, "'").replace(/[”“]/g, '"').replace(/[–—]/g, '-')
    .toLowerCase().replace(/\s+/g, ' ').trim();
}

export function stringValues(node, out = []) {
  if (typeof node === 'string') {
    const s = node.trim();
    if (s.split(/\s+/).length >= 4 && !URLISH.test(s)) out.push(s);
  } else if (Array.isArray(node)) {
    node.forEach((n) => stringValues(n, out));
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) if (!SKIP_KEYS.has(k)) stringValues(v, out);
  }
  return out;
}

export function notVisible(items, text) {
  const values = new Set(items.flatMap((item) => stringValues(item)));
  return [...values].filter((s) => !text.includes(visibleText(s)));
}

export function subclassIndex(vocab) {
  const parents = new Map();
  for (const node of vocab['@graph'] ?? []) {
    const sc = node['rdfs:subClassOf'];
    if (!sc) continue;
    const id = String(node['@id']).replace(/^schema:/, '');
    parents.set(id, (Array.isArray(sc) ? sc : [sc]).map((s) => String(s['@id'] ?? s).replace(/^schema:/, '')));
  }
  return parents;
}

export function isSubtypeOf(type, ancestor, parents, seen = new Set()) {
  if (type === ancestor) return true;
  if (seen.has(type)) return false;
  seen.add(type);
  return (parents.get(type) ?? []).some((p) => isSubtypeOf(p, ancestor, parents, seen));
}

export function normType(type) {
  return String(type).replace(/^(https?:\/\/schema\.org\/|schema:)/, '');
}

export function requiredIssues(jsonld, table, parents) {
  const issues = [];
  const done = new Map(); // item object -> Set("rule|field"); the extractor shares one object across its type keys
  for (const [rawType, items] of Object.entries(jsonld)) {
    const type = normType(rawType);
    for (const [rule, spec] of Object.entries(table)) {
      if (rule.startsWith('_') || !isSubtypeOf(type, rule, parents)) continue;
      for (const item of items) {
        if (!done.has(item)) done.set(item, new Set());
        const seen = done.get(item);
        for (const [severity, fields] of [['ERROR', spec.required], ['WARNING', spec.recommended]]) {
          for (const f of fields) {
            if (item[f] !== undefined || seen.has(`${rule}|${f}`)) continue;
            seen.add(`${rule}|${f}`);
            issues.push({ rootType: type, rule, severity, fieldNames: [f], doc: spec.doc, location: item['@location'],
              issueMessage: `${severity === 'ERROR' ? 'Required' : 'Recommended'} attribute "${f}" is missing` });
          }
        }
      }
    }
  }
  return issues;
}

export function dedupeIssues(issues) {
  const seen = new Set();
  return issues.filter((i) => {
    // Adobe reports a multi-typed item once per type key and drops '@location' after the first pass,
    // so the later copy has no location. Its serialised `source` is the same on every copy: use it as
    // the item identity, falling back to the location (our own issues, which have no `source`).
    const identity = `${i.dataFormat ?? ''}|${i.source ?? i.location ?? ''}`;
    const k = `${i.severity}|${i.issueMessage}|${(i.fieldNames ?? []).join(',')}|${identity}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function unknownChecks(url, evidence) {
  return Object.entries(QUESTIONS).map(([id, question]) =>
    ({ id, question, verdict: 'unknown', pages: [url], evidence, source: SOURCE }));
}

export async function checkPage(url, html, validator, table, parents) {
  const data = new WebAutoExtractor({ addLocation: true, embedSource: ['rdfa', 'microdata'] }).parse(html);
  const jsonld = data.jsonld ?? {};
  const ours = requiredIssues(jsonld, table, parents); // before validate(): it deletes '@location'
  const all = dedupeIssues([...(await validator.validate(data)), ...ours]);
  const errors = all.filter((i) => i.severity === 'ERROR');
  const warnings = all.filter((i) => i.severity !== 'ERROR');
  const hasJsonld = Object.values(jsonld).some((items) => items.length > 0);
  const hasOther = Object.keys(data.microdata ?? {}).length > 0 || Object.keys(data.rdfa ?? {}).length > 0;
  const content = [...new Set(Object.entries(jsonld)
    .filter(([t]) => !METADATA_TYPES.some((m) => isSubtypeOf(normType(t), m, parents)))
    .flatMap(([, items]) => items))];
  const hidden = notVisible(content, visibleText(html));
  const brief = (i) => ({ type: i.rootType, message: i.issueMessage, fields: i.fieldNames });

  let matches;
  if (hasJsonld) {
    matches = { verdict: hidden.length ? 'fail' : 'pass', pages: hidden.length ? [url] : [], evidence: { not_visible: hidden.slice(0, 10) } };
  } else if (hasOther) {
    matches = { verdict: 'unknown', pages: [url], evidence: { note: 'only microdata/RDFa found; the visible-text match checks JSON-LD' } };
  } else {
    matches = { verdict: 'pass', pages: [], evidence: { note: 'no structured data found' } };
  }
  return [
    {
      id: 'tech.schema-valid', question: QUESTIONS['tech.schema-valid'],
      verdict: errors.length ? 'fail' : 'pass',
      pages: errors.length ? [url] : [],
      evidence: hasJsonld || hasOther ? { errors: errors.map(brief), warnings: warnings.map(brief) } : { note: 'no structured data found' },
      source: SOURCE,
    },
    { id: 'tech.schema-matches', question: QUESTIONS['tech.schema-matches'], ...matches,
      rule: 'Structured data must match visible text', source: SOURCE },
  ];
}

async function main(argv) {
  const args = { urls: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--vocab') args.vocab = argv[++i];
    else if (argv[i] === '--required') args.required = argv[++i];
    else if (argv[i] === '--out') args.out = argv[++i];
    else args.urls.push(argv[i]);
  }
  const vocab = JSON.parse(readFileSync(args.vocab, 'utf8'));
  const validator = new Validator(vocab);
  const parents = subclassIndex(vocab);
  const table = JSON.parse(readFileSync(args.required, 'utf8'));
  const results = [];
  for (const url of args.urls) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(30000) });
      const contentType = res.headers.get('content-type') ?? '';
      if (!res.ok || !/html/i.test(contentType)) {
        results.push({ url, status: res.status, checks: unknownChecks(url, { status: res.status, content_type: contentType, note: 'page did not return 2xx HTML' }) });
        continue;
      }
      const html = await res.text();
      results.push({ url, status: res.status, checks: await checkPage(url, html, validator, table, parents) });
    } catch (e) {
      results.push({ url, status: null, checks: unknownChecks(url, { error: String(e) }) });
    }
  }
  writeFileSync(args.out, JSON.stringify(results, null, 2));
  for (const r of results) console.error(`${r.checks.map((c) => c.verdict).join('/')}  ${r.url}`);
}

// Node resolves symlinks in import.meta.url but not in argv[1] (e.g. /tmp -> /private/tmp on macOS).
const isMain = process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;
if (isMain) await main(process.argv.slice(2));
