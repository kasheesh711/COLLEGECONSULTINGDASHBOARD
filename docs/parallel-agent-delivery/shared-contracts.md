# Shared Contracts And File Ownership

This document is the coordinator freeze point before parallel implementation starts.

## Contract freeze

These contracts should not be renamed or reshaped without coordinator approval:

- `InternalAccess` in `lib/auth/session.ts`
- `PortalAccess` in `lib/auth/session.ts`
- active-role resolution behavior in `lib/auth/roles.ts` and `lib/auth/session.ts`
- parent linkage behavior through `family_contacts.user_id`
- query signatures consumed by route pages
- mutation and server action signatures used by forms
- validation schema inputs for:
  - family creation
  - student creation
  - portal visibility behavior
  - analytics filters

## Chokepoint ownership

### Agent 1 owns by default

- `app/families/actions.ts`
- `lib/auth/session.ts`
- `lib/auth/roles.ts`
- `lib/db/mutations.ts`
- `lib/validation/schema.ts`

### Shared, coordinator approval required before editing

- `lib/db/queries.ts`
- `lib/domain/dashboard.ts`

### Route-owned unless escalated

- `app/dashboard/page.tsx`
- `app/families/page.tsx`
- `app/families/[id]/page.tsx`
- `app/students/[id]/page.tsx`
- `app/analytics/page.tsx`
- `app/analytics/applicants/[sourceId]/page.tsx`
- `app/portal/page.tsx`

## Escalation rules

- If an agent needs to change a shared contract, stop and notify the coordinator before implementing.
- If two agents need the same chokepoint file, the coordinator reassigns ownership instead of letting both proceed.
- Agent 2 and Agent 3 should avoid data-layer reshaping unless the coordinator explicitly approves it.
- Agent 5 should not edit `lib/auth/session.ts` unless Agent 1 has finished or handed it off.

## Allowed overlaps

- Agent 2 may add new presentational components under `components/shared/` if they do not force auth, mutation, or data contract changes.
- Agent 3 may add student-specific presentational components and route-local layout helpers.
- Agent 4 may change analytics domain and reporting files freely as long as internal-only behavior is preserved.

## Merge safety rules

- Merge Agent 1 first if it changes any shared signatures.
- Rebase Agent 3 and Agent 5 after Agent 1 merges.
- Re-run the full integration test gate after every merge into the integration branch:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - `npm run build`
