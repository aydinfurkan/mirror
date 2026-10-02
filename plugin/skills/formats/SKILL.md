---
name: formats
description: The rule and the example for each Mirror document. Use before you write or change a file under .mirror/xsrc/.
---

# Mirror formats

Each path in this skill is relative to the base directory of this skill.

Read the rule and the example of a document before you write or change it. Read only the files
for the documents that you write. A flow belongs to a `backend`, `worker` or `consumer` project.
A page belongs to a `frontend` or `expo` project.

Write each file under `.mirror/xsrc/` in ASD-STE100 Simplified Technical English. Write one
instruction or one fact per sentence, in the active voice. This rule applies only to these
files, not to the code or the other files of the repository.

| Document                                  | Rule                        | Example                                                                  |
| ----------------------------------------- | --------------------------- | ------------------------------------------------------------------------ |
| `xsrc/<project>/definition.md`            | `project/definition.md`     | `project/examples/definition.md`                                         |
| `xsrc/<project>/<flow>/definition.md`     | `flow/definition.md`        | `flow/examples/definition.md`                                            |
| `xsrc/<project>/<flow>/steps.md`          | `flow/steps.md`             | `flow/examples/steps.md`                                                 |
| `xsrc/<project>/<flow>/boundary.md`       | `flow/boundary.md`          | `flow/examples/boundary-rest.md`, `flow/examples/boundary-consumer.md`   |
| `xsrc/<project>/<flow>/business-rules.md` | `flow/business-rules.md`    | `flow/examples/business-rules.md`                                        |
| `xsrc/<project>/<page>/definition.md`     | `page/definition.md`        | `page/examples/definition.md`                                            |
| `xsrc/<project>/<page>/actions.md`        | `page/actions.md`           | `page/examples/actions.md`                                               |
| `xsrc/<project>/<page>/design.md`         | `page/design.md`            | `page/examples/design.md`                                                |
| `xsrc/<project>/<page>/business-rules.md` | `page/business-rules.md`    | `page/examples/business-rules.md`                                        |

In a rule file, a path to an example is relative to the folder of that rule file.
