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
    return "border-[var(--danger)]/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(250,239,235,0.96))]";
  }

  if (family.activeStatuses.includes("yellow")) {
    return "border-[var(--warn)]/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(248,239,230,0.96))]";
  }

  return "border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(247,243,237,0.94))]";
}

export function FamiliesRoster({ families }: FamiliesRosterProps) {
  if (families.length === 0) {
    return (
      <div className="panel rounded-[2rem] border p-8 text-sm leading-7 text-[var(--foreground-soft)]">
        No households match the current filter set.
      </div>
    );
  }

  return (
    <>
      <div className="hidden xl:block">
        <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/86 px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-blue)]">
          <div className="grid grid-cols-[1.3fr_0.85fr_1fr_0.8fr_1.15fr_0.8fr_0.9fr_0.9fr] gap-4">
            <span>Household</span>
            <span>Owners</span>
            <span>Students</span>
            <span>Status</span>
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
              className={clsx("rounded-[1.75rem] border p-5 shadow-[0_2px_4px_rgba(21,40,61,0.02),0_14px_30px_rgba(21,40,61,0.05)]", getRowTone(family))}
            >
              <div className="grid grid-cols-[1.3fr_0.85fr_1fr_0.8fr_1.15fr_0.8fr_0.9fr_0.9fr] gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold">{family.familyLabel}</h2>
                    <span className="rounded-full border border-[var(--border)] bg-white px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--brand-blue)]">
                      <span className="inline-flex items-center gap-2">
                        <Users className="h-3.5 w-3.5" />
                        {family.studentCount}
                      </span>
                    </span>
                  </div>
                  <p className="text-sm text-[var(--foreground-soft)]">{family.parentContactName}</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
                    Updated {formatDisplayDate(family.lastUpdatedDate)}
                  </p>
                </div>
                <div className="space-y-1 text-sm text-[var(--foreground-soft)]">
                  <p>{family.strategistOwnerName}</p>
                  <p>{family.opsOwnerName}</p>
                </div>
                <div className="text-sm leading-7 text-[var(--foreground-soft)]">
                  {family.studentNames.join(" • ")}
                </div>
                <div className="flex flex-wrap gap-2">
                  {family.activeStatuses.map((status) => (
                    <StatusBadge key={`${family.slug}-${status}`} status={status} />
                  ))}
                </div>
                <p className="text-sm leading-7 text-[var(--foreground-soft)]">{family.biggestRisk}</p>
                <div className="text-sm text-[var(--foreground-soft)]">
                  {family.nextCriticalDueDate
                    ? formatDisplayDate(family.nextCriticalDueDate)
                    : "No active due date"}
                </div>
                <div className="space-y-1 text-sm text-[var(--foreground-soft)]">
                  <p>{family.pendingDecisionCount} pending</p>
                  <p>{family.overdueTaskCount} overdue</p>
                </div>
                <div className="space-y-2">
                  <Link href={`/families/${family.slug}`} className="ui-button-primary w-full px-4 py-2 text-[0.66rem]">
                    Open family workspace
                  </Link>
                  <Link
                    href={`/students/new?family=${family.slug}`}
                    className="ui-button-secondary w-full px-4 py-2 text-[0.66rem]"
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
            className={clsx("rounded-[1.75rem] border p-5 shadow-[0_2px_4px_rgba(21,40,61,0.02),0_14px_30px_rgba(21,40,61,0.05)]", getRowTone(family))}
          >
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold">{family.familyLabel}</h2>
              <span className="rounded-full border border-[var(--border)] bg-white px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--brand-blue)]">
                <span className="inline-flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" />
                  {family.studentCount} students
                </span>
              </span>
            </div>
            <p className="mt-2 text-sm text-[var(--foreground-soft)]">
              {family.parentContactName} • {family.strategistOwnerName} / {family.opsOwnerName}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {family.activeStatuses.map((status) => (
                <StatusBadge key={`${family.slug}-${status}`} status={status} />
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="ui-subtle-card px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--brand-blue)]">Students</p>
                <p className="mt-2 text-sm leading-7 text-[var(--foreground-soft)]">
                  {family.studentNames.join(" • ")}
                </p>
              </div>
              <div className="ui-subtle-card px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--brand-blue)]">Next due</p>
                <p className="mt-2 font-semibold">
                  {family.nextCriticalDueDate
                    ? formatDisplayDate(family.nextCriticalDueDate)
                    : "No active due date"}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--foreground-soft)]">{family.biggestRisk}</p>
            <p className="mt-3 text-sm text-[var(--foreground-soft)]">
              {family.pendingDecisionCount} pending decisions • {family.overdueTaskCount} overdue items • Updated{" "}
              {formatDisplayDate(family.lastUpdatedDate)}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/families/${family.slug}`} className="ui-button-primary">
                Open family workspace
              </Link>
              <Link href={`/students/new?family=${family.slug}`} className="ui-button-secondary">
                Add student
              </Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
