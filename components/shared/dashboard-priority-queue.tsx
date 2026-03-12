import Link from "next/link";
import clsx from "clsx";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDisplayDate } from "@/lib/domain/dashboard";
import type { DashboardQueueItem } from "@/lib/domain/types";

type DashboardPriorityQueueProps = {
  students: DashboardQueueItem[];
};

function getQueueTone(student: DashboardQueueItem) {
  if (student.overallStatus === "red" || student.overdueTaskCount > 0) {
    return "border-[var(--danger)]/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,244,241,0.96))]";
  }

  if (student.overallStatus === "yellow") {
    return "border-[var(--warn)]/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,248,236,0.96))]";
  }

  return "border-[var(--border)] bg-white/75";
}

function buildUpcomingWorkCards(student: DashboardQueueItem) {
  if (student.upcomingWork.length > 0) {
    return student.upcomingWork;
  }

  return [
    {
      itemName: "No open work scheduled",
      dueDate: student.lastUpdatedDate,
      computedStatus: "done" as const,
      parentVisible: false,
      owner: "Internal team",
      category: "admin" as const,
    },
  ];
}

export function DashboardPriorityQueue({ students }: DashboardPriorityQueueProps) {
  return (
    <div className="space-y-4">
      {students.map((student) => {
        const workCards = buildUpcomingWorkCards(student);

        return (
        <article
          key={student.slug}
          className={clsx("rounded-[1.75rem] border p-5 shadow-sm", getQueueTone(student))}
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.9fr)] xl:items-stretch">
            <div className="grid h-full gap-4 rounded-[1.75rem] bg-white/78 p-5 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="min-w-0 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-2xl font-semibold">{student.studentName}</h3>
                  <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                    {student.gradeLevel}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--muted)]">
                  <span>{student.familyLabel}</span>
                  <span>{student.pathwayLabel}</span>
                  <span>{student.currentPhase}</span>
                  <span>{student.tier}</span>
                </div>
                <p className="text-sm leading-7 text-[var(--muted)]">{student.biggestRisk}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-[1.25rem] bg-[var(--background-soft)] px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Testing</p>
                    <p className="mt-2 font-semibold">
                      {student.currentSat ? `SAT ${student.currentSat}` : "No SAT yet"}
                      {student.projectedSat ? ` -> ${student.projectedSat}` : ""}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] bg-[var(--background-soft)] px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">School mix</p>
                    <p className="mt-2 font-semibold">
                      R {student.schoolBucketCounts.reach} / T {student.schoolBucketCounts.target} / L{" "}
                      {student.schoolBucketCounts.likely}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex h-full flex-col rounded-[1.5rem] bg-black px-4 py-4 text-sm text-white">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                  <Clock3 className="h-4 w-4" />
                  Attention now
                </div>
                <div className="mt-4 space-y-2">
                  <p>Pending decisions: {student.pendingDecisionCount}</p>
                  <p>Overdue tasks: {student.overdueTaskCount}</p>
                  <p>
                    Next due:{" "}
                    {student.nextCriticalDueDate ? formatDisplayDate(student.nextCriticalDueDate) : "No open due date"}
                  </p>
                  <p>Updated: {formatDisplayDate(student.lastUpdatedDate)}</p>
                </div>
                <div className="mt-auto space-y-2 pt-4">
                  <Link
                    href={`/students/${student.slug}`}
                    className="inline-flex items-center gap-2 font-semibold text-white"
                  >
                    Open student portfolio
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/families/${student.familySlug}`}
                    className="block font-semibold text-white/80"
                  >
                    Open family workspace
                  </Link>
                </div>
              </div>
            </div>

            <div
              className="grid h-full gap-3"
              style={{ gridTemplateRows: `repeat(${workCards.length}, minmax(0, 1fr))` }}
            >
              {workCards.map((task) => (
                <div
                  key={`${student.slug}-${task.itemName}-${task.dueDate}`}
                  className="flex h-full flex-col justify-between rounded-[1.5rem] border border-[var(--border)] bg-white/85 px-4 py-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold">{task.itemName}</p>
                      <StatusBadge status={task.computedStatus} kind="task" />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      <span>{formatDisplayDate(task.dueDate)}</span>
                      <span>{task.category}</span>
                      <span>{task.parentVisible ? "Parent visible" : "Internal only"}</span>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-[var(--muted)]">{task.owner}</p>
                </div>
              ))}
            </div>
          </div>
        </article>
      );
      })}
    </div>
  );
}
