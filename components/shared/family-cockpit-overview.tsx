import Link from "next/link";
import { CircleAlert, Clock3, Users } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  computeTaskStatus,
  formatDisplayDate,
  getFamilyPendingItems,
  getLatestSummary,
  getNextCriticalTask,
} from "@/lib/domain/dashboard";
import type { FamilyWorkspace, TaskItem } from "@/lib/domain/types";

type FamilyCockpitOverviewProps = {
  family: FamilyWorkspace;
};

type OpenTask = {
  label: string;
  task: TaskItem;
  studentSlug?: string;
};

function getOpenTasks(family: FamilyWorkspace): OpenTask[] {
  const familyTasks = family.tasks.map((task) => ({ label: "Family", task }));
  const studentTasks = family.students.flatMap((student) =>
    student.tasks.map((task) => ({
      label: student.studentName,
      task,
      studentSlug: student.slug,
    })),
  );

  return [...familyTasks, ...studentTasks]
    .filter(({ task }) => computeTaskStatus(task) !== "done")
    .sort((left, right) => left.task.dueDate.localeCompare(right.task.dueDate));
}

function getLeadStudent(family: FamilyWorkspace) {
  return [...family.students]
    .sort((left, right) => {
      const rank = { red: 0, yellow: 1, green: 2 };
      const leftRank = rank[left.overallStatus];
      const rightRank = rank[right.overallStatus];
      if (leftRank !== rightRank) return leftRank - rightRank;

      const leftOverdue = left.tasks.some((task) => computeTaskStatus(task) === "overdue") ? 0 : 1;
      const rightOverdue = right.tasks.some((task) => computeTaskStatus(task) === "overdue") ? 0 : 1;
      if (leftOverdue !== rightOverdue) return leftOverdue - rightOverdue;

      const leftNext = getNextCriticalTask(left)?.dueDate ?? "9999-12-31";
      const rightNext = getNextCriticalTask(right)?.dueDate ?? "9999-12-31";
      if (leftNext !== rightNext) return leftNext.localeCompare(rightNext);

      return left.studentName.localeCompare(right.studentName);
    })[0];
}

export function FamilyCockpitOverview({ family }: FamilyCockpitOverviewProps) {
  const pendingItems = getFamilyPendingItems(family);
  const openTasks = getOpenTasks(family);
  const overdueTasks = openTasks.filter(({ task }) => computeTaskStatus(task) === "overdue");
  const nextCritical = openTasks[0];
  const leadStudent = getLeadStudent(family);
  const leadSummary = leadStudent ? getLatestSummary(leadStudent) : undefined;
  const topNextActions =
    leadSummary?.topNextActions.filter(Boolean) ??
    openTasks.slice(0, 3).map(({ task, label }) => `${task.itemName} (${label})`);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.95fr]">
        <div className="rounded-[1.75rem] border border-[var(--border)] bg-white/75 p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Household posture
            </span>
            {leadStudent ? <StatusBadge status={leadStudent.overallStatus} /> : null}
          </div>
          <h3 className="mt-4 text-2xl font-semibold">
            {leadSummary?.biggestWin ?? "Current family summary has not been written yet."}
          </h3>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            {leadSummary?.biggestRisk ??
              leadStudent?.statusReason ??
              "Add a current monthly summary so the household posture is easier to scan."}
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-[1.25rem] bg-[var(--background-soft)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Lead student</p>
              <p className="mt-2 font-semibold">{leadStudent?.studentName ?? "None assigned"}</p>
            </div>
            <div className="rounded-[1.25rem] bg-[var(--background-soft)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Next critical due</p>
              <p className="mt-2 font-semibold">
                {nextCritical ? formatDisplayDate(nextCritical.task.dueDate) : "No active due date"}
              </p>
            </div>
            <div className="rounded-[1.25rem] bg-[var(--background-soft)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Updated</p>
              <p className="mt-2 font-semibold">{formatDisplayDate(family.lastUpdatedDate)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-[var(--danger)]/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,244,241,0.96))] p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--danger)]">
            <CircleAlert className="h-4 w-4" />
            Attention now
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.25rem] bg-white/85 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Pending family input</p>
              <p className="mt-2 text-2xl font-semibold">{pendingItems.length}</p>
            </div>
            <div className="rounded-[1.25rem] bg-white/85 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Overdue items</p>
              <p className="mt-2 text-2xl font-semibold">{overdueTasks.length}</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {nextCritical ? (
              <div className="rounded-[1.25rem] bg-white/85 px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  <Clock3 className="h-4 w-4" />
                  Next move
                </div>
                <p className="mt-2 font-semibold">{nextCritical.task.itemName}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {nextCritical.label} • {formatDisplayDate(nextCritical.task.dueDate)}
                </p>
              </div>
            ) : null}
            <div className="rounded-[1.25rem] bg-white/85 px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                <Users className="h-4 w-4" />
                Top next actions
              </div>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--muted)]">
                {topNextActions.length === 0 ? (
                  <li>No active next actions logged yet.</li>
                ) : (
                  topNextActions.slice(0, 3).map((action) => <li key={action}>• {action}</li>)
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <nav className="sticky top-20 z-10 overflow-x-auto rounded-full border border-[var(--border)] bg-white/90 px-3 py-3 shadow-sm backdrop-blur">
        <div className="flex min-w-max gap-2">
          {[
            ["overview", "Overview"],
            ["attention-now", "Attention now"],
            ["student-roster", "Student roster"],
            ["college-strategy", "College strategy"],
            ["family-notes", "Notes"],
            ["family-artifacts", "Artifacts"],
            ["archive", "Archive"],
          ].map(([id, label]) => (
            <Link
              key={id}
              href={`#${id}`}
              className="rounded-full border border-[var(--border)] bg-[var(--background-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em]"
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
