---
id: ADR-0004
type: technical
title: Render prompt bodies with a small in-repo markdown renderer
status: accepted
date: 2026-08-22
driven_by: [BR-0005]
applies_to: [visualize/src/**]
supersedes: []
---
## Context

The business tab and the technical tab show a prompt body as a document. The body is the
markdown text that follows the frontmatter. The reader must see a heading as a heading and a
list item as a list item.

The prompt files come from this repository. No reader supplies them. The bodies use a small
part of markdown: headings, bullet lists, paragraphs, and inline code.

The canvas holds four runtime dependencies today.

## Decision

Split the renderer in two parts.

Write a pure parser in `visualize/src/markdown.ts`. The parser reads the body text and
returns a list of blocks. It supports a heading line, a bullet list, and a paragraph. It
returns a paragraph for a line that it does not know.

Write a component in `visualize/src/components/Markdown.tsx`. The component reads the blocks
and returns React elements. It renders an inline code span.

The component returns React elements. It never returns an HTML string, and no component
calls `dangerouslySetInnerHTML`.

## Consequences

- The canvas adds no runtime dependency.
- No component injects HTML. A body cannot inject markup.
- A markdown feature outside the list renders as plain text. A table stays a row of pipes.
- The parser holds no React import. A unit test asserts on data, not on markup.
- The renderer needs a unit test for each block kind.

## Alternatives considered

- **Add `react-markdown`.** It supports all of CommonMark. It adds about fifteen packages to
  a canvas that holds four runtime dependencies. The prompt bodies need four block kinds.
- **Render the HTML in the graph builder.** The generated `graph.json` would then hold HTML,
  and the canvas would inject that HTML into the DOM. The generated file must stay data.
