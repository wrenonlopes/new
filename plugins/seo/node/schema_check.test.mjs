import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Validator from '@adobe/structured-data-validator';
import {
  visibleText, stringValues, notVisible, subclassIndex, isSubtypeOf, requiredIssues, checkPage,
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
