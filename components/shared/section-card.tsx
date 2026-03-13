import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

type SectionCardProps = {
  eyebrow: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  tone?: "default" | "urgent" | "muted" | "archive";
  variant?: "internal" | "portal" | "data" | "form" | "auth";
  density?: "default" | "compact";
  actions?: React.ReactNode;
  children: React.ReactNode;
};

const toneMap: Record<NonNullable<SectionCardProps["tone"]>, string> = {
  default: "",
  urgent: "border-[var(--danger)]/22 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(250,239,235,0.96))]",
  muted: "border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(247,243,237,0.94))]",
  archive:
    "border-dashed border-[var(--border-strong)] bg-[linear-gradient(180deg,rgba(248,244,238,0.92),rgba(242,236,227,0.86))]",
};

const variantMap: Record<NonNullable<SectionCardProps["variant"]>, string> = {
  internal: "border-[var(--border)]",
  portal: "border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(247,244,238,0.92))]",
  data: "border-[var(--brand-blue)]/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(239,244,248,0.94))]",
  form: "border-[var(--accent)]/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(247,241,235,0.94))]",
  auth: "border-[var(--brand-blue)]/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(241,246,249,0.94))]",
};

export function SectionCard({
  eyebrow,
  title,
  description,
  icon: Icon,
  tone = "default",
  variant = "internal",
  density = "default",
  actions,
  children,
}: SectionCardProps) {
  return (
    <section
      className={clsx(
        "panel fade-up rounded-[2rem] border",
        density === "compact" ? "p-5 md:p-6" : "p-6 md:p-7",
        variantMap[variant],
        toneMap[tone],
      )}
    >
      <div className={clsx("flex items-start justify-between gap-4", density === "compact" ? "mb-5" : "mb-6")}>
        <div>
          <p className="ui-kicker">{eyebrow}</p>
          <h2 className="section-title mt-3 text-[2rem] font-semibold leading-[0.95]">{title}</h2>
          {description ? (
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--foreground-soft)]">
              {description}
            </p>
          ) : null}
        </div>
        <div className="flex items-start gap-3 self-start">
          {actions}
          {Icon ? (
            <span className="rounded-[1.15rem] border border-[var(--border)] bg-white/90 p-3.5 text-[var(--brand-blue)] shadow-[0_2px_4px_rgba(21,40,61,0.03),0_10px_24px_rgba(21,40,61,0.06)]">
              <Icon className="h-5 w-5" />
            </span>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}
