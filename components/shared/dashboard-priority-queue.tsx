import Link from "next/link";
import clsx from "clsx";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDisplayDate } from "@/lib/domain/dashboard";
import type { StudentListItem } from "@/lib/domain/types";

type DashboardPriorityQueueProps = {
  students: StudentListItem[];
};

function getQueueTone(student: StudentListItem) {
  if (student.overallStatus === "red" || student.overdueTaskCount > 0) {
    return "border-[var(--danger)]/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,244,241,0.96))]";
  }

  if (student.overallStatus === "yellow") {
    return "border-[var(--warn)]/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,248,236,0.96))]";
  }

  return "border-[var(--border)] bg-white/75";
}

export function DashboardPriorityQueue({ students }: DashboardPriorityQueueProps) {
  return (
    <div className="space-y-4">
      {students.map((student, index) => (
        <article
          key={student.slug}
          className={clsx("rounded-[1.75rem] border p-5 shadow-sm", getQueueTone(student))}
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                  Rank {index + 1}
                </span>
                <h3 className="text-xl font-semibold">{student.studentName}</h3>
                <StatusBadge status={student.overallStatus} />
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  {student.gradeLevel}
                </span>
              </div>
              <p className="text-sm text-[var(--muted)]">
                {student.familyLabel} • {student.currentPhase} • {student.tier} • {student.pathwayLabel}
              </p>
              <p className="text-sm leading-7 text-[var(--muted)]">{student.biggestRisk}</p>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-[1.25rem] bg-white/80 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Testing</p>
                  <p className="mt-2 font-semibold">
                    {student.currentSat ? `SAT ${student.currentSat}` : "No SAT yet"}
                    {student.projectedSat ? ` -> ${student.projectedSat}` : ""}
                  </p>
                </div>
                <div className="rounded-[1.25rem] bg-white/80 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">School mix</p>
                  <p className="mt-2 font-semibold">
                    R {student.schoolBucketCounts.reach} / T {student.schoolBucketCounts.target} / L{" "}
                    {student.schoolBucketCounts.likely}
                  </p>
                </div>
                <div className="rounded-[1.25rem] bg-white/80 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Next due</p>
                  <p className="mt-2 font-semibold">
                    {student.nextCriticalDueDate
                      ? formatDisplayDate(student.nextCriticalDueDate)
                      : "No active due date"}
                  </p>
                </div>
              </div>
            </div>
            <div className="min-w-[240px] rounded-[1.5rem] bg-black px-4 py-4 text-sm text-white">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                <Clock3 className="h-4 w-4" />
                Attention now
              </div>
              <div className="mt-4 space-y-2">
                <p>Pending decisions: {student.pendingDecisionCount}</p>
                <p>Overdue tasks: {student.overdueTaskCount}</p>
                <p>Updated: {formatDisplayDate(student.lastUpdatedDate)}</p>
              </div>
              <div className="mt-4 space-y-2">
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
        </article>
      ))}
    </div>
  );
}
