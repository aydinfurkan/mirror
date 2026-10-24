# Report

1. Tell the user the number of projects, flows and pages. From now on, each change goes
   through the `mirror:change` skill: mirror first, then review, then code.
2. If the repository is on GitHub and has no `.github/workflows/mirror.yml`, ask the user one
   question: "Add the Mirror workflow, so that each pull request links its review page?"
   - Yes: use the `mirror:github` skill.
   - No: stop. Tell the user that `mirror:github` adds it later.
