---
name: formats
description: The .mirror/ folder, config.json, and the rule and the example for each Mirror document. Use before you write or change a file under .mirror/xsrc/.
---

# Mirror formats

Each path in this skill is relative to the base directory of this skill.

The `.mirror/` folder, `config.json`, and the files of a flow and a page are in `layout.md`.

Read the rule and the example of a document before you write or change it. Read only the files
for the documents that you write.

Write each file under `.mirror/xsrc/` in plain, short sentences. Use the names from the code. Do
not use idioms or filler words. This rule applies only to these files, not to the code or the
other files of the repository.

| Document                                  | Rule                        | Example                                                                  |
| ----------------------------------------- | --------------------------- | ------------------------------------------------------------------------ |
| `xsrc/<project>/definition.md`            | `project/definition.md`     | `examples/project/definition.md`                                         |
| `xsrc/<project>/<flow>/definition.md`     | `flow/definition.md`        | `examples/flow/definition.md`                                            |
| `xsrc/<project>/<flow>/flow.md`           | `flow/flow.md`              | `examples/flow/flow-rest.md`, `examples/flow/flow-consumer.md`           |
| `xsrc/<project>/<flow>/contract.md`       | `flow/contract.md`          | `examples/flow/contract-rest.md`, `examples/flow/contract-consumer.md`   |
| `xsrc/<project>/<flow>/business-rules.md` | `flow/business-rules.md`    | `examples/flow/business-rules.md`                                        |
| `xsrc/<project>/<page>/definition.md`     | `page/definition.md`        | `examples/page/definition.md`                                            |
| `xsrc/<project>/<page>/actions.md`        | `page/actions.md`           | `examples/page/actions.md`                                               |
| `xsrc/<project>/<page>/design.md`         | `page/design.md`            | `examples/page/design.md`                                                |
| `xsrc/<project>/<page>/ui/<view>/design.svg` | `page/design-svg.md`     | `examples/page/design.svg.md`, `examples/page/design-mobile.svg.md`      |
| `xsrc/<project>/<page>/ui/<view>/variations.svg` | `page/variations-svg.md` | `examples/page/variations.svg.md`                                    |
| `xsrc/<project>/<page>/business-rules.md` | `page/business-rules.md`    | `examples/page/business-rules.md`                                        |
