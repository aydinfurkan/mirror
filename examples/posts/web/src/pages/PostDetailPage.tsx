import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deletePost, getPost, type Post } from '../api/posts.api';

export function PostDetailPage() {
  const id = useParams().id!;
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPost(id).then(setPost, () => setError('Could not find this post.'));
  }, [id]);

  async function remove() {
    if (!window.confirm('Delete this post?')) return;
    try {
      await deletePost(id);
      navigate('/');
    } catch {
      setError('Could not delete this post.');
    }
  }

  if (error) return <main><p role="alert">{error}</p><Link to="/">Back to posts</Link></main>;
  if (!post) return <main><p>Loading…</p></main>;

  return (
    <main>
      <Link to="/">Back to posts</Link>
      <h1>{post.title}</h1>
      <p><small>by {post.authorId} · updated {new Date(post.updatedAt).toLocaleString()}</small></p>
      <p className="body">{post.body}</p>
      <div className="row">
        <Link to={`/posts/${post.id}/edit`}>Edit</Link>
        <button type="button" onClick={remove}>Delete</button>
      </div>
    </main>
  );
}
