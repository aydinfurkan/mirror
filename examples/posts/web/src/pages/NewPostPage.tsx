import { Link, useNavigate } from 'react-router-dom';
import { createPost } from '../api/posts.api';
import { PostForm } from '../components/PostForm';

export function NewPostPage() {
  const navigate = useNavigate();
  return (
    <main>
      <Link to="/">Back to posts</Link>
      <h1>New post</h1>
      <PostForm
        initial={{ title: '', body: '', authorId: '' }}
        showAuthor
        submitLabel="Create"
        onSubmit={async (values) => {
          const post = await createPost(values);
          navigate(`/posts/${post.id}`);
        }}
      />
    </main>
  );
}
