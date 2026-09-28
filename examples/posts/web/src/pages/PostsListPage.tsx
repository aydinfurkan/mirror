import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { listPosts, type Post } from '../api/posts.api';

export function PostsListPage() {
  const [params, setParams] = useSearchParams();
  const authorId = params.get('authorId') ?? '';
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setPosts(null);
    listPosts(authorId || undefined).then(setPosts, () => setError(true));
  }, [authorId]);

  return (
    <main>
      <header className="row">
        <h1>Posts</h1>
        <Link to="/posts/new">New post</Link>
      </header>
      <label>
        Author id
        <input
          value={authorId}
          onChange={(e) => setParams(e.target.value ? { authorId: e.target.value } : {})}
        />
      </label>
      {error && <p role="alert">Could not load the posts.</p>}
      {!error && !posts && <p>Loading…</p>}
      {posts?.length === 0 && <p>No posts yet.</p>}
      <ul>
        {posts?.map((post) => (
          <li key={post.id}>
            <Link to={`/posts/${post.id}`}>{post.title}</Link> <small>by {post.authorId}</small>
          </li>
        ))}
      </ul>
    </main>
  );
}
