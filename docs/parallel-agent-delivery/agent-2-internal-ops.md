# Agent 2: Internal Ops Surfaces

Branch: `codex/internal-ops-surfaces`

## Goal

Make the internal launch-critical surfaces read-first, triage-first, and aligned with the PRD reset and internal ops UX handoff.

## Dependencies

- Can start in Wave 1.
- Avoid shared data contract changes unless approved by the coordinator.

## In scope

- `app/dashboard/page.tsx`
- `app/families/page.tsx`
- `app/families/[id]/page.tsx`
- `components/shared/*`
- internal-only supporting presentation components

## Out of scope

- Auth or session contract changes
- Shared mutation behavior
- Student 360
- Portal
- Analytics domain logic

## Constraints

- Prefer not to edit `lib/db/queries.ts`.
- Prefer not to edit `lib/domain/dashboard.ts`.
- If new data shape is required, escalate to the coordinator instead of reshaping contracts locally.

## Acceptance checklist

- Dashboard feels triage-first with stronger urgency hierarchy.
- Families page becomes scan-first rather than narrative-heavy.
- Family cockpit becomes read-first with secondary or on-demand composers.
- UI matches the internal-first pilot PRD and `docs/internal-ops-ux-handoff.md`.

## Required tests

- targeted route or component tests for the changed UI
- `npm run build`

## Handoff checklist

- List any new shared components added.
- Call out any requested data-shape changes that were deferred or escalated.
- Confirm no shared auth, mutation, or validation contracts were changed without approval.

## Copy-paste assignment

Implement the internal ops surface lane on branch `codex/internal-ops-surfaces`.

Read first:

- `docs/PRD.md`
- `docs/screens.md`
- `docs/workflows.md`
- `docs/internal-ops-ux-handoff.md`
- `docs/parallel-agent-delivery/shared-contracts.md`

Your scope is `/dashboard`, `/families`, `/families/[id]`, and shared presentation components used by those surfaces. Keep the pages read-first, scan-first, and triage-first. Do not change auth contracts, mutations, analytics, portal behavior, or student 360.

Avoid these shared chokepoints unless approved:

- `lib/db/queries.ts`
- `lib/domain/dashboard.ts`

Required checks:

- targeted UI tests
- `npm run build`
