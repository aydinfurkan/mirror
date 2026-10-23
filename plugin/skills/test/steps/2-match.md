# Match the tests

1. For each project in the scope, find its tests. Look under the `root` of the project in
   `config.json`. Read `## Stack` of the project `definition.md` to find the test framework.
2. Find each tag in the test files. A tag is a comment line that starts with `mirror: `.
3. Put each rule in one group:
   - **Covered**: a test has the tag of the rule, and the test name agrees with the rule text.
   - **Moved**: no tag matches, but a test with a tag of the same flow or page says this
     rule in its name. The rule number changed. Fix the tag of that test.
   - **Untagged**: a test without a tag checks this rule. Add the tag to that test.
   - **Without a test**: no test checks this rule.
4. Find each tag that points to no rule: a removed flow, a removed page, or a number that is
   too large. Put it in the group **Stale tag**. Do not delete the test.
5. Do not run the tests in this step. Do not change a test, except to add or fix a tag.
