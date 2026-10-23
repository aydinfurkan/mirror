// Run with: node --test action/review-page.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { MARKER, newestPage, render, reviewPages } from './review-page.mjs';

test('finds the added and changed review pages', () => {
  const dir = mkdtempSync(join(tmpdir(), 'mirror-review-'));
  const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' });
  const write = (path, text) => { mkdirSync(dirname(join(dir, path)), { recursive: true }); writeFileSync(join(dir, path), text); };
  const commit = (msg) => { git('add', '-A'); git('-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-qm', msg); return git('rev-parse', 'HEAD').trim(); };
  git('init', '-q');
  write('.mirror/features/0001-old.html', 'old');
  write('.mirror/features/0002-changed.html', 'v1');
  write('.mirror/features/0003-deleted.html', 'gone');
  const base = commit('base');
  write('.mirror/features/0002-changed.html', 'v2');
  write('.mirror/features/0004-new.html', 'new');
  write('.mirror/xsrc/api/x/definition.md', 'x');
  rmSync(join(dir, '.mirror/features/0003-deleted.html'));
  const head = commit('head');
  const pages = reviewPages(base, head, '.mirror', dir);
  assert.deepEqual(pages, ['.mirror/features/0002-changed.html', '.mirror/features/0004-new.html']);
  assert.equal(newestPage(pages), '.mirror/features/0004-new.html');
  assert.equal(newestPage([]), null);
  rmSync(dir, { recursive: true, force: true });
});

test('renders the comment', () => {
  const body = render({ name: '0002-refund-order', url: 'https://example.com/a/1', sha: 'abcdef1234' });
  assert.ok(body.startsWith(MARKER));
  assert.match(body, /\*\*\[0002-refund-order\]\(https:\/\/example.com\/a\/1\)\*\*/);
  assert.match(body, /For abcdef1\. The page is a file of the Actions run/);
  assert.match(render({ url: '' }), /adds no review page/);
});
