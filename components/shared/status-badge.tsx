import clsx from "clsx";
import type { OverallStatus, TaskComputedStatus } from "@/lib/domain/types";

type StatusBadgeProps = {
  status: OverallStatus | TaskComputedStatus;
  kind?: "case" | "task" | "visibility";
};

const statusMap: Record<string, string> = {
  green: "border border-[var(--success)]/18 bg-[var(--success-soft)] text-[var(--success)]",
  yellow: "border border-[var(--warn)]/18 bg-[var(--warn-soft)] text-[var(--warn)]",
  red: "border border-[var(--danger)]/18 bg-[var(--danger-soft)] text-[var(--danger)]",
  not_started: "border border-slate-200 bg-slate-100 text-slate-700",
  in_progress: "border border-[var(--brand-blue)]/16 bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]",
  blocked: "border border-[var(--warn)]/18 bg-[var(--warn-soft)] text-[var(--warn)]",
  done: "border border-[var(--success)]/18 bg-[var(--success-soft)] text-[var(--success)]",
  overdue: "border border-[var(--danger)]/18 bg-[var(--danger-soft)] text-[var(--danger)]",
};

export function StatusBadge({ status, kind = "case" }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em]",
        statusMap[status],
        kind === "case" ? "min-w-[98px] justify-center" : "",
        kind === "visibility" ? "min-w-0" : "",
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}
