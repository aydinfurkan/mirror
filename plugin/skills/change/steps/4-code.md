# Code

1. For each added or changed flow, write tests for its acceptance criteria. For a fix with no
   mirror change, write a test that shows the bug. Run the new tests. Make sure that they fail.
2. Write the code for the steps and the actions.
3. Remove the code and the tests of each removed flow.
4. Run the full test suite of each changed project and of each project with an affected flow.
   Make sure that all tests pass.
5. If the mirror changed, build `.mirror/visualize.html` with the `mirror:build` skill.
6. Report the changed documents, the changed code files, and the test result.
