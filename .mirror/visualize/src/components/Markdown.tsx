import { Fragment, type ReactNode } from 'react';
import { parseMarkdown } from '../markdown.js';

/**
 * Split one line of text on its backtick spans.
 * An odd backtick count leaves the last span open. Render that span as text, because a
 * stray backtick in a prompt must not swallow the rest of the line.
 */
export function renderInline(text: string): ReactNode[] {
  return text.split('`').map((part, index) =>
    index % 2 === 1 ? <code key={index}>{part}</code> : <Fragment key={index}>{part}</Fragment>,
  );
}

/**
 * Show a prompt body as a document.
 * A document sits under the panel heading, so the top markdown heading renders as an h3.
 */
export function Markdown({ body }: { body: string }) {
  const blocks = parseMarkdown(body);

  return (
    <>
      {blocks.map((block, index) => {
        if (block.kind === 'heading') {
          const Tag = `h${Math.min(block.level + 1, 6)}` as 'h3';
          return <Tag key={index}>{renderInline(block.text)}</Tag>;
        }
        if (block.kind === 'list') {
          return (
            <ul key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }
        return <p key={index}>{renderInline(block.text)}</p>;
      })}
    </>
  );
}
