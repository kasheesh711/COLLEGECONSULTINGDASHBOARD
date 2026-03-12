# Screens

## Route map

### Launch-critical internal routes

- `/dashboard`: student-first internal command center
- `/families`: internal household roster
- `/families/new`: create family + first student
- `/families/[id]`: family cockpit
- `/students/new`: add student to an existing family
- `/students/[id]`: student 360 portfolio
- `/analytics`: internal Collegebase admissions analytics
- `/analytics/applicants/[sourceId]`: extracted applicant drill-down

### Supporting internal route

- `/colleges`: internal College Scorecard explorer, available but not launch-gating

### Soft-launch route

- `/portal`: parent-safe family dashboard grouped by student for invited, linked pilot households

### Supporting routes

- `/`: product landing and workspace status
- `/sign-in`: magic-link entry point and mode guidance

## Launch framing

- Internal operations are the primary launch track.
- Dashboard, families, family cockpit, student 360, create flows, and analytics define day-1 readiness.
- Parent portal is a soft-launch module and should not block internal pilot launch beyond basic visibility and linkage readiness.
- College research remains useful, but it is not a launch gate.

## `/dashboard`

Audience:

- strategist
- ops

Launch role:

- primary internal triage surface

Sections:

- short hero strip with mode, scope, and workload posture
- four KPI cards: active students, urgent students, overdue items, parent-visible due soon
- dominant priority student queue
- adjacent deadline map
- school-fit guidance rail

Behavior:

- default ordering prioritizes red students, then overdue work, then nearest due date
- design stays editorial and premium, not generic SaaS
- CTA band includes both `New family` and `Add student`
- the page should feel read-first and urgency-ranked, not like a form collection

## `/families`

Audience:

- strategist
- ops

Launch role:

- primary household roster for live pilot operations

Controls:

- search by family label, parent contact, or student name
- filter by strategist
- filter by pathway
- filter by status
- filter by deadline window

Roster fields:

- family label
- parent contact
- strategist and ops owners
- student count
- student names
- active statuses across students
- next critical due date
- biggest current risk
- pending decisions
- overdue count
- last updated

Behavior:

- remains family-first
- desktop layout should optimize for scanning and comparison, not narrative browsing
- each row offers `Open family workspace` and `Add student`

## `/families/new`

Audience:

- strategist
- ops

Launch role:

- launch-critical live create flow

Layout:

- split household section and first-student section

Required household fields:

- family label
- parent contact name
- parent email

Required first-student fields:

- student name
- grade level
- pathway
- tier
- current phase
- overall status
- status reason

Optional first-student fields:

- current/projected SAT
- current/projected ACT
- testing strategy note

Behavior:

- creates both records in one flow
- redirects to the new family workspace
- must work in live Supabase mode for pilot launch

## `/families/[id]`

Audience:

- strategist
- ops

Launch role:

- launch-critical family cockpit

Layout:

- read-first family cockpit
- household header
- student roster as the dominant module
- family-wide coordination modules below

Sections:

- family overview
- student roster
- college strategy metadata and current list context
- pending family-input items
- latest family coordination notes
- family-wide resources

Behavior:

- no tab-heavy admin shell
- student cards link directly to `/students/[id]`
- family-wide composers stay secondary or on-demand
- college workbench remains internal-only and useful for US-college planning, but it is not a launch gate
- the page should align with the read-first cockpit direction in `docs/internal-ops-ux-handoff.md`

## `/students/new`

Audience:

- strategist
- ops

Launch role:

- launch-critical live add-student flow

Behavior:

- if no family is preselected, first show a family chooser
- if a family is preselected, show the full student create form
- redirect to the new student portfolio on success
- must preserve correct family ownership and access scope

## `/students/[id]`

Audience:

- strategist
- ops

Launch role:

- primary strategy workspace for live student operations

Layout:

- left identity rail
- top metric cards
- modular strategy cards in the main workspace

Sections:

- narrative summary
- testing profile and school-fit workbench
- academic and tutoring status
- profile and project progress
- activities and leadership
- competitions and awards
- school target list
- tasks and deadlines
- decisions
- notes
- artifacts
- prior summaries
- shared family context

Behavior:

- student-scoped records should be the default operating mode
- the page remains single-scroll and read-first
- composers should feel secondary to current posture and history

## `/analytics`

Audience:

- strategist
- ops

Launch role:

- required internal reference tool, not operational source of truth

Layout:

- editorial analytics hero
- sticky filter rail for school, intended major, GPA, SAT, and ACT
- accepted versus rejected summary band
- school landscape roster
- school-specific scatter plot and applicant drill-down roster when a university is selected

Behavior:

- internal-only and file-backed from the local normalized Collegebase export
- URL query params are the source of truth for the search state
- averages use applicant-level SAT, ACT, and unweighted GPA
- waitlists do not count toward accepted versus rejected comparisons
- applicant drill-down opens a dedicated extracted-profile page because the source data has no student names
- launch readiness requires a maintained local dataset and a refresh/verification process

## `/colleges`

Audience:

- strategist
- ops

Launch role:

- supporting internal module, not launch-critical

Layout:

- warm editorial header
- sticky research filter rail
- selected-school featured preview above a compact result roster
- optional family context strip when opened with `?family=<slug>`

Behavior:

- scopes to bachelor’s-dominant institutions
- uses live College Scorecard data on the server when configured
- major/program search uses a controlled CIP-4 picker
- URL query params are the source of truth for search state
- `selected=<scorecardSchoolId>` swaps the featured preview without leaving the page
- when a current family list exists, the selected preview can be added directly to that list
- deeper list-building refinement is not required for day-1 launch

## `/portal`

Audience:

- invited parent users linked to a pilot household

Launch role:

- soft-launch route only

Layout:

- calm summary-first household view
- student-grouped modules
- shared household context below the student sections when parent-visible

Behavior:

- parent-safe records only
- read-only
- not available to broad family rollout at day 1
- monthly summaries, visible tasks, visible decisions, and visible resources should remain grouped by student
- should feel calmer and less operational than internal surfaces
