# Agent 5: Portal Soft Launch

Branch: `codex/portal-soft-launch`

## Goal

Make the parent portal safe and credible for invited pilot households without expanding it into a broad launch surface.

## Dependencies

- Starts in Wave 2 after Agent 1 locks parent linkage and visibility rules.
- Should rebase after Agent 1 merges if auth or portal-access behavior changed.

## In scope

- `app/portal/page.tsx`
- `tests/visibility.test.ts`
- `tests/internal-access.test.ts` if portal access behavior changes
- `lib/db/queries.ts` only for coordinated parent snapshot wiring
- `lib/auth/session.ts` only if Agent 1 or the coordinator explicitly hands it off

## Out of scope

- Broad parent activation rollout
- Internal cockpit work
- Analytics
- College explorer

## Constraints

- Preserve invited-household soft-launch framing.
- Only parent-visible records may render.
- Do not expand parent capabilities beyond read-only pilot use.

## Acceptance checklist

- Parent-linked users only see their own family.
- Only parent-visible summaries, tasks, decisions, and resources render.
- Multi-student grouping remains intact.
- Portal tone and framing are calmer than internal surfaces.

## Required tests

- `npm run test -- tests/visibility.test.ts tests/internal-access.test.ts`

## Handoff checklist

- State whether `lib/auth/session.ts` or `lib/db/queries.ts` was touched.
- Confirm no internal-only data is exposed in the final portal shape.
- List any soft-launch assumptions that remain.

## Copy-paste assignment

Implement the portal soft-launch lane on branch `codex/portal-soft-launch`.

Read first:

- `docs/PRD.md`
- `docs/screens.md`
- `docs/workflows.md`
- `docs/parallel-agent-delivery/shared-contracts.md`

Your scope is `/portal`, portal visibility tests, and any coordinated parent snapshot wiring needed for invited pilot households. Keep the portal read-only, parent-safe, multi-student aware, and explicitly soft-launch only.

Do not change:

- broad parent activation flows
- internal cockpit surfaces
- analytics
- college explorer

Only touch these shared files if explicitly coordinated:

- `lib/auth/session.ts`
- `lib/db/queries.ts`

Required checks:

- `npm run test -- tests/visibility.test.ts tests/internal-access.test.ts`
