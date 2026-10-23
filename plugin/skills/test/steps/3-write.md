# Write the tests

1. If no rule is in the group "Without a test", go to `4-report.md`.
2. Show the user the number of rules without a test, for each flow or page. Ask if you can
   write the tests. If the user says no, go to `4-report.md`.
3. If the superpowers skills are installed, ask the user if you can use them. If the user
   says yes, use `test-driven-development` for steps 4 and 5.
4. For each rule without a test, write one test.
   - Use the test framework and the style of the tests of the project.
   - Put the test next to the other tests of the same flow or page. If there are none, follow
     the place of the other tests of the project.
   - Add the tag of the rule. See "Tags" in `SKILL.md`.
   - Use the `Example` blocks of `boundary.md` as the input and the expected output.
   - Test what the rule says, not how the code does it.
5. Run the new tests and each test with a tag of the scope.
   - A test fails: the code does not do what the mirror says. Do not change the code or the
     mirror. Keep the test. Note the rule and the error for the report.
   - A test cannot run, for example it has a wrong import: fix the test. Run it again.
6. Do not change the code or the files under `.mirror/xsrc/`.

Example: `examples/cancel-order.test.ts`.
