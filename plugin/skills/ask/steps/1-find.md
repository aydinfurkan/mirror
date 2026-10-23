# Find the flows and pages

1. Read `.mirror/xsrc/config.json`. It lists the projects and the external systems.
2. Read the `definition.md` of each project. Then read the `definition.md` of each flow and
   page. They are short: the frontmatter and one sentence.
3. Find the flows and pages that the question is about. Match the words of the question to:
   - the sentence of each `definition.md`;
   - the `entry` and the `group` in the frontmatter;
   - the name of the flow or page folder.
4. When no flow or page matches, read `## Goal` in each `business-rules.md`. When still none
   matches, the mirror does not answer the question. Tell the user in one line, then go to
   `3-check-code.md`.
5. When the question can mean more than one flow or page, ask the user. Ask one question.
