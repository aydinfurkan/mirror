---
id: ADR-0003
type: technical
title: Validate request bodies at the route boundary with zod
status: accepted
date: 2026-08-21
driven_by: [BR-0002]
applies_to: [code/src/api/**]
supersedes: []
---
## Context

An HTTP body arrives as unknown JSON. The domain must receive typed input. A business rule
also limits the title, and that rule belongs in the domain, not in the transport layer.

## Decision

Parse the shape of the body at the route boundary with zod. Return HTTP 400 when the shape
is wrong. Keep the title-length rule and the empty-title rule in `domain/bubble.rules.ts`.

## Consequences

- The domain receives typed input and never inspects raw JSON.
- Shape errors and rule errors both return HTTP 400, with different messages.
- A rule change touches the domain only. A payload change touches the schema only.

## Alternatives considered

- **Validate everything in the domain.** The domain would then depend on the transport shape.
- **Trust the client.** A malformed body would crash the handler.
