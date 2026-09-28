// Print the Mirror rules into the session when this project has a mirror.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

try {
  const dir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  process.stdout.write(readFileSync(join(dir, '.mirror', 'AGENTS.md'), 'utf8'));
} catch {
  // No mirror here: print nothing.
}
