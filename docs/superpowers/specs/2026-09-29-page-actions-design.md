# Page actions — design

> **Superseded in part (2026-09-29):** the viewer does not read links. In "3. Viewer", only the
> card label, the marks and the Actions tab apply. A `Call:` shows as text, not as a link. The
> build does not write `old.actions: null`.

Date: 2026-09-29. Builds on `2026-09-29-project-links-design.md` (branch `feat/project-links`).

## Goal

A page does not run from top to bottom. It waits for the user. Describe each page as a set of
actions: what the user (or the page) does, what it calls, and what happens after a success or a
failure. Backend, worker and consumer flows keep `steps.md`.

## Decisions

- Pages (`frontend`, `expo`) use a new file `actions.md` instead of `steps.md`. The file name tells
  Claude which rule to use.
- The `Call:` lines of `actions.md` are the only source of a page's links. A page's `boundary.md`
  has no `## Dependencies` section.
- Actions have no numbers. They do not run in order.

## 1. Format

### `actions.md`

Path: `.mirror/xsrc/<project>/<page>/actions.md`.

```md
## Open the page
- Call: `api/get-post`: load the post from the route `id`.
- Then: show the form with the title and the body.
- Fail: show an alert when the post does not exist.
- Code: `src/pages/EditPostPage.tsx#EditPostPage`

## Click "Save"
- Call: `api/update-post`: send the title and the body.
- Then: open `/posts/<id>`.
- Fail: show the API error on the form.
- Code: `src/components/PostForm.tsx#PostForm`
```

- One `## <action>` header per user action or page event. The title starts with a verb: Open,
  Click, Submit, Change, Scroll, Pull.
- Bullets in this order: `Call:` (zero or more), `Then:` (zero or more), `Fail:` (zero or more),
  then exactly one `Code:`.
- `Call:` grammar: ``- Call: `<target>`[: <note>]``. The target is `<project>/<flow>`, `<project>`,
  or an external id from `config.json`. Each `Call:` is a `calls` link.
- Local logic (state, navigation, storage) goes in `Then:` or `Fail:`, not in `Call:`.
- `Code:` is `path#function`, as in `steps.md`.

### `boundary.md` of a page

- No `## Dependencies` section. The check fails when a page's boundary has links, and the error
  says to move them to `Call:` lines in `actions.md`.

## 2. Built data

A page flow keeps the `steps` array, so cards, search and the review diff work unchanged. BUILD
makes one entry per `## <action>` header of `actions.md`:

- `n`: the position of the action, from 1. The viewer does not show it.
- `title`: the header text. End it with a period.
- `details`: each bullet except `Code:`, in order, with its label (`Call: …`, `Then: …`,
  `Fail: …`). End each with a period.
- `ref`: the backtick span of the `Code:` bullet. `""` when there is none.
- `text`: the title, then each detail, joined with a space.
- `status`: `null`.

A page flow also gets `actions`: the full text of `actions.md`. A review page compares `actions`
too, and puts the old text in `old.actions` when it differs.

A page folder without `actions.md` (a mirror made before this change) builds `steps` from
`steps.md` as before, and gets no `actions` field.

## 3. Viewer

- Links of a flow:
  - when the flow has an `actions` field: the `Call:` lines of `actions` (verb `calls`);
  - else: the `## Dependencies` links of `boundary` (as today).
- Old links on a review page come from `old.actions` or `old.boundary`, by the same rule.
- Check (`linkErrors`):
  - a `- Call:` bullet that does not match the grammar is an error;
  - a `Call:` target that does not exist is an error;
  - a flow with an `actions` field and links in its boundary `## Dependencies` is an error.
- Card: a page with actions shows `▸ N actions` (`1 action`). The open list shows each action title
  with a mark, not a number.
- Drawer: a page with actions has the tabs `definition`, `actions`, `boundary`, `links`, `rules`.
  The Actions tab lists each action: its title, each `Call:` target as a link that jumps to the
  target, the `Then:` and `Fail:` bullets, and the code reference.
- A selected action in the drawer shows the same content for that one action.

## 4. Docs

- New `rules/actions.md` and `rules/examples/actions.md`.
- `rules/steps.md`: for `backend`, `worker` and `consumer` flows only.
- `rules/boundary.md`: the Pages section says there is no Dependencies section; the calls are in
  `actions.md`.
- `BUILD.md`: the page steps from `actions.md`; the `actions` field; the review compares `actions`.
- `WORKFLOW.md`: a page folder has `actions.md` instead of `steps.md`. The code reference check
  covers `steps.md` and `actions.md`.
- `AGENTS.md`: add the `actions.md` row to the file table.
- `init`: write `actions.md` for each page. Find each action from the event handlers, the form
  submits and the load effect of the page.
- Copy each template change to `examples/posts/.mirror/`.

## 5. Example repo

- Convert the 4 web pages to `actions.md`. Delete their `steps.md`.
- Remove `## Dependencies` from the 4 page boundaries.
- Rebuild `examples/posts/.mirror/visualize.html`.

## Testing

Add to `visualize.check.mjs`:

- `Call:` lines become `calls` links; notes; `\r\n`;
- a bad `Call:` bullet and an unknown `Call:` target are errors;
- a page with `actions` and boundary links is an error;
- a page without `actions` still uses its boundary links;
- `old.actions` gives a removed System line;
- a page card says `N actions` and shows no step numbers; a flow card still says `N steps`.

Both pages (template and example) must print `ok`.

## Out of scope

- Actions for backend flows.
- A graph of actions inside a page (which action leads to which).
