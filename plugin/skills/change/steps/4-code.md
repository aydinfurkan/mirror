# Code

1. For each added or changed flow, write tests for its acceptance criteria. Run them. Make
   sure that the new tests fail.
2. Write the code for the steps and the actions.
3. Remove the code and the tests of each removed flow.
4. Run the full test suite of each changed project and of each project with an affected flow.
   Make sure that all tests pass.
5. Build `.mirror/visualize.html` with the `mirror:build` skill.
6. Report the changed documents, the changed code files, and the test result.
