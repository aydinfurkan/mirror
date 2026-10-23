// Run with: node --test action/review-page.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { MARKER, publish, render, reviewPages, unpublish } from './review-page.mjs';

function setup() {
  const root = mkdtempSync(join(tmpdir(), 'mirror-review-'));
  const remote = join(root, 'remote.git');
  const dir = join(root, 'work');
  const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8' });
  git(root, 'init', '-q', '--bare', remote);
  git(root, 'clone', '-q', remote, dir);
  git(dir, 'config', 'user.email', 'test@example.com');
  git(dir, 'config', 'user.name', 'test');
  const write = (path, text) => { mkdirSync(dirname(join(dir, path)), { recursive: true }); writeFileSync(join(dir, path), text); };
  const commit = (msg) => { git(dir, 'add', '-A'); git(dir, 'commit', '-qm', msg); return git(dir, 'rev-parse', 'HEAD').trim(); };
  const pagesFile = (path) => git(dir, 'show', `origin/gh-pages:${path}`);
  const pagesFiles = () => { git(dir, 'fetch', '-q', 'origin', 'gh-pages'); return git(dir, 'ls-tree', '-r', '--name-only', 'origin/gh-pages').split('\n').filter(Boolean); };
  const remoteBranches = () => git(remote, 'branch', '--format=%(refname:short)').split('\n').filter(Boolean);
  return { dir, git, write, commit, pagesFile, pagesFiles, remoteBranches, done: () => rmSync(root, { recursive: true, force: true }) };
}

test('finds the added and changed review pages', () => {
  const r = setup();
  r.write('.mirror/features/0001-old.html', 'old');
  r.write('.mirror/features/0002-changed.html', 'v1');
  r.write('.mirror/features/0003-deleted.html', 'gone');
  const base = r.commit('base');
  r.write('.mirror/features/0002-changed.html', 'v2');
  r.write('.mirror/features/0004-new.html', 'new');
  r.write('.mirror/xsrc/api/x/definition.md', 'x');
  rmSync(join(r.dir, '.mirror/features/0003-deleted.html'));
  const head = r.commit('head');
  assert.deepEqual(reviewPages(base, head, '.mirror', r.dir), ['.mirror/features/0002-changed.html', '.mirror/features/0004-new.html']);
  r.done();
});

test('publishes to pr-<n>/ of the Pages branch, then removes it', () => {
  const r = setup();
  r.write('.mirror/features/0001-cancel-order.html', '<html>cancel</html>');
  const head = r.commit('page');
  r.git(r.dir, 'push', '-q', 'origin', 'HEAD:main');

  assert.equal(publish({ pages: ['.mirror/features/0001-cancel-order.html'], pr: 7, head, branch: 'gh-pages', cwd: r.dir }), true);
  assert.deepEqual(r.pagesFiles(), ['.nojekyll', 'pr-7/0001-cancel-order.html']);
  assert.equal(r.pagesFile('pr-7/0001-cancel-order.html'), '<html>cancel</html>');

  // Another pull request keeps its own folder.
  publish({ pages: ['.mirror/features/0001-cancel-order.html'], pr: 8, head, branch: 'gh-pages', cwd: r.dir });
  // The same content again: no new commit.
  assert.equal(publish({ pages: ['.mirror/features/0001-cancel-order.html'], pr: 7, head, branch: 'gh-pages', cwd: r.dir }), false);

  assert.equal(unpublish({ pr: 7, branch: 'gh-pages', cwd: r.dir }), true);
  assert.deepEqual(r.pagesFiles(), ['.nojekyll', 'pr-8/0001-cancel-order.html']);
  r.done();
});

test('unpublish does not create the Pages branch', () => {
  const r = setup();
  r.write('README.md', 'x');
  r.commit('base');
  assert.equal(unpublish({ pr: 3, branch: 'gh-pages', cwd: r.dir }), false);
  assert.deepEqual(r.remoteBranches(), []);
  r.done();
});

test('renders the comment', () => {
  const body = render({ links: [{ name: '0002-refund-order', url: 'https://example.com/pr-1/0002-refund-order.html' }], sha: 'abcdef1234' });
  assert.ok(body.startsWith(MARKER));
  assert.match(body, /- \*\*\[0002-refund-order\]\(https:\/\/example.com\/pr-1\/0002-refund-order.html\)\*\*/);
  assert.match(body, /For abcdef1\. After a push, GitHub Pages/);
  assert.match(render({ links: [{ name: 'a', url: 'u' }], artifact: true }), /a file of the Actions run/);
  assert.match(render({ links: [] }), /adds no review page/);
});
