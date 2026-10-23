# Write the documents

Write the project and each flow or page with the `mirror:formats` skill. It tells which files
to write and how. To find the content, trace the code from the entry point:

- A flow: read the request schemas and validators for the input, and the error mapping for the
  output.
- A page: find the actions from the load effect, the event handlers and the form submits. Read
  the components, the styles and the design links for the design.
- A call to an API: link to the backend flow with the same method and path. When that
  project is not mirrored yet, link to the project id: ``calls `<project>` ``.
- Do not change the files of a project that is not in this run. An older flow can link to a
  project of this run by its id. Keep that link. Tell the user which flow it is, so that the
  link can name the flow later.
- Read the tests to find the constraints and the acceptance criteria. Ask the user for the
  context, the goal and the non-goal when the code does not show them.
