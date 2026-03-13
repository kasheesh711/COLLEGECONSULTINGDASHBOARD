import Link from "next/link";
import { ArrowRight, Compass, LockKeyhole, NotebookTabs, Sparkles, Users } from "lucide-react";
import { InternalSurfaceHero } from "@/components/shared/internal-surface-hero";
import { MetricCard } from "@/components/shared/metric-card";
import { SectionCard } from "@/components/shared/section-card";
import { getInternalDashboardSnapshot, listInternalFamilies } from "@/lib/db/queries";
import { requireInternalAccess } from "@/lib/auth/session";
import { getAppModeLabel } from "@/lib/auth/config";

export default async function Home() {
  const actor = await requireInternalAccess("/");
  const [snapshot, families] = await Promise.all([
    getInternalDashboardSnapshot(actor),
    listInternalFamilies(actor, { deadlineWindow: "30" }),
  ]);

  return (
    <div className="space-y-10 fade-in">
      <InternalSurfaceHero
        variant="home"
        eyebrow="BeGifted workspace"
        title="Editorial operations for private family advising."
        description="A polished command surface for strategist, ops, and parent-safe reporting. The app stays read-first, student-centered, and tuned for high-touch US college execution."
        actions={
          <>
            <Link href="/dashboard" className="ui-button-primary">
              Open dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/portal" className="ui-button-secondary">
              Preview portal
              <LockKeyhole className="h-4 w-4" />
            </Link>
          </>
        }
      >
        <span className="ui-chip" data-tone="accent">
          {getAppModeLabel()}
        </span>
        <span className="ui-chip" data-tone="internal">
          {snapshot.metrics.activeFamilies} pilot families
        </span>
        <span className="ui-chip" data-tone="urgent">
          {snapshot.metrics.urgentStudents} urgent students
        </span>
      </InternalSurfaceHero>

      <section className="grid gap-4 fade-up-stagger md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Families"
          value={String(snapshot.metrics.activeFamilies)}
          helper="Households live in the operating roster."
        />
        <MetricCard
          label="Students"
          value={String(snapshot.metrics.activeStudents)}
          helper="The daily operating unit for advising."
        />
        <MetricCard
          label="Overdue"
          value={String(snapshot.metrics.overdueItems)}
          helper="Tasks needing immediate follow-through."
          tone="urgent"
        />
        <MetricCard
          label="Parent-ready"
          value={String(snapshot.metrics.parentVisibleDueSoon)}
          helper="Visible due-soon items already safe to share."
          tone="muted"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard
          eyebrow="Entry points"
          title="Start from the surface that matches the moment."
          description="Fast internal routes stay operational; client-facing routes stay calmer and read-only."
          icon={Compass}
        >
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                href: "/dashboard",
                label: "Internal dashboard",
                copy: "Urgency-ranked student queue, deadlines, and readiness posture.",
              },
              {
                href: "/families",
                label: "Family roster",
                copy: "Scan families, compare risk, and open a household cockpit fast.",
              },
              {
                href: "/analytics",
                label: "Admissions analytics",
                copy: "School-level applicant reference and drill-down research.",
              },
              {
                href: "/portal",
                label: "Parent portal",
                copy: "Read-only monthly digest for linked pilot households.",
              },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="ui-subtle-card p-5 hover:bg-white">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-blue)]">
                  Route
                </p>
                <p className="section-title mt-3 text-2xl font-semibold">{item.label}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">{item.copy}</p>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Pilot watchlist"
          title="Households already exercising the core flows."
          description="A small cohort to verify the shared family, student, and portal patterns."
          icon={Users}
          variant="data"
        >
          <div className="space-y-3">
            {families.slice(0, 4).map((family) => (
              <div key={family.slug} className="ui-subtle-card flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-semibold text-[var(--foreground)]">{family.familyLabel}</p>
                  <p className="mt-1 text-sm text-[var(--foreground-soft)]">
                    {family.studentCount} students • {family.strategistOwnerName}
                  </p>
                </div>
                <Link
                  href={`/families/${family.slug}`}
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-blue)]"
                >
                  Open
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard
          eyebrow="Operating stance"
          title="What this release already does well."
          description="The product is built as a premium internal cockpit, not a generic CRUD dashboard."
          icon={Sparkles}
        >
          <div className="grid gap-4 md:grid-cols-2">
            {[
              "Multi-student families stay grouped without flattening student-specific work.",
              "Student 360 pages keep strategy, execution, and context in one scroll.",
              "Parent-safe visibility is separated from internal-only records by design.",
              "Analytics and college research remain reference surfaces, not workflow clutter.",
            ].map((item) => (
              <div key={item} className="ui-subtle-card p-4 text-sm leading-7 text-[var(--foreground-soft)]">
                {item}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Reference"
          title="Core docs for continued product work."
          description="The repo treats product docs as the source of truth for UX, launch scope, and schema boundaries."
          icon={NotebookTabs}
          variant="form"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="ui-subtle-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-blue)]">
                Product
              </p>
              <p className="mt-3 font-semibold">`docs/PRD.md`</p>
              <p className="mt-2 text-sm leading-7 text-[var(--foreground-soft)]">
                Launch scope, route priorities, and soft-launch boundaries.
              </p>
            </div>
            <div className="ui-subtle-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-blue)]">
                Data model
              </p>
              <p className="mt-3 font-semibold">`docs/data-model.md`</p>
              <p className="mt-2 text-sm leading-7 text-[var(--foreground-soft)]">
                Visibility boundaries, schema direction, and RLS intent.
              </p>
            </div>
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
