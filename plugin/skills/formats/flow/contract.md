# Rule: flow `contract.md`

Path: `.mirror/xsrc/<project>/<flow>/contract.md`. The contract of the flow: its fields, its
results and its links. The example input and results are in `flow.md`, not here.

## Sections

In this order:

- `## Input`: the trigger line (endpoint, queue or script), then one table row per input
  field: path, query, body or message field. Put the shape limits (type, required, length,
  format) in the Validation column.
- `## Auth`: one bullet: who can start the flow, then `: ` and how the code checks it. For
  example ``- Signed-in user: `requireAuth` reads the session cookie.`` Write `- Public: ` when
  anyone can start it. Write `- None: ` and the reason when the flow has no check, for example
  a consumer that trusts its topic. Rules about who owns the data stay in `## Constraints` of
  `business-rules.md`.
- `## Output`: one table row per result: each status code, event or effect, with each error.
- `## Dependencies`: one bullet per link to another flow, project or external system. Write
  other needs (a helper, a repository in memory) as plain bullets. See "Links".

## Links

A link connects a flow or a page to another flow, a project or an external system. A flow
writes its links in `## Dependencies`. A page writes them as `Call:` bullets in `actions.md`.

Write each link as one bullet:

```md
- calls `api/create-post`: sends the form values.
- writes `posts-db`: saves the post.
- publishes `post-events`
```

- Start the bullet with one verb: `calls`, `publishes`, `consumes`, `reads` or `writes`.
- Put the target in backticks: `<project>/<flow>`, `<project>` when the flow is not known, or the
  id of an external system in `.mirror/xsrc/config.json`. Use only a target that exists.
- Add `: <note>` to tell why. The note is optional.
- Do not add text after the target without `: `. Do not write ``- reads `db` (in memory).``
- Add each external system to `external` in `.mirror/xsrc/config.json` before you link to it.
  See "config.json" in `layout.md`.
- A bullet that does not start with a verb is a plain note. The viewer does not draw it.

## Examples

- REST endpoint: `examples/flow/contract-rest.md`
- Consumer: `examples/flow/contract-consumer.md`
