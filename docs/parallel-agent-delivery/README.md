# Parallel Agent Delivery

This folder turns the internal-first pilot reset into ready-to-assign work lanes.

## Staffing model

The lane breakdown below is the full split:

- 1 coordinator
- 5 implementation agents

That is 6 total lanes. If you only want 5 total agents, combine Agent 2 and Agent 3 into one product-surface lane and keep the rest unchanged.

## Source of truth

Before assigning any work, each agent should read:

- `docs/PRD.md`
- `docs/screens.md`
- `docs/workflows.md`
- `docs/internal-ops-ux-handoff.md`

The delivery docs in this folder do not replace the product docs. They translate them into parallel execution.

## Shared chokepoints

The main merge-conflict files are:

- `app/families/actions.ts`
- `lib/db/queries.ts`
- `lib/db/mutations.ts`
- `lib/auth/session.ts`
- `lib/validation/schema.ts`
- `lib/domain/dashboard.ts`

Use `shared-contracts.md` before any agent starts editing.

## Wave plan

### Wave 1

- Agent 1: Foundation / Live Access / Create Flows
- Agent 2: Internal Ops Surfaces
- Agent 4: Analytics Hardening

### Wave 2

Start only after Agent 1 stabilizes shared auth, write-path, and validation contracts.

- Agent 3: Student 360 Workspace
- Agent 5: Portal Soft Launch

## Branch plan

Implementation branches:

- `codex/internal-pilot-foundation`
- `codex/internal-ops-surfaces`
- `codex/student-360`
- `codex/analytics-hardening`
- `codex/portal-soft-launch`

Coordinator branch:

- optional integration branch such as `codex/internal-pilot-integration`

## Merge order

1. Agent 1
2. Agent 4
3. Agent 2
4. Agent 3
5. Agent 5

## Assignment checklist

Every agent assignment should include:

- branch name
- goal
- in-scope files
- out-of-scope files
- acceptance checklist
- required tests
- dependency notes

Every agent must declare which shared chokepoint files they expect to touch before starting.

## Files in this folder

- `shared-contracts.md`: chokepoint ownership and escalation rules
- `agent-0-coordinator.md`
- `agent-1-foundation.md`
- `agent-2-internal-ops.md`
- `agent-3-student-360.md`
- `agent-4-analytics.md`
- `agent-5-portal.md`
