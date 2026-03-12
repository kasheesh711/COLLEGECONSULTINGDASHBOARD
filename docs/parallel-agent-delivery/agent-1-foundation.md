# Agent 1: Foundation / Live Access / Create Flows

Branch: `codex/internal-pilot-foundation`

## Goal

Stabilize live auth, role-aware access, family/student create flows, and shared write-path behavior for the internal-first pilot.

## Dependencies

- Starts first.
- Other agents treat this lane as the source of truth for auth, actions, and validation contracts.

## In scope

- `app/sign-in/*`
- `app/auth/callback/route.ts`
- `app/families/new/page.tsx`
- `app/students/new/page.tsx`
- `app/families/actions.ts`
- `lib/auth/*`
- `lib/db/mutations.ts`
- `lib/validation/schema.ts`

## Out of scope

- Dashboard visual redesign
- Families and family cockpit UX redesign
- Student 360 layout redesign
- Analytics
- Portal presentation polish

## Acceptance checklist

- Live strategist and ops sign-in resolves to the correct role set and active role behavior.
- Family plus first student creation works in live mode.
- Add-student flow works in live mode and preserves family ownership.
- Demo mode remains usable for development but is not treated as launch-ready.
- Write-path validation remains consistent with the PRD reset.

## Required tests

- `npm run test -- tests/internal-access.test.ts tests/validation.test.ts tests/live-family-query-fallback.test.ts`
- add or update any create-flow tests needed for live-mode behavior

## Handoff checklist

- List every shared contract changed.
- Call out every touched chokepoint file.
- State whether Agent 3 or Agent 5 must rebase because of changed signatures.

## Copy-paste assignment

Implement the internal-first pilot foundation lane on branch `codex/internal-pilot-foundation`.

Read first:

- `docs/PRD.md`
- `docs/screens.md`
- `docs/workflows.md`
- `docs/parallel-agent-delivery/shared-contracts.md`

Your scope is live auth, role linkage, family/student create flows, shared server actions, write-path safety, and demo-vs-live launch readiness. Do not redesign dashboard, family cockpit, student 360, analytics, or portal presentation.

Before coding, confirm which of these shared files you expect to touch:

- `app/families/actions.ts`
- `lib/auth/session.ts`
- `lib/db/mutations.ts`
- `lib/validation/schema.ts`

Required checks:

- `npm run test -- tests/internal-access.test.ts tests/validation.test.ts tests/live-family-query-fallback.test.ts`
