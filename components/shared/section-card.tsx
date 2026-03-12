import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

type SectionCardProps = {
  eyebrow: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  tone?: "default" | "urgent" | "muted" | "archive";
  actions?: React.ReactNode;
  children: React.ReactNode;
};

const toneMap: Record<NonNullable<SectionCardProps["tone"]>, string> = {
  default: "",
  urgent: "border border-[var(--danger)]/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,245,242,0.96))]",
  muted: "border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,244,238,0.94))]",
  archive: "border border-dashed border-[var(--border)] bg-[linear-gradient(180deg,rgba(248,244,238,0.92),rgba(244,238,231,0.82))]",
};

export function SectionCard({
  eyebrow,
  title,
  description,
  icon: Icon,
  tone = "default",
  actions,
  children,
}: SectionCardProps) {
  return (
    <section className={clsx("panel fade-up rounded-[2rem] p-6 md:p-7", toneMap[tone])}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            {eyebrow}
          </p>
          <h2 className="section-title mt-3 text-2xl font-semibold">{title}</h2>
          {description ? (
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              {description}
            </p>
          ) : null}
        </div>
        <div className="flex items-start gap-3">
          {actions}
          {Icon ? (
            <span className="rounded-full bg-white/80 p-3 text-[var(--accent)]">
              <Icon className="h-5 w-5" />
            </span>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}
