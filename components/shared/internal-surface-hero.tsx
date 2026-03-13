import clsx from "clsx";

type InternalSurfaceHeroProps = {
  eyebrow: string;
  title: string;
  description: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  variant?: "internal" | "portal" | "auth" | "data" | "form" | "home";
};

const variantMap: Record<NonNullable<InternalSurfaceHeroProps["variant"]>, string> = {
  internal:
    "border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,253,250,0.98),rgba(246,239,229,0.94))]",
  portal:
    "border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,244,239,0.94))]",
  auth:
    "border-[var(--brand-blue)]/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(236,242,247,0.92))]",
  data:
    "border-[var(--brand-blue)]/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(239,244,248,0.94))]",
  form:
    "border-[var(--accent)]/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,241,235,0.94))]",
  home:
    "border-[var(--brand-blue)]/14 bg-[linear-gradient(135deg,rgba(255,253,250,0.98),rgba(239,244,248,0.92)_52%,rgba(243,222,208,0.8))]",
};

export function InternalSurfaceHero({
  eyebrow,
  title,
  description,
  actions,
  children,
  variant = "internal",
}: InternalSurfaceHeroProps) {
  return (
    <section className={clsx("panel rounded-[2rem] border px-6 py-8 md:px-8 md:py-10", variantMap[variant])}>
      <div className="flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-4xl">
          <p className="ui-kicker">{eyebrow}</p>
          <h1 className="section-title mt-4 text-[2.55rem] font-semibold leading-[0.94] md:text-[3.6rem]">{title}</h1>
          <div className="mt-5 max-w-3xl text-sm leading-[1.85] text-[var(--foreground-soft)] md:text-[0.94rem] md:leading-[1.9]">
            {description}
          </div>
          {children ? <div className="mt-6 flex flex-wrap gap-2.5">{children}</div> : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row xl:justify-end">{actions}</div>
        ) : null}
      </div>
    </section>
  );
}
