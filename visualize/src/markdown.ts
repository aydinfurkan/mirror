export type Block =
  | { kind: 'heading'; level: number; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'paragraph'; text: string };

const HEADING = /^(#{1,6})\s+(.*)$/;
const BULLET = /^[-*]\s+(.*)$/;

/**
 * Split a prompt body into blocks.
 * The prompts use four shapes: a heading, a bullet list, a paragraph, and a blank line.
 * A line outside those shapes becomes paragraph text, so a table stays readable as pipes
 * instead of disappearing.
 */
export function parseMarkdown(body: string): Block[] {
  const blocks: Block[] = [];
  let list: string[] | null = null;
  let paragraph: string[] = [];

  function closeParagraph(): void {
    if (paragraph.length === 0) return;
    blocks.push({ kind: 'paragraph', text: paragraph.join(' ') });
    paragraph = [];
  }

  function closeList(): void {
    if (list === null) return;
    blocks.push({ kind: 'list', items: list });
    list = null;
  }

  for (const line of body.split('\n')) {
    const indented = /^\s+\S/.test(line);
    const text = line.trim();

    if (text === '') {
      closeParagraph();
      // A blank line does not end a list. Two bullet runs stay one list only when no other
      // block sits between them, and the heading branch below closes the list.
      continue;
    }

    const heading = HEADING.exec(text);
    if (heading) {
      closeParagraph();
      closeList();
      blocks.push({ kind: 'heading', level: heading[1].length, text: heading[2] });
      continue;
    }

    const bullet = BULLET.exec(text);
    if (bullet) {
      closeParagraph();
      if (list === null) list = [];
      list.push(bullet[1]);
      continue;
    }

    if (list !== null && indented) {
      // An indented line under a bullet continues that item.
      list[list.length - 1] = `${list[list.length - 1]} ${text}`;
      continue;
    }

    closeList();
    paragraph.push(text);
  }

  closeParagraph();
  closeList();
  return blocks;
}
