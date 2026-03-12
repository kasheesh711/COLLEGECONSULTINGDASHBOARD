# Agent 3: Student 360 Workspace

Branch: `codex/student-360`

## Goal

Refine the student workspace into a read-first, single-scroll, student-centered strategy surface that matches the internal-first pilot PRD.

## Dependencies

- Starts in Wave 2 after Agent 1 stabilizes create-flow and shared form contracts.
- Can overlap with Agent 2 once ownership boundaries are clear.

## In scope

- `app/students/[id]/page.tsx`
- `app/students/new/page.tsx` only for follow-up UI polish if needed
- student-specific presentational components
- student-related tests

## Out of scope

- Shared auth or session logic
- Family cockpit
- Analytics
- Portal

## Constraints

- Do not rename shared server action names.
- Do not change validation inputs without Agent 1 or coordinator approval.
- Keep shared family context visible but secondary.

## Acceptance checklist

- Student page remains single-scroll and student-centered.
- Current posture appears before editing controls.
- Testing, academics, profile, activities, competitions, targets, tasks, decisions, notes, and artifacts feel coherent and read-first.
- Shared family context stays available but does not overwhelm the student view.

## Required tests

- targeted student-related tests
- `npm run build`

## Handoff checklist

- List any route-local components added.
- Confirm whether any shared server action assumptions changed.
- Call out any follow-up dependency on Agent 1 or Agent 2 outputs.

## Copy-paste assignment

Implement the student 360 lane on branch `codex/student-360`.

Read first:

- `docs/PRD.md`
- `docs/screens.md`
- `docs/workflows.md`
- `docs/parallel-agent-delivery/shared-contracts.md`

Your scope is `/students/[id]` and any student-specific presentation helpers needed to make it read-first and student-centered. You may touch `/students/new` only for UI polish after the create-flow contract is stable.

Do not change:

- shared auth/session behavior
- shared action names
- validation inputs
- family cockpit
- analytics
- portal

Required checks:

- targeted student-related tests
- `npm run build`
