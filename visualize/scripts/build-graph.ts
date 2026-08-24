import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildGraph } from './lib/diff.js';
import { parseCode } from './lib/parse-code.js';
import { parsePrompts } from './lib/parse-prompts.js';
import { readIgnoreGlobs } from './lib/paths.js';

interface Options {
  repo: string;
  out: string;
  check: boolean;
}

/** Read the value that follows a flag. Refuse a flag that has no value. */
function requireValue(argv: string[], index: number, flag: string): string {
  const value = argv[index];
  if (value === undefined || value.startsWith('--')) {
    throw new Error(`The flag ${flag} needs a path.`);
  }
  return value;
}

function parseArgs(argv: string[], defaults: Options): Options {
  const options = { ...defaults };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--check') options.check = true;
    else if (argv[i] === '--repo') options.repo = path.resolve(requireValue(argv, ++i, '--repo'));
    else if (argv[i] === '--out') options.out = path.resolve(requireValue(argv, ++i, '--out'));
  }
  return options;
}

async function run(): Promise<void> {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(here, '..', '..');
  const options = parseArgs(process.argv.slice(2), {
    repo: repoRoot,
    out: path.join(repoRoot, 'visualize', 'src', 'generated', 'graph.json'),
    check: false,
  });

  const promptsDir = path.join(options.repo, 'prompts');
  const srcDir = path.join(options.repo, 'code', 'src');

  const prompts = await parsePrompts(promptsDir);
  const code = await parseCode(srcDir, await readIgnoreGlobs(promptsDir));
  const graph = buildGraph(prompts, code);

  await mkdir(path.dirname(options.out), { recursive: true });
  await writeFile(options.out, `${JSON.stringify(graph, null, 2)}\n`, 'utf8');

  const total = Object.values(graph.driftSummary).reduce((sum, n) => sum + n, 0);
  console.log(
    `Wrote ${path.relative(options.repo, options.out)}: ` +
      `${graph.nodes.length} nodes, ${graph.edges.length} edges, ${total} drift.`,
  );

  if (total > 0) {
    for (const node of graph.nodes) {
      for (const d of node.drift) console.log(`  ${d.kind}  ${d.id}  ${d.message}`);
    }
    for (const edge of graph.edges) {
      for (const d of edge.drift) console.log(`  ${d.kind}  ${d.id}  ${d.message}`);
    }
  }

  if (options.check && total > 0) {
    console.error(`check:drift failed. Fix ${total} drift item(s).`);
    process.exitCode = 1;
  }
}

await run();
