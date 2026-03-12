import clsx from "clsx";

type MetricCardProps = {
  label: string;
  value: string;
  helper: string;
  tone?: "default" | "urgent" | "warning" | "muted";
};

const toneMap: Record<NonNullable<MetricCardProps["tone"]>, string> = {
  default: "",
  urgent: "border border-[var(--danger)]/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,244,241,0.96))]",
  warning: "border border-[var(--warn)]/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,248,236,0.96))]",
  muted: "border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,244,238,0.94))]",
};

export function MetricCard({ label, value, helper, tone = "default" }: MetricCardProps) {
  return (
    <div className={clsx("panel fade-up rounded-[1.75rem] p-5", toneMap[tone])}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        {label}
      </p>
      <p className="section-title mt-4 text-4xl font-semibold">{value}</p>
      <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{helper}</p>
    </div>
  );
}
