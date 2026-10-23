# Report

1. Show the report as a table. One row per flow or page in the scope:

   | Flow or page | Rules | Covered | Without a test | Failing |
   | --- | --- | --- | --- | --- |
   | `api/cancel-order` | 11 | 10 | 1 | 1 |

   A rule with a failing test counts in "Covered" too.

2. Under the table, list each rule without a test. Show its id and its text:

   ```text
   api/cancel-order C3: Put the items back in the stock only after the order is cancelled.
   ```

3. List each failing rule with its id, its text and the error. For each one, tell the user
   that the code does not do what the mirror says. Tell the user to fix the code or the
   mirror with the `mirror:change` skill.
4. List each stale tag with its file and line.
5. List the tags that you added or fixed in step 2, and the test files that you wrote in
   step 3.

Example: `examples/report.md`.
