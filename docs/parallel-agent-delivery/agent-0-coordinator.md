# Agent 0: Coordinator / Integrator

Branch: optional integration branch such as `codex/internal-pilot-integration`

## Goal

Coordinate the internal-first pilot work across parallel branches without allowing shared contract drift or avoidable merge conflicts.

## In scope

- breaking work into assignment briefs
- freezing shared contracts before implementation begins
- confirming declared file ownership before each lane starts
- sequencing merges in dependency order
- rebasing downstream lanes when shared interfaces change
- enforcing `docs/PRD.md` and related product docs as source of truth

## Out of scope

- taking over implementation work that belongs inside a lane unless reassignment is required
- allowing agents to invent new product scope outside the PRD reset

## Required actions before coding starts

- review `docs/parallel-agent-delivery/shared-contracts.md`
- confirm which agents, if any, expect to touch:
  - `app/families/actions.ts`
  - `lib/db/queries.ts`
  - `lib/db/mutations.ts`
  - `lib/auth/session.ts`
  - `lib/validation/schema.ts`
  - `lib/domain/dashboard.ts`
- freeze auth, query, mutation, and validation signatures for Wave 1

## Merge order

1. Agent 1
2. Agent 4
3. Agent 2
4. Agent 3
5. Agent 5

## Required integration checks

- after every merge into the integration branch:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - `npm run build`

## Manual acceptance sweep

- live-mode family creation
- live-mode add student
- dashboard triage readability
- family cockpit read-first behavior
- student 360 read-first behavior
- portal parent-safe rendering
- analytics school drill-down

## Copy-paste assignment

Act as the coordinator for the internal-first pilot parallel delivery plan.

Read first:

- `docs/PRD.md`
- `docs/screens.md`
- `docs/workflows.md`
- `docs/parallel-agent-delivery/README.md`
- `docs/parallel-agent-delivery/shared-contracts.md`

Before any implementation agent starts, freeze shared interfaces and confirm declared ownership of every chokepoint file. Merge in dependency order, not arrival order, and force rebases whenever Agent 1 changes shared auth, action, mutation, or validation contracts.
