import Link from "next/link";
import clsx from "clsx";
import { Users } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDisplayDate } from "@/lib/domain/dashboard";
import type { FamilyListItem } from "@/lib/domain/types";

type FamiliesRosterProps = {
  families: FamilyListItem[];
};

function getRowTone(family: FamilyListItem) {
  if (family.activeStatuses.includes("red") || family.overdueTaskCount > 0) {
    return "border-[var(--danger)]/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,244,241,0.96))]";
  }

  if (family.activeStatuses.includes("yellow")) {
    return "border-[var(--warn)]/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,248,236,0.96))]";
  }

  return "border-[var(--border)] bg-white/75";
}

export function FamiliesRoster({ families }: FamiliesRosterProps) {
  if (families.length === 0) {
    return (
      <div className="panel rounded-[2rem] p-8 text-sm leading-7 text-[var(--muted)]">
        No households match the current filter set.
      </div>
    );
  }

  return (
    <>
      <div className="hidden xl:block">
        <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--background-soft)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          <div className="grid grid-cols-[1.35fr_0.9fr_1fr_0.8fr_1.2fr_0.8fr_0.9fr_0.9fr] gap-4">
            <span>Household</span>
            <span>Owners</span>
            <span>Students</span>
            <span>Statuses</span>
            <span>Biggest risk</span>
            <span>Next due</span>
            <span>Load</span>
            <span>Actions</span>
          </div>
        </div>
        <div className="mt-3 space-y-3">
          {families.map((family) => (
            <article
              key={family.slug}
              className={clsx("rounded-[1.75rem] border p-5 shadow-sm", getRowTone(family))}
            >
              <div className="grid grid-cols-[1.35fr_0.9fr_1fr_0.8fr_1.2fr_0.8fr_0.9fr_0.9fr] gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold">{family.familyLabel}</h2>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      <Users className="h-3.5 w-3.5" />
                      {family.studentCount}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--muted)]">{family.parentContactName}</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                    Updated {formatDisplayDate(family.lastUpdatedDate)}
                  </p>
                </div>
                <div className="space-y-1 text-sm text-[var(--muted)]">
                  <p>{family.strategistOwnerName}</p>
                  <p>{family.opsOwnerName}</p>
                </div>
                <div className="text-sm leading-7 text-[var(--muted)]">
                  {family.studentNames.join(" • ")}
                </div>
                <div className="flex flex-wrap gap-2">
                  {family.activeStatuses.map((status) => (
                    <StatusBadge key={`${family.slug}-${status}`} status={status} />
                  ))}
                </div>
                <p className="text-sm leading-7 text-[var(--muted)]">{family.biggestRisk}</p>
                <div className="text-sm text-[var(--muted)]">
                  {family.nextCriticalDueDate
                    ? formatDisplayDate(family.nextCriticalDueDate)
                    : "No active due date"}
                </div>
                <div className="space-y-1 text-sm text-[var(--muted)]">
                  <p>{family.pendingDecisionCount} pending decisions</p>
                  <p>{family.overdueTaskCount} overdue items</p>
                </div>
                <div className="space-y-2">
                  <Link
                    href={`/families/${family.slug}`}
                    className="inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Open family workspace
                  </Link>
                  <Link
                    href={`/students/new?family=${family.slug}`}
                    className="inline-flex rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold"
                  >
                    Add student
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="space-y-3 xl:hidden">
        {families.map((family) => (
          <article
            key={family.slug}
            className={clsx("rounded-[1.75rem] border p-5 shadow-sm", getRowTone(family))}
          >
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold">{family.familyLabel}</h2>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                <Users className="h-3.5 w-3.5" />
                {family.studentCount} students
              </span>
            </div>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {family.parentContactName} • {family.strategistOwnerName} / {family.opsOwnerName}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {family.activeStatuses.map((status) => (
                <StatusBadge key={`${family.slug}-${status}`} status={status} />
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.25rem] bg-white/80 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Students</p>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                  {family.studentNames.join(" • ")}
                </p>
              </div>
              <div className="rounded-[1.25rem] bg-white/80 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Next due</p>
                <p className="mt-2 font-semibold">
                  {family.nextCriticalDueDate
                    ? formatDisplayDate(family.nextCriticalDueDate)
                    : "No active due date"}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{family.biggestRisk}</p>
            <p className="mt-3 text-sm text-[var(--muted)]">
              {family.pendingDecisionCount} pending decisions • {family.overdueTaskCount} overdue items • Updated{" "}
              {formatDisplayDate(family.lastUpdatedDate)}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/families/${family.slug}`}
                className="inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
              >
                Open family workspace
              </Link>
              <Link
                href={`/students/new?family=${family.slug}`}
                className="inline-flex rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold"
              >
                Add student
              </Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
