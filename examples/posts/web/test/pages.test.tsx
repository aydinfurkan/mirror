import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App, ROUTER_FUTURE } from '../src/App';
import type { Post } from '../src/api/posts.api';

// A fake posts API behind fetch: enough of the real contract for the pages.
let posts: Post[];
let calls: string[];

function json(status: number, body: unknown) {
  return new Response(status === 204 ? null : JSON.stringify(body), { status });
}

beforeEach(() => {
  posts = [
    { id: 'p2', title: 'Second', body: 'Two', authorId: 'u2', createdAt: '2', updatedAt: '2' },
    { id: 'p1', title: 'First', body: 'One', authorId: 'u1', createdAt: '1', updatedAt: '1' },
  ];
  calls = [];
  vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
    const method = init?.method ?? 'GET';
    calls.push(`${method} ${url}`);
    const [path, query] = url.replace('/api', '').split('?');
    const id = path.split('/')[2];
    const found = posts.find((p) => p.id === id);
    const body = init?.body ? JSON.parse(String(init.body)) : {};
    if (method === 'GET' && path === '/posts') {
      const author = new URLSearchParams(query).get('authorId');
      return json(200, posts.filter((p) => !author || p.authorId === author));
    }
    if (method === 'POST') {
      if (!body.title) return json(400, { error: { code: 'validation', field: 'title', message: 'Enter a title.' } });
      const post = { id: 'p3', ...body, createdAt: '3', updatedAt: '3' };
      posts.unshift(post);
      return json(201, post);
    }
    if (!found) return json(404, { error: { code: 'not-found', field: 'id', message: 'Find no post with this id.' } });
    if (method === 'GET') return json(200, found);
    if (method === 'PATCH') return json(200, Object.assign(found, body));
    posts = posts.filter((p) => p !== found);
    return json(204, null);
  });
  vi.stubGlobal('confirm', () => true);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function open(path: string) {
  render(
    <MemoryRouter initialEntries={[path]} future={ROUTER_FUTURE}>
      <App />
    </MemoryRouter>,
  );
}

const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe('posts-list', () => {
  it('lists the posts with links', async () => {
    open('/');
    expect((await screen.findByText('Second')).closest('a')?.getAttribute('href')).toBe('/posts/p2');
    expect(screen.getByText('First')).toBeTruthy();
  });

  it('filters by author', async () => {
    open('/?authorId=u1');
    await screen.findByText('First');
    expect(screen.queryByText('Second')).toBeNull();
    expect(calls).toContain('GET /api/posts?authorId=u1');
  });

  it('shows an empty state', async () => {
    posts = [];
    open('/');
    expect(await screen.findByText('No posts yet.')).toBeTruthy();
  });
});

describe('post-detail', () => {
  it('shows the post', async () => {
    open('/posts/p1');
    expect(await screen.findByRole('heading', { name: 'First' })).toBeTruthy();
    expect(screen.getByText('One')).toBeTruthy();
  });

  it('deletes the post and goes back to the list', async () => {
    open('/posts/p1');
    fireEvent.click(await screen.findByText('Delete'));
    await screen.findByRole('heading', { name: 'Posts' });
    expect(calls).toContain('DELETE /api/posts/p1');
    expect(screen.queryByText('First')).toBeNull();
  });

  it('shows an error for an unknown post', async () => {
    open('/posts/nope');
    expect((await screen.findByRole('alert')).textContent).toBe('Could not find this post.');
  });
});

describe('new-post', () => {
  it('creates a post and opens it', async () => {
    open('/posts/new');
    type('Title', 'Third');
    type('Body', 'Three');
    type('Author id', 'u1');
    fireEvent.click(screen.getByText('Create'));
    expect(await screen.findByRole('heading', { name: 'Third' })).toBeTruthy();
  });

  it('shows the API error and stays on the form', async () => {
    open('/posts/new');
    fireEvent.click(screen.getByText('Create'));
    expect((await screen.findByRole('alert')).textContent).toBe('Enter a title.');
  });
});

describe('edit-post', () => {
  it('saves the changes and opens the post', async () => {
    open('/posts/p1/edit');
    await screen.findByDisplayValue('First');
    type('Title', 'First, edited');
    fireEvent.click(screen.getByText('Save'));
    expect(await screen.findByRole('heading', { name: 'First, edited' })).toBeTruthy();
    expect(calls).toContain('PATCH /api/posts/p1');
  });
});
