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

export function visibleText(html) {
  return String(html)
    .replace(/<(script|style|noscript|template)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
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

export function requiredIssues(jsonld, table, parents) {
  const issues = [];
  const seen = new Set();
  for (const [type, items] of Object.entries(jsonld)) {
    for (const [rule, spec] of Object.entries(table)) {
      if (rule.startsWith('_') || !isSubtypeOf(type, rule, parents)) continue;
      for (const item of items) {
        for (const [severity, fields] of [['ERROR', spec.required], ['WARNING', spec.recommended]]) {
          for (const f of fields) {
            const key = `${item['@location']}|${rule}|${f}`;
            if (item[f] !== undefined || seen.has(key)) continue;
            seen.add(key);
            issues.push({ rootType: type, rule, severity, fieldNames: [f], doc: spec.doc,
              issueMessage: `${severity === 'ERROR' ? 'Required' : 'Recommended'} attribute "${f}" is missing` });
          }
        }
      }
    }
  }
  return issues;
}

export async function checkPage(url, html, validator, table, parents) {
  const data = new WebAutoExtractor({ addLocation: true, embedSource: ['rdfa', 'microdata'] }).parse(html);
  const jsonld = data.jsonld ?? {};
  const all = [...(await validator.validate(data)), ...requiredIssues(jsonld, table, parents)];
  const errors = all.filter((i) => i.severity === 'ERROR');
  const warnings = all.filter((i) => i.severity !== 'ERROR');
  const items = Object.values(jsonld).flat();
  const present = items.length > 0 || Object.keys(data.microdata ?? {}).length > 0 || Object.keys(data.rdfa ?? {}).length > 0;
  const hidden = notVisible(items, visibleText(html));
  const brief = (i) => ({ type: i.rootType, message: i.issueMessage, fields: i.fieldNames });
  return [
    {
      id: 'tech.schema-valid',
      question: 'Is the structured data valid for Google rich results and schema.org?',
      verdict: errors.length ? 'fail' : 'pass',
      pages: errors.length ? [url] : [],
      evidence: present ? { errors: errors.map(brief), warnings: warnings.map(brief) } : { note: 'no structured data found' },
      source: 'engines/schema_check.mjs',
    },
    {
      id: 'tech.schema-matches',
      question: 'Does structured data match visible text?',
      verdict: hidden.length ? 'fail' : 'pass',
      pages: hidden.length ? [url] : [],
      evidence: { not_visible: hidden.slice(0, 10) },
      rule: 'Structured data must match visible text',
      source: 'engines/schema_check.mjs',
    },
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
      const res = await fetch(url, { headers: { 'user-agent': UA }, redirect: 'follow' });
      const html = await res.text();
      results.push({ url, status: res.status, checks: await checkPage(url, html, validator, table, parents) });
    } catch (e) {
      const unknown = (id) => ({ id, verdict: 'unknown', pages: [url], evidence: { error: String(e) }, source: 'engines/schema_check.mjs' });
      results.push({ url, status: null, checks: [unknown('tech.schema-valid'), unknown('tech.schema-matches')] });
    }
  }
  writeFileSync(args.out, JSON.stringify(results, null, 2));
  for (const r of results) console.error(`${r.checks.map((c) => c.verdict).join('/')}  ${r.url}`);
}

// Node resolves symlinks in import.meta.url but not in argv[1] (e.g. /tmp -> /private/tmp on macOS).
const isMain = process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;
if (isMain) await main(process.argv.slice(2));
