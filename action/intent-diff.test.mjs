// Run with: node --test action/intent-diff.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MARKER, makeBody } from './intent-diff.mjs';

const shop = join(dirname(fileURLToPath(import.meta.url)), '..', 'examples', 'shop', '.mirror');

function repo() {
  const dir = mkdtempSync(join(tmpdir(), 'mirror-diff-'));
  const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' });
  git('init', '-q');
  git('config', 'user.email', 'test@example.com');
  git('config', 'user.name', 'test');
  cpSync(shop, join(dir, '.mirror'), { recursive: true });
  git('add', '-A');
  git('commit', '-qm', 'base');
  const commit = (msg) => { git('add', '-A'); git('commit', '-qm', msg); return git('rev-parse', 'HEAD').trim(); };
  const base = git('rev-parse', 'HEAD').trim();
  const write = (path, text) => { mkdirSync(dirname(join(dir, path)), { recursive: true }); writeFileSync(join(dir, path), text); };
  const read = (path) => readFileSync(join(dir, path), 'utf8');
  return { dir, base, commit, write, read, done: () => rmSync(dir, { recursive: true, force: true }) };
}

test('no change in xsrc', () => {
  const r = repo();
  r.write('README.md', 'hello\n');
  const head = r.commit('code only');
  const { body, changed } = makeBody(r.base, head, '.mirror', r.dir);
  assert.equal(changed, false);
  assert.ok(body.startsWith(MARKER));
  assert.match(body, /does not change the intent/);
  r.done();
});

test('added, changed and removed flows and pages', () => {
  const r = repo();
  const x = '.mirror/xsrc';
  // Added flow.
  r.write(`${x}/api/refund-order/definition.md`, '---\ntrigger: http\nentry: POST /orders/:id/refund\ngroup: orders\n---\nRefund an order.\n');
  r.write(`${x}/api/refund-order/steps.md`, '## 1. Read the order\n- Return HTTP 404 when it does not exist.\n\n## 2. Refund it\n');
  r.write(`${x}/api/refund-order/boundary.md`, '## Input\n');
  // Changed flow: a new step and new rules.
  r.write(`${x}/api/cancel-order/steps.md`, r.read(`${x}/api/cancel-order/steps.md`) + '\n## 6. Send an email to the customer\n');
  r.write(`${x}/api/cancel-order/business-rules.md`, r.read(`${x}/api/cancel-order/business-rules.md`).replace('24 hours.', '48 hours.'));
  // Changed page: the entry.
  r.write(`${x}/web/cart/definition.md`, r.read(`${x}/web/cart/definition.md`).replace('entry: /cart', 'entry: /basket'));
  // Removed flow.
  rmSync(join(r.dir, x, 'api/get-product'), { recursive: true });
  // New external system.
  const config = JSON.parse(r.read(`${x}/config.json`));
  config.external.sms = { kind: 'api', name: 'Twilio' };
  r.write(`${x}/config.json`, JSON.stringify(config, null, 2));
  // A review page.
  r.write('.mirror/features/0002-refund-order.html', '<html></html>');
  const head = r.commit('change');

  const { body, changed } = makeBody(r.base, head, '.mirror', r.dir, (p) => `https://example.com/${p}`);
  assert.equal(changed, true);
  assert.match(body, /\*\*3 flows and 1 page\*\*: 1 added, 2 changed, 1 removed/);
  assert.match(body, /🟢 added \| `api` \| `refund-order` \| `POST \/orders\/:id\/refund` \| new flow/);
  assert.match(body, /🟡 changed \| `api` \| `cancel-order` \| `POST \/orders\/:id\/cancel` \| business rules, steps \(\+1 −0\)/);
  assert.match(body, /🟡 changed \| `web` \| `cart` \| `\/basket` \| entry/);
  assert.match(body, /🔴 removed \| `api` \| `get-product` \|/);
  assert.match(body, /🟢 added \| `sms` \| external api \| Twilio/);
  assert.match(body, /➕ Send an email to the customer\./);
  assert.match(body, /<summary>business-rules.md<\/summary>/);
  assert.match(body, /^-.*cancel for 24 hours\./m);
  assert.match(body, /^\+.*cancel for 48 hours\./m);
  assert.match(body, /Review page: \[`.mirror\/features\/0002-refund-order.html`\]\(https:\/\/example.com\/.mirror\/features\/0002-refund-order.html\)/);
  r.done();
});

test('a repository with no mirror at the base', () => {
  const r = repo();
  execFileSync('git', ['rm', '-rqf', '.mirror'], { cwd: r.dir });
  const empty = r.commit('no mirror');
  cpSync(shop, join(r.dir, '.mirror'), { recursive: true });
  const head = r.commit('init');
  const { body } = makeBody(empty, head, '.mirror', r.dir);
  assert.match(body, /🟢 added \| `api` \| backend \| project added/);
  assert.match(body, /\*\*8 flows and 5 pages\*\*: 13 added/);
  r.done();
});
