import clsx from "clsx";

type MetricCardProps = {
  label: string;
  value: string;
  helper?: string;
  tone?: "default" | "urgent" | "warning" | "muted";
  variant?: "internal" | "portal" | "data";
};

const toneMap: Record<NonNullable<MetricCardProps["tone"]>, string> = {
  default: "",
  urgent: "border-[var(--danger)]/22 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(250,239,235,0.96))]",
  warning: "border-[var(--warn)]/22 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(248,239,230,0.96))]",
  muted: "border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(247,243,237,0.94))]",
};

const variantMap: Record<NonNullable<MetricCardProps["variant"]>, string> = {
  internal: "border-[var(--border)]",
  portal: "border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(247,244,238,0.92))]",
  data: "border-[var(--brand-blue)]/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(239,244,248,0.94))]",
};

export function MetricCard({
  label,
  value,
  helper,
  tone = "default",
  variant = "internal",
}: MetricCardProps) {
  return (
    <div className={clsx("panel fade-up rounded-[1.75rem] border p-6", variantMap[variant], toneMap[tone])}>
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.26em] text-[var(--brand-blue)]">
        {label}
      </p>
      <p className="section-title mt-4 text-[2.6rem] font-semibold leading-none tracking-[-0.03em]">{value}</p>
      {helper ? <p className="mt-3 text-sm leading-6 text-[var(--foreground-soft)]">{helper}</p> : null}
    </div>
  );
}
