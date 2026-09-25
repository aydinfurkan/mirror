import { createServer } from './api/server.js';
import { createMemoryPostRepository } from './infra/post.repo.memory.js';
import { createSystemDeps } from './infra/system.deps.js';

export function main(): void {
  const port = Number(process.env.PORT ?? 3000);
  const app = createServer(createSystemDeps(createMemoryPostRepository()));
  app.listen(port, () => {
    console.log(`Posts API listens on port ${port}.`);
  });
}

main();
