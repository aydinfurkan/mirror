import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getPost, updatePost, type Post } from '../api/posts.api';
import { PostForm } from '../components/PostForm';

export function EditPostPage() {
  const id = useParams().id!;
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getPost(id).then(setPost, () => setError(true));
  }, [id]);

  if (error) return <main><p role="alert">Could not find this post.</p><Link to="/">Back to posts</Link></main>;
  if (!post) return <main><p>Loading…</p></main>;

  return (
    <main>
      <Link to={`/posts/${id}`}>Back to the post</Link>
      <h1>Edit post</h1>
      <PostForm
        initial={post}
        showAuthor={false}
        submitLabel="Save"
        onSubmit={async ({ title, body }) => {
          await updatePost(id, { title, body });
          navigate(`/posts/${id}`);
        }}
      />
    </main>
  );
}
