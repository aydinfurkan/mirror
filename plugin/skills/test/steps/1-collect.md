# Collect the rules

1. Find the scope. Use the flows or pages that the user names. When the user names a project,
   use each flow and page of the project. When the user names nothing, use all of them.
2. Read `.mirror/xsrc/config.json` and the `definition.md` of each project in the scope.
3. For each flow or page in the scope, read `business-rules.md`. For a flow, read
   `boundary.md` too.
4. Make the list of rules. See "Rule ids" in `SKILL.md`.
   - Add each item of `## Acceptance criteria` and of `## Constraints`.
   - For a flow, add each row of the `## Output` table.
   - Do not add the items of `## Goal`, `## Non-goal` or `## Open questions`.
5. Keep the text of each rule. Keep the `Example` blocks of `boundary.md`. You use them as
   the test data in step 3.
