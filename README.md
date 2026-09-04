# Mirror

Every code file has a mirror prompt. The graph links them, and drift tells you when they disagree.

- `code/` holds the implementation.
- `.mirror/docs/` holds the intent.
- `.mirror/visualize/` builds the graph and draws it.

```sh
pnpm -C .mirror/visualize check:drift   # fail if intent and code disagree
pnpm -C .mirror/visualize dev           # open the canvas
```

See [.mirror/STRUCTURE.md](.mirror/STRUCTURE.md).
