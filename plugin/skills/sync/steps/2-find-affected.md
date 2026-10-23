# Find the affected flows and pages

1. Read `.mirror/xsrc/config.json` and the `definition.md` of each project.
2. Put each changed file in a project. Use the project with the longest `root` that contains
   the file. Put a file outside each `root` under "Other". Do not compare these files. List
   them in the report.
3. Skip the test, mock and fixture files. Skip the style-only files. List them in the report.
4. For each project with changed files, read the `definition.md` and the `steps.md` or
   `actions.md` of each flow or page. Find the flows and pages that each changed file is part
   of:
   - the file has the entry point of the flow or the page;
   - the code of the entry point calls into the file;
   - a step, an action or a boundary of the flow or the page names a thing in the file.
5. Find the entry points that the diff adds or removes. Use the "Where to look" table in
   `steps/3-find-entry-points.md` of the `mirror:init` skill.
   - An entry point with no flow or page: mark it "Missing".
   - A flow or a page whose entry point is gone: mark it "Gone".
6. For each flow or page in the list, add the affected flows. Use step 4 of
   `steps/1-understand.md` of the `mirror:change` skill.
