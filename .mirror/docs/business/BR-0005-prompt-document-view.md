---
id: BR-0005
type: business
title: Prompt document view
status: active
relates_to: []
implemented_by: []
---
## Rule

Show the business tab as a document view. Show the technical tab as a document view. Show no
canvas on those two tabs.

Show two parts in the document view. Show an index of the prompts of the active tab on the
left. Show one prompt on the right. Show the id, the title, and the status of that prompt.
Show the body of that prompt as a formatted document.

Select the first prompt of the index when no prompt is selected.

Hide the implementation switch and the drift filter on the business tab and on the technical
tab. Show the drift count on every tab.

Show the canvas on the xsrc tab. Show the implementation switch and the drift filter on the
xsrc tab.

## Rationale

A reader reads a business rule as prose. The canvas shows the links between the prompts, but
it does not show the text. The side panel shows the text as one block of raw characters, and
a heading looks the same as a sentence.

A business rule and a technical decision are documents. The reader reads them in the shape of
the source file.

An xsrc prompt describes functions, not prose. The reader reads it on the canvas.

## Acceptance criteria

- Show the document view on the business tab.
- Show the document view on the technical tab.
- Show no canvas on the business tab and no canvas on the technical tab.
- Show the canvas on the xsrc tab.
- Hide the implementation switch and the drift filter on the business tab and on the
  technical tab.
- Show the drift count on the business tab and on the technical tab.
- Show the implementation switch and the drift filter on the xsrc tab.
- List in the index every prompt of the active tab, in ascending id order.
- List no function prompt and no prompt of another tab in the index.
- Select the first prompt of the index when no prompt is selected.
- Render a line that starts with `##` as a heading element.
- Render a line that starts with `-` as a list item element.
- Show the text "No business rules yet." when the business tab holds no prompt.
- Show the text "No technical decisions yet." when the technical tab holds no prompt.
- Show the text "This prompt has no body." when the selected prompt holds an empty body.
