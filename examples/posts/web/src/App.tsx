import { Route, Routes } from 'react-router-dom';
import { EditPostPage } from './pages/EditPostPage';
import { NewPostPage } from './pages/NewPostPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { PostsListPage } from './pages/PostsListPage';

// Opt in to the React Router v7 behavior now.
export const ROUTER_FUTURE = { v7_startTransition: true, v7_relativeSplatPath: true };

export function App() {
  return (
    <Routes>
      <Route path="/" element={<PostsListPage />} />
      <Route path="/posts/new" element={<NewPostPage />} />
      <Route path="/posts/:id" element={<PostDetailPage />} />
      <Route path="/posts/:id/edit" element={<EditPostPage />} />
    </Routes>
  );
}
