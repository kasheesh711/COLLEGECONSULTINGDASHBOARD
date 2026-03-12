import Link from "next/link";
import { CircleAlert, Clock3, Files, WandSparkles } from "lucide-react";
import { DashboardPriorityQueue } from "@/components/shared/dashboard-priority-queue";
import { InternalSurfaceHero } from "@/components/shared/internal-surface-hero";
import { MetricCard } from "@/components/shared/metric-card";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatRoleLabel } from "@/lib/auth/roles";
import { requireInternalAccess } from "@/lib/auth/session";
import { getInternalDashboardSnapshot } from "@/lib/db/queries";
import { formatDisplayDate } from "@/lib/domain/dashboard";

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
      ? `${snapshot.metrics.urgentStudents} students need immediate review, with ${snapshot.metrics.overdueItems} overdue items still open.`
      : "No red-posture students are sitting in the queue right now.";

  return (
    <div className="space-y-8">
      <InternalSurfaceHero
        eyebrow="Internal dashboard"
        title="Student command center"
        description={
          <>
            Signed in as {actor.fullName}. Assigned roles:{" "}
            {actor.roles.map((role) => formatRoleLabel(role)).join(" / ")}. Current mode:{" "}
            {formatRoleLabel(actor.activeRole)} with{" "}
            {actor.familyScope === "all" ? "global internal access" : "assigned family scope"}.{" "}
            {workloadPosture}
          </>
        }
        actions={
          <>
            <Link
              href="/families/new"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
            >
              New family
            </Link>
            <Link
              href="/students/new"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/70 px-5 py-3 text-sm font-semibold"
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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Active students"
          value={String(snapshot.metrics.activeStudents)}
          helper={`Across ${snapshot.metrics.activeFamilies} families`}
          tone="muted"
        />
        <MetricCard
          label="Urgent students"
          value={String(snapshot.metrics.urgentStudents)}
          helper="Red posture or overdue work"
          tone="urgent"
        />
        <MetricCard
          label="Overdue items"
          value={String(snapshot.metrics.overdueItems)}
          helper="Nearest unresolved work across all students"
          tone="warning"
        />
        <MetricCard
          label="Parent-visible due soon"
          value={String(snapshot.metrics.parentVisibleDueSoon)}
          helper="Visible deadlines inside the next 14 days"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          eyebrow="Priority queue"
          title="Students needing attention now"
          description="The queue ranks individual students first so strategists can triage work without opening each family."
          icon={CircleAlert}
          tone="urgent"
        >
          <DashboardPriorityQueue students={snapshot.urgentStudents} />
        </SectionCard>

        <div className="space-y-6">
          <SectionCard
            eyebrow="Deadline map"
            title="Upcoming work"
            description="Nearest unresolved tasks across the whole student roster."
            icon={Clock3}
            tone="muted"
          >
            <div className="space-y-3">
              {snapshot.upcomingTasks.map((task) => (
                <div
                  key={`${task.familySlug}-${task.studentName}-${task.itemName}`}
                  className="rounded-[1.5rem] border border-[var(--border)] bg-white/75 px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{task.itemName}</p>
                      <p className="text-sm text-[var(--muted)]">
                        {task.studentName} • {task.familyLabel}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                        {task.parentVisible ? "Parent visible" : "Internal only"}
                      </p>
                    </div>
                    <div className="space-y-2 text-right">
                      <StatusBadge status={task.computedStatus} kind="task" />
                      <p className="text-sm text-[var(--muted)]">{formatDisplayDate(task.dueDate)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Reporting posture"
            title="Data hygiene and triage coverage"
            description="Keep these lower-priority checks visible without competing with the urgent queue."
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
        </div>
      </section>

      <SectionCard
        eyebrow="School fit"
        title="Testing-to-list guidance"
        description="Deterministic rule suggestions based on current/projected SAT and the live school bucket mix."
        icon={WandSparkles}
        tone="muted"
      >
        <div className="grid gap-3 xl:grid-cols-2">
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
    </div>
  );
}
