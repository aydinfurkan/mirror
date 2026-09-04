import { describe, expect, it } from 'vitest';
import { parseMarkdown } from './markdown.js';

describe('parseMarkdown', () => {
  it('reads a heading line and keeps its level', () => {
    expect(parseMarkdown('## Rule')).toEqual([{ kind: 'heading', level: 2, text: 'Rule' }]);
  });

  it('groups consecutive bullet lines into one list', () => {
    expect(parseMarkdown('- one\n- two\n- three')).toEqual([
      { kind: 'list', items: ['one', 'two', 'three'] },
    ]);
  });

  it('starts a new list after a heading breaks the run', () => {
    expect(parseMarkdown('- one\n\n## Next\n\n- two')).toEqual([
      { kind: 'list', items: ['one'] },
      { kind: 'heading', level: 2, text: 'Next' },
      { kind: 'list', items: ['two'] },
    ]);
  });

  it('joins the lines of one paragraph and splits on a blank line', () => {
    expect(parseMarkdown('first line\nsame paragraph\n\nsecond paragraph')).toEqual([
      { kind: 'paragraph', text: 'first line same paragraph' },
      { kind: 'paragraph', text: 'second paragraph' },
    ]);
  });

  it('returns a paragraph for a line it does not know', () => {
    expect(parseMarkdown('| a | b |')).toEqual([{ kind: 'paragraph', text: '| a | b |' }]);
  });

  it('returns no block for an empty body', () => {
    expect(parseMarkdown('')).toEqual([]);
  });

  it('keeps a continuation line of a bullet in the same item', () => {
    expect(parseMarkdown('- one that wraps\n  onto a second line\n- two')).toEqual([
      { kind: 'list', items: ['one that wraps onto a second line', 'two'] },
    ]);
  });
});
