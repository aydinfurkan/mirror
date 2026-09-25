import { useState, type FormEvent } from 'react';
import { ApiError } from '../api/posts.api';

export interface PostFormValues {
  title: string;
  body: string;
  authorId: string;
}

interface Props {
  initial: PostFormValues;
  showAuthor: boolean;
  submitLabel: string;
  onSubmit(values: PostFormValues): Promise<void>;
}

export function PostForm({ initial, showAuthor, submitLabel, onSubmit }: Props) {
  const [values, setValues] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (field: keyof PostFormValues) => (e: { target: { value: string } }) =>
    setValues({ ...values, [field]: e.target.value });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reach the server.');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <label>
        Title
        <input value={values.title} onChange={set('title')} />
      </label>
      <label>
        Body
        <textarea rows={8} value={values.body} onChange={set('body')} />
      </label>
      {showAuthor && (
        <label>
          Author id
          <input value={values.authorId} onChange={set('authorId')} />
        </label>
      )}
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={busy}>
        {submitLabel}
      </button>
    </form>
  );
}
