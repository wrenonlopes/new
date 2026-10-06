import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Validator from '@adobe/structured-data-validator';
import WebAutoExtractor from '@marbec/web-auto-extractor';
import {
  visibleText, stringValues, notVisible, subclassIndex, isSubtypeOf, requiredIssues, checkPage,
  decodeEntities, normType, dedupeIssues, unknownChecks,
} from './schema_check.mjs';

const vocab = JSON.parse(readFileSync(new URL('../data/schemaorg-all-https.jsonld', import.meta.url)));
const table = JSON.parse(readFileSync(new URL('../data/google-required-fields.json', import.meta.url)));
const parents = subclassIndex(vocab);
const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;

test('visibleText drops scripts and tags, decodes entities', () => {
  assert.equal(visibleText('<p>Fish &amp; Chips</p><script>var x="hidden words here now"</script>'), 'fish & chips');
});

test('stringValues keeps 4+ word strings, skips urls and skipped keys', () => {
  const vals = stringValues({ '@type': 'Product', name: 'Premium Gold Widget Deluxe', url: 'https://a.b/one two three four', brand: 'Acme' });
  assert.deepEqual(vals, ['Premium Gold Widget Deluxe']);
});

test('notVisible flags schema text missing from the page', () => {
  const text = visibleText('<h1>Basic Widget</h1>');
  assert.deepEqual(notVisible([{ name: 'Premium Gold Widget Deluxe' }], text), ['Premium Gold Widget Deluxe']);
  assert.deepEqual(notVisible([{ name: 'Basic Widget for small homes' }], visibleText('<p>Basic Widget for small homes</p>')), []);
});

test('RealEstateAgent is a LocalBusiness subtype', () => {
  assert.equal(isSubtypeOf('RealEstateAgent', 'LocalBusiness', parents), true);
  assert.equal(isSubtypeOf('Product', 'LocalBusiness', parents), false);
});

test('requiredIssues: LocalBusiness subtype missing address is an ERROR, reported once', () => {
  const item = { '@type': ['RealEstateAgent', 'LocalBusiness'], name: 'Acme Homes', '@location': '1,2' };
  const issues = requiredIssues({ RealEstateAgent: [item], LocalBusiness: [item] }, table, parents);
  const errors = issues.filter((i) => i.severity === 'ERROR');
  assert.equal(errors.length, 1);
  assert.deepEqual(errors[0].fieldNames, ['address']);
});

test('checkPage: Product without offers fails validity; mismatch fails matches; @graph is read', async () => {
  const validator = new Validator(vocab);
  const html = `<html><head>${ld({ '@context': 'https://schema.org', '@graph': [
    { '@type': 'Product', name: 'Premium Gold Widget Deluxe' },
  ] })}</head><body><h1>Basic Widget</h1></body></html>`;
  const [valid, matches] = await checkPage('https://x.test/p', html, validator, table, parents);
  assert.equal(valid.id, 'tech.schema-valid');
  assert.equal(valid.verdict, 'fail');
  assert.equal(matches.id, 'tech.schema-matches');
  assert.equal(matches.verdict, 'fail');
});

test('checkPage: no structured data passes with a note', async () => {
  const [valid, matches] = await checkPage('https://x.test/', '<h1>Hi</h1>', new Validator(vocab), table, parents);
  assert.equal(valid.verdict, 'pass');
  assert.equal(valid.evidence.note, 'no structured data found');
  assert.equal(matches.verdict, 'pass');
});

test('WordPress entities and curly quotes match plain JSON-LD text', () => {
  assert.equal(visibleText('<p>Dubai&#8217;s &#038; Co &ndash; the best&hellip;</p>'), "dubai's & co - the best…");
  const text = visibleText('<h1>Why Dubai&#8217;s market keeps growing</h1>');
  assert.deepEqual(notVisible([{ headline: 'Why Dubai’s market keeps growing' }], text), []);
  assert.equal(decodeEntities('&#x2019;&#9999999;'), '’&#9999999;');
});

test('requiredIssues keeps two distinct businesses distinct (real extractor)', () => {
  const html = ld({ '@context': 'https://schema.org', '@type': 'LocalBusiness', name: 'One Co' })
    + ld({ '@context': 'https://schema.org', '@type': 'LocalBusiness', name: 'Two Co' });
  const data = new WebAutoExtractor({ addLocation: true, embedSource: ['rdfa', 'microdata'] }).parse(html);
  const errors = requiredIssues(data.jsonld, table, parents).filter((i) => i.severity === 'ERROR');
  assert.equal(errors.length, 2);
});

test('schema.org URL and prefix types are normalised', () => {
  assert.equal(normType('https://schema.org/LocalBusiness'), 'LocalBusiness');
  const issues = requiredIssues({ 'schema:LocalBusiness': [{ name: 'x' }] }, table, parents);
  assert.equal(issues.filter((i) => i.severity === 'ERROR').length, 1);
});

test('checkPage reports each issue once for a multi-typed item', async () => {
  const html = `<html><head>${ld({ '@context': 'https://schema.org', '@type': ['Product', 'IndividualProduct'], name: 'Widget' })}</head><body><h1>Widget</h1></body></html>`;
  const [valid] = await checkPage('https://x.test/p', html, new Validator(vocab), table, parents);
  const keys = valid.evidence.errors.map((e) => `${e.message}|${e.fields}`);
  assert.equal(new Set(keys).size, keys.length);
});

test('dedupeIssues keeps distinct locations', () => {
  const a = { severity: 'ERROR', issueMessage: 'm', fieldNames: ['f'], location: '1,2' };
  assert.equal(dedupeIssues([a, { ...a }, { ...a, location: '9,9' }]).length, 2);
});

test('WebPage description (Yoast meta description) is not required to be visible', async () => {
  const html = `<html><head>${ld({ '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebPage', name: 'Home', description: 'A meta description that never appears in the body' },
  ] })}</head><body><h1>Welcome home</h1></body></html>`;
  const [, matches] = await checkPage('https://x.test/', html, new Validator(vocab), table, parents);
  assert.equal(matches.verdict, 'pass');
});

test('microdata-only page: visible-text match is unknown', async () => {
  const html = '<div itemscope itemtype="https://schema.org/Product"><span itemprop="name">Widget</span></div>';
  const [, matches] = await checkPage('https://x.test/m', html, new Validator(vocab), table, parents);
  assert.equal(matches.verdict, 'unknown');
});

test('unknownChecks carry the full check shape', () => {
  for (const c of unknownChecks('https://x.test/', { status: 503 })) {
    assert.deepEqual(Object.keys(c).sort(), ['evidence', 'id', 'pages', 'question', 'source', 'verdict']);
    assert.equal(c.verdict, 'unknown');
  }
});
