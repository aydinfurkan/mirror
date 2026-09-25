import { createServer } from './api/server.js';
import { createMemoryBubbleRepository } from './infra/bubble.repo.memory.js';
import { createSystemDeps } from './infra/system.deps.js';

export function main(): void {
  const port = Number(process.env.PORT ?? 3000);
  const deps = createSystemDeps(createMemoryBubbleRepository());
  const app = createServer(deps);
  app.listen(port, () => {
    console.log(`Mirror API listens on port ${port}.`);
  });
}

main();
