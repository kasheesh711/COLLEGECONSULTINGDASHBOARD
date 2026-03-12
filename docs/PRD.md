# BeGifted Dashboard PRD: Internal-First Pilot Launch

## Summary

BeGifted is no longer validating whether the app can support the workflow in principle. The product already has the major internal routes, the multi-student family schema, demo/live data access, and the core student and family workspaces.

The launch problem is now focus. The current product covers internal operations, parent portal access, college research, and admissions analytics, but not all of those areas should block pilot launch.

This PRD resets the launch target to an internal-first US-college pilot:

- internal staff must be able to run a live pilot cohort end to end in Supabase for core case management
- parent access remains a controlled soft launch for linked pilot households only
- admissions analytics remains in scope as an internal reference tool
- college research remains available, but is not a day-1 launch gate unless it blocks internal advising for a pilot family

## Launch Goal

Launch succeeds when strategist and ops users can manage a live pilot cohort inside the app without leaving it for core household and student operations.

That means day-1 launch supports:

- internal sign-in and role-aware access
- live family creation
- live student creation inside an existing family
- student-first triage from the dashboard
- family-wide coordination from the family workspace
- student-scoped strategy work from the student 360 page
- parent-safe visibility boundaries across internal and portal surfaces

This launch is explicitly optimized for US-college advising. The schema remains cross-pathway, but non-US-college launch behavior is not a pilot requirement.

## Product Decisions Locked For Launch

- Stack remains Next.js App Router plus Supabase Auth and Postgres.
- `family` remains the household container and `student` remains the operational unit.
- Multi-student households remain required for pilot readiness.
- Demo mode remains a development aid and does not count toward launch readiness.
- Strategist and ops remain the only editors in the pilot.
- Parent portal remains read-only and parent-safe.
- Google Drive remains the artifact source of truth; the app stores links and metadata only.
- Internal surfaces should behave as read-first operational cockpits with on-demand composers, not form-first admin pages.
- No new schema direction is required for this reset. Preserve student-scoped records by default and reserve `student_id = null` for family-wide coordination records.

## Primary Users

### Strategist

- Can view and edit assigned families and students.
- Uses the dashboard, family cockpit, and student 360 pages as the primary operating surfaces.
- Owns roadmap quality, narrative quality, school-list strategy, and decision logging.

### Operations

- Can view and edit all families and students.
- Owns dashboard hygiene, due-date completeness, parent-safe publishing quality, and internal data completeness.

### Parent

- Soft-launch audience only for the pilot.
- Can access one linked family through `family_contacts.user_id`.
- Can view only parent-safe records grouped by student.

## Launch-Critical Modules

### `/dashboard`

Internal launch-critical route for:

- four KPI cards
- priority student queue
- upcoming deadline map
- deterministic testing-to-list guidance

The dashboard is the top-level internal triage surface and should remain student-first.

### `/families`

Internal launch-critical route for:

- household roster management
- filterable, scan-first comparison across active families
- direct entry into family workspaces and add-student flows

### `/families/new`

Internal launch-critical route for creating:

- the family record
- the primary parent contact
- the first student

This flow must work with live Supabase data for the pilot.

### `/students/new`

Internal launch-critical route for:

- attaching a new student to an existing family
- preserving correct household ownership and access boundaries

### `/families/[id]`

Internal launch-critical family cockpit for:

- family-wide coordination
- student roster and routing into student pages
- pending family-input items
- family-wide notes and resources
- family-level college strategy metadata

This page should remain single-scroll, read-first, and operational.

### `/students/[id]`

Internal launch-critical student 360 workspace for:

- monthly summaries
- testing profile
- academics and tutoring
- profile and project progress
- activities and leadership
- competitions and awards
- school targets
- tasks, decisions, notes, and artifact links

This is the core strategy workspace for day-to-day counseling operations.

### `/analytics`

Internal launch-critical reference module for:

- school-level applicant analytics
- accepted versus rejected comparisons
- GPA, SAT, and ACT drill-down
- extracted profile review

This route is required for pilot launch, but it remains read-only and file-backed rather than operational system-of-record data.

## Soft-Launch And Post-Launch Scope

### Soft launch

#### `/portal`

The parent portal remains in product scope, but it is not a blocker for internal pilot launch beyond basic linked-household readiness.

Soft-launch expectations:

- read-only parent experience
- invited and linked pilot households only
- student-grouped summaries, visible tasks, decisions, and resources
- strict exclusion of internal-only records

### Post-launch or non-blocking for day 1

- parent activation polish beyond linked pilot households
- broader portal onboarding and support flows
- college Scorecard list-building depth and counselor override refinement
- making `/colleges` a required step in the operating workflow
- cross-pathway launch behavior outside US college
- replacing external document workflows instead of linking to them

## Supporting But Non-Blocking Module

### `/colleges`

The College Scorecard explorer remains useful and should stay available to internal users, especially when a family context exists.

However, it is not a day-1 launch gate. Launch does not depend on deeper school-list authoring maturity as long as core internal advising operations can run.

## Launch Readiness

The pilot is launch-ready only when all of the following are true:

- strategist and ops users can sign in through live Supabase auth and resolve to linked profile roles
- internal users can create families and students in live mode
- internal users can manage live student and family records without relying on demo fixtures
- strategist role remains scoped to assigned families while ops retains global internal access
- parent-safe visibility boundaries remain intact across internal and portal surfaces
- invited parent accounts can be linked through `family_contacts.user_id` for pilot households
- the analytics dataset used by `/analytics` has a documented refresh and verification process
- the pilot cohort contains 3 to 10 live families, including at least one multi-student family
- the product remains operational even when Google Drive continues to hold the underlying files

## Definition Of Done For Pilot Launch

The internal-first pilot is ready when:

- a live internal user can create a family plus first student and immediately see them on `/families` and `/dashboard`
- a live internal user can add a second student to an existing family and continue student-scoped work safely
- dashboard, family cockpit, and student 360 pages function as usable read-first operational surfaces
- parent-linked users can only access their own household and only parent-visible data
- `/analytics` loads the maintained local dataset and supports school-level drill-down
- build, lint, typecheck, and the existing test suite remain green

## Explicitly Out Of Scope For This Launch Reset

- student login
- tutor or mentor direct editing
- AI recommendations
- CSV import
- billing, messaging, and Google Drive sync
- broad parent rollout
- non-US-college pilot requirements
