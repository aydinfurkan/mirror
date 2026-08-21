---
id: ADR-0002
type: technical
title: Store bubbles in memory behind a repository port
status: accepted
date: 2026-08-21
driven_by: [BR-0001, BR-0004]
applies_to: [code/src/infra/**, code/src/domain/bubble.port.ts]
supersedes: []
---
## Context

The bubble tracker exists to prove that a business rule reaches code and reaches the canvas.
A database would slow the tests and add a service to every environment.

## Decision

Define a `BubbleRepository` port in the domain. Implement the port with a `Map` held in
process memory. Run the container with no database service.

## Consequences

- The tests run fast and need no fixtures.
- The service restarts empty. The test application keeps no data.
- A real store can replace the implementation later, because the domain depends on the port.

## Alternatives considered

- **PostgreSQL through Docker Compose.** This adds a real store, migrations, and a slow test
  suite, and it proves nothing about the prompt-to-code link.
- **A file-backed store.** This adds serialization code and gives no benefit over memory.
