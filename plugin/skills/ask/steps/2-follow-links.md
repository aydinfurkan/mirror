# Follow the links

For each flow or page that you found:

1. Read its files. Read only the files that the question needs.

   | The question asks                          | Read                                       |
   | ------------------------------------------ | ------------------------------------------ |
   | what happens, in which order               | `steps.md`, or `actions.md` for a page     |
   | what is allowed, who can do it, why        | `business-rules.md`                        |
   | the input, the output, the errors          | `boundary.md`                              |
   | how a page looks                           | `design.md`                                |

2. Follow the links to find what happens next. A flow writes its links in `## Dependencies`
   of `boundary.md`. A page writes them as `Call:` bullets in `actions.md`.
   - `calls <project>/<flow>`: read that flow.
   - `publishes <external>`: find each flow with `consumes` for the same external system.
     Read only the flows that take the event of the question. The `## Input` of their
     `boundary.md` names the events.
   - `writes <external>`: find each flow with `reads` for the same external system. Read
     them only when the question is about that record.
   - `**Relates to:**` and `**Inherits:**` in `business-rules.md`: read those flows and pages
     when the question needs them.
   - A page that calls the flow: search the `actions.md` files for `` `<project>/<flow>` ``.
3. Stop when a flow has no more links, or when the next flow does not help to answer the
   question.
4. Keep a list of each flow and page that you read, in the order of the chain.
