import Link from "next/link";
import { CircleAlert, Files, WandSparkles } from "lucide-react";
import { DashboardPriorityQueue } from "@/components/shared/dashboard-priority-queue";
import { InternalSurfaceHero } from "@/components/shared/internal-surface-hero";
import { MetricCard } from "@/components/shared/metric-card";
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
      <div className="panel rounded-[2rem] border p-8">
        <p className="ui-kicker">Internal dashboard</p>
        <h1 className="section-title mt-4 text-4xl font-semibold">Live data is unavailable</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--foreground-soft)]">
          Protected internal surfaces stay honest in live mode. Resolve the Supabase query or policy issue before reloading this page.
        </p>
        <p className="mt-5 rounded-[1.25rem] border border-[var(--warn)]/14 bg-[var(--warn-soft)] px-4 py-3 text-sm text-[var(--warn)]">
          {loadError ?? "Unable to load live dashboard data."}
        </p>
      </div>
    );
  }

  const workloadPosture =
    snapshot.metrics.urgentStudents > 0 || snapshot.metrics.overdueItems > 0
      ? `${snapshot.metrics.urgentStudents} urgent students and ${snapshot.metrics.overdueItems} overdue items are driving the queue.`
      : "No red-posture students are waiting in the queue.";

  return (
    <div className="space-y-6">
      <InternalSurfaceHero
        eyebrow="Internal dashboard"
        title="Student command center"
        description={
          <>
            {formatRoleLabel(actor.activeRole)} mode for {actor.fullName}.{" "}
            {actor.familyScope === "all" ? "Global household scope." : "Assigned household scope."}{" "}
            {workloadPosture}
          </>
        }
        actions={
          <>
            <Link href="/families/new" className="ui-button-primary">
              New family
            </Link>
            <Link href="/students/new" className="ui-button-secondary">
              Add student
            </Link>
          </>
        }
      >
        <span className="ui-chip" data-tone="urgent">
          {snapshot.metrics.urgentStudents} urgent
        </span>
        <span className="ui-chip" data-tone="accent">
          {snapshot.metrics.overdueItems} overdue
        </span>
        <span className="ui-chip" data-tone="internal">
          {snapshot.metrics.parentVisibleDueSoon} parent-ready soon
        </span>
      </InternalSurfaceHero>

      <section className="grid gap-4 fade-up-stagger md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Active students"
          value={String(snapshot.metrics.activeStudents)}
          helper="Students currently in motion."
        />
        <MetricCard
          label="Urgent students"
          value={String(snapshot.metrics.urgentStudents)}
          helper="Red posture or compounding blockers."
          tone="urgent"
        />
        <MetricCard
          label="Overdue items"
          value={String(snapshot.metrics.overdueItems)}
          helper="Tasks already past due."
          tone="warning"
        />
        <MetricCard
          label="Parent-visible due soon"
          value={String(snapshot.metrics.parentVisibleDueSoon)}
          helper="Visible commitments approaching quickly."
          variant="data"
        />
      </section>

      <SectionCard
        eyebrow="Priority queue"
        title="Students needing attention now"
        description="Urgency stays dominant; the queue surfaces the next concrete move immediately."
        icon={CircleAlert}
        tone="urgent"
      >
        <DashboardPriorityQueue students={snapshot.urgentStudents} />
      </SectionCard>

      <section className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          eyebrow="Coverage"
          title="Readiness checks"
          description="Quiet operational hygiene, kept secondary to the live queue."
          icon={Files}
          tone="muted"
          variant="data"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="ui-subtle-card p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--brand-blue)]">Testing profiles</p>
              <p className="section-title mt-3 text-3xl font-semibold">
                {snapshot.metrics.testingProfilesReady}
              </p>
              <p className="mt-2 text-sm text-[var(--foreground-soft)]">Students with a usable baseline.</p>
            </div>
            <div className="ui-subtle-card p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--brand-blue)]">School lists</p>
              <p className="section-title mt-3 text-3xl font-semibold">{snapshot.metrics.schoolListsReady}</p>
              <p className="mt-2 text-sm text-[var(--foreground-soft)]">Students with at least two targets.</p>
            </div>
            <div className="ui-subtle-card p-4 sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--brand-blue)]">Current summaries</p>
              <p className="mt-3 text-sm font-semibold leading-7 text-[var(--foreground)]">
                {snapshot.metrics.missingCurrentMonthSummary === 0
                  ? "Every active student has a current monthly summary."
                  : `${snapshot.metrics.missingCurrentMonthSummary} students still need a current monthly summary.`}
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="School fit"
          title="Testing-to-list guidance"
          description="Deterministic nudges that stay visible without drowning the command queue."
          icon={WandSparkles}
          tone="muted"
          variant="data"
        >
          <div className="grid gap-3">
            {snapshot.schoolFitInsights.map((item) => (
              <div key={item.studentSlug} className="ui-subtle-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.studentName}</p>
                    <p className="mt-1 text-sm text-[var(--foreground-soft)]">
                      {item.currentSat ? `SAT ${item.currentSat}` : "No current SAT"}
                      {item.projectedSat ? ` -> ${item.projectedSat}` : ""}
                    </p>
                  </div>
                  <Link
                    href={`/students/${item.studentSlug}`}
                    className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-blue)]"
                  >
                    Review
                  </Link>
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">{item.recommendation}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
