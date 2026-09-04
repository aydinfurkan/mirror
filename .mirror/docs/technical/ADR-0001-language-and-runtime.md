---
id: ADR-0001
type: technical
title: Use TypeScript on Node for the application and the tooling
status: accepted
date: 2026-08-21
driven_by: [BR-0001]
applies_to: [code/src/**, visualize/**]
supersedes: []
---
## Context

Mirror contains an API, a graph builder, and a React canvas. The graph builder must
read the source of the API. It must find the exported functions. It must find the call
sites.

## Decision

Write the API, the graph builder, and the canvas in TypeScript on Node 20 or later. Tie the
three parts together with npm workspaces. Run the tests with vitest.

## Consequences

- One toolchain covers every part of the repository.
- The graph builder uses `ts-morph`. `ts-morph` understands the same source that it parses.
- The code parser supports TypeScript only. A second source language needs a new parser.

## Alternatives considered

- **Python for the API.** The graph builder would need a second parser and a second test
  runner. Two toolchains add cost. They give no benefit here.
- **Go for the API.** Go packages map cleanly onto folders. The canvas stays
  TypeScript. The repository then needs two toolchains.
