# Understand

1. Read `.mirror/xsrc/config.json` and the `definition.md` of each project.
2. Ask the user about the parts of the change that are not clear. Ask one question at a time.
3. List the flows or pages that the change adds, changes or removes.
4. For each flow or page in the list, find the affected flows:
   - each flow with a link to it or to its project;
   - for each external system that it `publishes` to or `writes`, each flow that `consumes` or
     `reads` that external system.
   Show them to the user as "Affected".
