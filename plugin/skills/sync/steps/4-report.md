# Report

1. Show one table per project with these columns: flow or page, class, a short reason, and
   the code file.
2. Show "Drift" items first. For each one, quote the rule and show the code that breaks it.
3. Show the proposed edits of the "Stale", "Missing" and "Gone" items.
4. List the skipped files and the files under "Other".
5. Ask the user to select one option for each item:
   - "Stale", "Missing" or "Gone": Apply or Skip.
   - "Drift" or "Unsure":
     - Fix the code: the rule stays. Change the code later with the `mirror:change` skill.
     - Change the rule: the code shows the new intent. Edit `business-rules.md`.
     - Skip.
6. Stop and wait for the answer.
