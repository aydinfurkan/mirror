#!/bin/sh
# Load the Mirror instructions, only in a repo with a .mirror/ folder.
# The hook runs in the user's project directory.
[ -d .mirror ] || exit 0
cat "${CLAUDE_PLUGIN_ROOT}/AGENTS.md"
