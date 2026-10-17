import test from 'node:test';
import assert from 'node:assert/strict';
import { addMonth, daysBetween } from '../src/dates.js';
import { erasureLetter, followUpLetter, mailto } from '../src/letters.js';
import { brokers, quickWins, checkedLabel } from '../src/brokers.js';

test('deadline is one calendar month later', () => {
  assert.equal(addMonth('2026-10-17'), '2026-11-17');
  assert.equal(addMonth('2026-12-15'), '2027-01-15');
});

test('deadline falls back to the last day of a shorter month', () => {
  assert.equal(addMonth('2026-01-31'), '2026-02-28');
  assert.equal(addMonth('2028-01-31'), '2028-02-29');
  assert.equal(addMonth('2026-03-31'), '2026-04-30');
});

test('days between dates', () => {
  assert.equal(daysBetween('2026-10-17', '2026-11-17'), 31);
  assert.equal(daysBetween('2026-11-18', '2026-11-17'), -1);
});

const me = { name: 'Sam Jones ', email: 'sam@example.com', address: '1 High St\nLeeds\nLS1 1AA', previous: '', phone: '', dob: '' };
const cra = brokers.find((b) => b.kind === 'cra');
const marketing = brokers.find((b) => b.kind === 'marketing');

test('letter includes only the details given, on one line each', () => {
  const { body } = erasureLetter(marketing, me, '2026-10-17');
  assert.match(body, /Name: Sam Jones\n/);
  assert.match(body, /Address: 1 High St, Leeds, LS1 1AA/);
  assert.doesNotMatch(body, /Phone:|Date of birth:|Previous addresses:/);
  assert.match(body, /by 17 November 2026/);
  assert.match(body, /Article 21\(2\)/);
});

test('credit agency letter carves out credit data, marketing broker letter does not', () => {
  assert.match(erasureLetter(cra, me, '2026-10-17').body, /keep the credit data/);
  assert.doesNotMatch(erasureLetter(marketing, me, '2026-10-17').body, /keep the credit data/);
});

test('follow-up names the original date and the missed deadline', () => {
  const { body } = followUpLetter(marketing, me, '2026-09-01', '2026-10-17');
  assert.match(body, /On 1 September 2026/);
  assert.match(body, /passed on 1 October 2026/);
});

test('mailto encodes subject and body with CRLF line breaks', () => {
  const url = mailto('dpo@example.com', { subject: 'A & B', body: 'one\ntwo' });
  assert.equal(url, 'mailto:dpo@example.com?subject=A%20%26%20B&body=one%0D%0Atwo');
});

test('mailto adds a cc when there is one', () => {
  assert.match(mailto('a@example.com', { subject: 's', body: 'b' }, 'c@example.com'), /^mailto:a@example\.com\?cc=c@example\.com&subject=s&body=b$/);
});

test('every broker has what the UI needs', () => {
  const ids = new Set();
  for (const b of [...brokers, ...quickWins]) {
    assert.ok(!ids.has(b.id), `duplicate id ${b.id}`);
    ids.add(b.id);
  }
  for (const b of brokers) {
    for (const a of [b.email, b.cc].filter(Boolean)) assert.match(a, /^[^@\s]+@[^@\s]+\.[a-z]+$/i, b.id);
    assert.ok(checkedLabel[b.checked], b.id);
    assert.match(b.source, /^https:\/\//, b.id);
    assert.ok(['cra', 'marketing'].includes(b.kind), b.id);
  }
  for (const w of quickWins) assert.match(w.url, /^https:\/\//, w.id);
});

test('a damaged backup is cleaned instead of breaking the page', async () => {
  const { clean } = await import('../src/store.js');
  const out = clean({
    me: { name: 1, email: 'sam@example.com', evil: 'x' },
    requests: { experian: { status: 'sent', sentOn: 'garbage' }, equifax: { status: 'done', sentOn: '2026-09-01', extra: '<img>' }, acxiom: { status: 'hacked', sentOn: '2026-09-01' }, x: null },
    wins: 5,
  });
  assert.deepEqual(out.me, { name: '', email: 'sam@example.com', address: '', previous: '', phone: '', dob: '' });
  assert.deepEqual(out.requests, { equifax: { status: 'done', sentOn: '2026-09-01' } });
  assert.deepEqual(out.wins, {});
  assert.deepEqual(clean(null), clean('nope'));
});
