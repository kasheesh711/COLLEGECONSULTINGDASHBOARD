# Workflows

## Launch framing

- Internal operations are the primary launch track.
- Launch readiness is based on live Supabase workflows, not demo mode.
- Parent portal is soft-launch only for linked pilot households.
- `/analytics` remains required as an internal reference tool.
- `/colleges` remains available, but it is not a day-1 launch gate.

## Create family + first student

1. Ops or strategist creates the household record and the first student in one flow.
2. Required household fields: family label, parent contact, parent email.
3. Required student fields: student name, grade level, pathway, tier, current phase, overall status, status reason.
4. Optional testing baseline can be added during creation.

Acceptance:

- Family and first student are both created atomically.
- New household is visible on `/families` immediately.
- New student is visible on `/dashboard` immediately.
- The workflow works in live Supabase mode and does not rely on demo fixtures.

## Add student to an existing family

1. Ops or strategist opens `/students/new` or launches from a family workspace.
2. User selects the target family if one is not already preselected.
3. User enters the new student posture and optional testing baseline.

Acceptance:

- Student is attached to the selected family only.
- Student redirects into `/students/[id]` after creation.
- Student-scoped records remain isolated from sibling and parent views unless explicitly parent-visible.

## Operate the internal dashboard

1. Strategist or ops opens `/dashboard`.
2. The page surfaces the current workload through four KPIs, urgent student queue ordering, upcoming deadlines, and testing-to-list guidance.
3. The user can launch directly into family or student work from the queue.

Acceptance:

- A user can identify the highest-priority student and next due item within seconds.
- Urgency ranking is clearer than secondary reporting information.
- The dashboard remains read-first and operational rather than edit-first.

## Manage family coordination

1. Household-wide coordination lives on `/families/[id]`.
2. Family-level decisions, notes, and resources use `student_id = null`.
3. Student cards route operators into the correct student portfolio.

Acceptance:

- Family workspace remains scan-first and read-first.
- Pending family-input items are visible near the top.
- Editing is available on demand, but current posture and coordination state remain primary.

## Manage student portfolio

1. Strategist or ops works from `/students/[id]`.
2. Monthly summary, academic update, profile update, tasks, decisions, notes, and artifacts are student-scoped by default.
3. Activities, competitions, testing, and school targets are managed directly on the student page.

Acceptance:

- School-fit guidance responds deterministically to current/projected SAT and school bucket mix.
- Student page remains read-first with focused composer modules.
- Shared family context stays visible without replacing the student-centered view.

## Use admissions analytics

1. Strategist or ops opens `/analytics`.
2. User filters the local Collegebase dataset by school, intended major, GPA, SAT, and ACT.
3. User compares accepted versus rejected cohorts and drills into extracted applicant records for school-specific benchmarking.

Acceptance:

- Analytics remains internal-only.
- The local normalized dataset can be loaded reliably in launch environments.
- The school-specific view remains deterministic and shareable through URL state.
- A documented refresh and verification process exists for the dataset.

## Research colleges when needed

1. Strategist or ops opens `/colleges` for broader research or launches from `/families/[id]` for family-aware context.
2. Explorer queries College Scorecard live when configured and stays scoped to bachelor’s-dominant institutions.
3. Major-aware filtering uses the controlled CIP-4 picker.

Acceptance:

- College research remains internal-only.
- Family-aware preview and list attachment can exist, but deeper list-building maturity is not required for pilot launch.
- Failure or incompleteness in this route should not block day-1 internal launch if core operations are stable.

## Soft-launch the parent view

1. Parent user signs in with a linked email after the household has been prepared by internal staff.
2. Parent is linked to one family through `family_contacts.user_id`.
3. Portal groups parent-safe data by student inside the linked family.

Acceptance:

- Parents cannot access internal-only notes or internal summary fields.
- Multi-student households show separate student sections without leaking sibling internal data.
- Portal readiness is required only for invited linked pilot households, not broad launch rollout.

## Move from demo to live pilot

1. Team configures Supabase auth and profile linkage for strategist and ops users.
2. Team seeds or creates the initial live pilot cohort, including at least one multi-student family.
3. Team verifies parent linkage for invited soft-launch households.
4. Team verifies that `/analytics` uses the intended local dataset snapshot.

Acceptance:

- Live internal users can operate without demo-mode fallback.
- The launch cohort contains 3 to 10 live families.
- At least one household exercises the multi-student model.
- Internal operations can continue even while Google Drive remains the file source of truth.
