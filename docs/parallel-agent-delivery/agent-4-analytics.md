# Agent 4: Analytics Hardening

Branch: `codex/analytics-hardening`

## Goal

Harden the admissions analytics lane so it is stable, explicit about dataset assumptions, and aligned with the PRD as an internal-only reference tool.

## Dependencies

- Can start in Wave 1.
- Lowest-overlap lane; should remain isolated from operational write paths.

## In scope

- `app/analytics/page.tsx`
- `app/analytics/applicants/[sourceId]/page.tsx`
- `components/analytics/*`
- `lib/domain/collegebase-analytics.ts`
- `lib/reporting/collegebase-analytics.ts`
- `tests/collegebase-*`
- `tests/analytics-components.test.tsx`

## Out of scope

- Operational write flows
- Portal
- College explorer
- Internal ops surface redesign

## Acceptance checklist

- Analytics stays internal-only and read-only.
- School-level filtering and applicant drill-down are stable.
- Dataset assumptions are explicit in code or supporting docs.
- Tests cover filter determinism and school-specific views.

## Required tests

- `npm run test -- tests/collegebase-analytics.test.ts tests/analytics-components.test.tsx tests/collegebase-normalize.test.ts`

## Handoff checklist

- State whether dataset assumptions changed.
- List any new analytics-specific documentation added.
- Confirm no operational write-path or auth behavior was modified.

## Copy-paste assignment

Implement the analytics hardening lane on branch `codex/analytics-hardening`.

Read first:

- `docs/PRD.md`
- `docs/screens.md`
- `docs/workflows.md`
- `docs/parallel-agent-delivery/shared-contracts.md`

Your scope is `/analytics`, applicant drill-down, analytics domain/reporting logic, and analytics tests. Keep analytics internal-only and read-only. Make dataset assumptions explicit and keep filtering deterministic.

Do not change:

- operational write flows
- portal
- college explorer
- auth/session contracts

Required checks:

- `npm run test -- tests/collegebase-analytics.test.ts tests/analytics-components.test.tsx tests/collegebase-normalize.test.ts`
