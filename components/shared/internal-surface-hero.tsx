type InternalSurfaceHeroProps = {
  eyebrow: string;
  title: string;
  description: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
};

export function InternalSurfaceHero({
  eyebrow,
  title,
  description,
  actions,
  children,
}: InternalSurfaceHeroProps) {
  return (
    <section className="panel rounded-[2rem] px-6 py-8 md:px-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            {eyebrow}
          </p>
          <h1 className="section-title mt-3 text-4xl font-semibold">{title}</h1>
          <div className="mt-4 text-base leading-8 text-[var(--muted)]">{description}</div>
          {children ? <div className="mt-5 flex flex-wrap gap-3">{children}</div> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}
