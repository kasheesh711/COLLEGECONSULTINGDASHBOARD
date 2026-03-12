import Link from "next/link";
import { CircleAlert, Files, WandSparkles } from "lucide-react";
import { DashboardPriorityQueue } from "@/components/shared/dashboard-priority-queue";
import { InternalSurfaceHero } from "@/components/shared/internal-surface-hero";
import { SectionCard } from "@/components/shared/section-card";
import { formatRoleLabel } from "@/lib/auth/roles";
import { requireInternalAccess } from "@/lib/auth/session";
import { getInternalDashboardSnapshot } from "@/lib/db/queries";

export default async function DashboardPage() {
  const actor = await requireInternalAccess("/dashboard");
  let snapshot: Awaited<ReturnType<typeof getInternalDashboardSnapshot>> | null = null;
  let loadError: string | null = null;

  try {
    snapshot = await getInternalDashboardSnapshot(actor);
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unable to load live dashboard data.";
  }

  if (!snapshot) {
    return (
      <div className="panel rounded-[2rem] p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
          Internal dashboard
        </p>
        <h1 className="section-title mt-3 text-3xl font-semibold">Live data is not available</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted)]">
          The app is in live mode, so it will not silently fall back to demo fixtures on protected internal pages.
          Resolve the Supabase query or policy issue and reload.
        </p>
        <p className="mt-4 rounded-[1.25rem] bg-[var(--warn-soft)] px-4 py-3 text-sm text-[var(--warn)]">
          {loadError ?? "Unable to load live dashboard data."}
        </p>
      </div>
    );
  }

  const workloadPosture =
    snapshot.metrics.urgentStudents > 0 || snapshot.metrics.overdueItems > 0
      ? `${snapshot.metrics.urgentStudents} urgent students and ${snapshot.metrics.overdueItems} overdue items need attention right now.`
      : "No red-posture students are sitting in the queue right now.";

  return (
    <div className="space-y-8">
      <InternalSurfaceHero
        eyebrow="Internal dashboard"
        title="Student command center"
        description={
          <>
            Signed in as {actor.fullName} in {formatRoleLabel(actor.activeRole)} mode with{" "}
            {actor.familyScope === "all" ? "global internal access" : "assigned family scope"}. {workloadPosture}
          </>
        }
        actions={
          <>
            <Link
              href="/families/new"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold !text-white shadow-sm"
            >
              New family
            </Link>
            <Link
              href="/students/new"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-6 py-3 text-sm font-semibold"
            >
              Add student
            </Link>
          </>
        }
      >
        <span className="rounded-full bg-[var(--danger-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--danger)]">
          {snapshot.metrics.urgentStudents} urgent students
        </span>
        <span className="rounded-full bg-[var(--warn-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--warn)]">
          {snapshot.metrics.overdueItems} overdue items
        </span>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          {snapshot.metrics.parentVisibleDueSoon} parent-visible deadlines due soon
        </span>
      </InternalSurfaceHero>

      <section>
        <SectionCard
          eyebrow="Priority queue"
          title="Students needing attention now"
          icon={CircleAlert}
          tone="urgent"
          actions={
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              <span>Sort by</span>
              <select
                defaultValue="urgency"
                aria-label="Sort priority queue"
                className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold normal-case tracking-normal text-[var(--foreground)] outline-none"
              >
                <option value="urgency">Urgency first</option>
              </select>
            </label>
          }
        >
          <DashboardPriorityQueue students={snapshot.urgentStudents} />
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            eyebrow="Data hygiene"
            title="Coverage checks"
            description="Lower-priority readiness checks for internal follow-through."
            icon={Files}
            tone="muted"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.5rem] bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                  Testing profiles
                </p>
                <p className="section-title mt-3 text-3xl font-semibold">
                  {snapshot.metrics.testingProfilesReady}
                </p>
                <p className="mt-2 text-sm text-[var(--muted)]">Students with a usable testing baseline.</p>
              </div>
              <div className="rounded-[1.5rem] bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">School lists</p>
                <p className="section-title mt-3 text-3xl font-semibold">
                  {snapshot.metrics.schoolListsReady}
                </p>
                <p className="mt-2 text-sm text-[var(--muted)]">Students with at least two tracked targets.</p>
              </div>
              <div className="rounded-[1.5rem] bg-white/70 p-4 sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Current month summaries</p>
                <p className="mt-3 font-semibold">
                  {snapshot.metrics.missingCurrentMonthSummary === 0
                    ? "All active students have a current monthly summary."
                  : `${snapshot.metrics.missingCurrentMonthSummary} students still need a current monthly summary.`}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="School fit"
            title="Testing-to-list guidance"
            description="Deterministic suggestions that stay visible without competing with the queue."
            icon={WandSparkles}
            tone="muted"
          >
            <div className="grid gap-3">
              {snapshot.schoolFitInsights.map((item) => (
                <div key={item.studentSlug} className="rounded-[1.5rem] bg-white/75 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.studentName}</p>
                      <p className="text-sm text-[var(--muted)]">
                        {item.currentSat ? `SAT ${item.currentSat}` : "No current SAT"}
                        {item.projectedSat ? ` -> ${item.projectedSat}` : ""}
                      </p>
                    </div>
                    <Link
                      href={`/students/${item.studentSlug}`}
                      className="inline-flex rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em]"
                    >
                      Review
                    </Link>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{item.recommendation}</p>
                </div>
              ))}
            </div>
          </SectionCard>
      </section>
    </div>
  );
}
