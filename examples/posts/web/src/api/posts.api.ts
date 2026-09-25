export interface Post {
  id: string;
  title: string;
  body: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostInput {
  title: string;
  body: string;
  authorId: string;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly field: string,
    message: string,
  ) {
    super(message);
  }
}

const BASE = '/api';

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    ...init,
    headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json();
  if (!res.ok) throw new ApiError(res.status, data.error?.field ?? '', data.error?.message ?? 'The request failed.');
  return data as T;
}

export function listPosts(authorId?: string): Promise<Post[]> {
  return call(authorId ? `/posts?authorId=${encodeURIComponent(authorId)}` : '/posts');
}

export function getPost(id: string): Promise<Post> {
  return call(`/posts/${encodeURIComponent(id)}`);
}

export function createPost(input: PostInput): Promise<Post> {
  return call('/posts', { method: 'POST', body: JSON.stringify(input) });
}

export function updatePost(id: string, input: Partial<Pick<PostInput, 'title' | 'body'>>): Promise<Post> {
  return call(`/posts/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(input) });
}

export function deletePost(id: string): Promise<void> {
  return call(`/posts/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
