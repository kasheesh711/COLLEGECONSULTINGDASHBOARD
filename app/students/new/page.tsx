import Link from "next/link";
import { createStudentAction } from "@/app/families/actions";
import { FlashBanner } from "@/components/shared/flash-banner";
import { InternalSurfaceHero } from "@/components/shared/internal-surface-hero";
import { SectionCard } from "@/components/shared/section-card";
import { isSupabaseConfigured } from "@/lib/auth/config";
import { formatRoleLabel } from "@/lib/auth/roles";
import { requireInternalAccess } from "@/lib/auth/session";
import { getInternalFamilyBySlug, listInternalFamilies } from "@/lib/db/queries";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getStringValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewStudentPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const actor = await requireInternalAccess("/students/new");
  const resolved = await searchParams;
  const familySlug = getStringValue(resolved.family);
  const message = getStringValue(resolved.message);
  const error = getStringValue(resolved.error);

  if (!familySlug) {
    const families = await listInternalFamilies(actor);

    return (
      <div className="space-y-6">
        <InternalSurfaceHero
          eyebrow="Add student"
          title="Choose a family first"
          description={`Student creation attaches the new student to an existing family workspace. ${formatRoleLabel(actor.activeRole)} mode.`}
          variant="form"
        />
        <div className="grid gap-4 md:grid-cols-2">
          {families.map((family) => (
            <Link key={family.slug} href={`/students/new?family=${family.slug}`} className="panel rounded-[2rem] border p-6 hover:bg-white">
              <p className="ui-kicker">Household</p>
              <h2 className="section-title mt-3 text-3xl font-semibold">{family.familyLabel}</h2>
              <p className="mt-3 text-sm text-[var(--foreground-soft)]">
                {family.parentContactName} • {family.studentCount} students
              </p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const family = await getInternalFamilyBySlug(actor, familySlug);
  if (!family) {
    return (
      <div className="panel rounded-[2rem] border p-8 text-sm leading-7 text-[var(--foreground-soft)]">
        Family access is not available in the current role.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <InternalSurfaceHero
        eyebrow="Add student"
        title={family.familyLabel}
        description="Create an additional student within this family workspace."
        variant="form"
        actions={
          <Link href={`/families/${family.slug}`} className="ui-button-secondary">
            Back to family
          </Link>
        }
      />

      <FlashBanner message={message} error={error} />

      <SectionCard
        eyebrow="Student"
        title="New student profile"
        description="Core posture first, optional testing context second."
        variant="form"
      >
        <form action={createStudentAction} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="familyId" value={family.id} />
          <input type="hidden" name="familySlug" value={family.slug} />
          <input type="hidden" name="returnPath" value={`/students/new?family=${family.slug}`} />
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-[var(--foreground-soft)]">Student name</span>
            <input name="studentName" required className="ui-field" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-[var(--foreground-soft)]">Grade level</span>
            <input name="gradeLevel" defaultValue="Grade 11" required className="ui-field" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-[var(--foreground-soft)]">Pathway</span>
            <select name="pathway" defaultValue="us_college" className="ui-field">
              <option value="us_college">US College</option>
              <option value="uk_college">UK College</option>
              <option value="us_boarding">US Boarding</option>
              <option value="uk_boarding">UK Boarding</option>
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-[var(--foreground-soft)]">Tier</span>
            <input name="tier" defaultValue="Core Pathway" required className="ui-field" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-[var(--foreground-soft)]">Current phase</span>
            <input name="currentPhase" defaultValue="Launch and roadmap" required className="ui-field" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-[var(--foreground-soft)]">Overall status</span>
            <select name="overallStatus" defaultValue="green" className="ui-field">
              <option value="green">Green</option>
              <option value="yellow">Yellow</option>
              <option value="red">Red</option>
            </select>
          </label>
          <div className="md:col-span-2 grid gap-3 rounded-[1.5rem] border border-[var(--border)] bg-white/68 p-4 sm:grid-cols-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-blue)] sm:col-span-2">
              Optional testing context
            </p>
            <input type="number" min="0" name="currentSat" placeholder="Current SAT" className="ui-field" />
            <input type="number" min="0" name="projectedSat" placeholder="Projected SAT" className="ui-field" />
            <input type="number" min="0" name="currentAct" placeholder="Current ACT" className="ui-field" />
            <input type="number" min="0" name="projectedAct" placeholder="Projected ACT" className="ui-field" />
          </div>
          <label className="space-y-2 text-sm md:col-span-2">
            <span className="font-semibold text-[var(--foreground-soft)]">Status reason</span>
            <textarea name="statusReason" rows={4} required className="ui-field" />
          </label>
          <label className="space-y-2 text-sm md:col-span-2">
            <span className="font-semibold text-[var(--foreground-soft)]">Testing strategy note</span>
            <textarea name="strategyNote" rows={3} className="ui-field" />
          </label>
          <div className="md:col-span-2 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={!isSupabaseConfigured()}
              className="ui-button-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              Create student
            </button>
            {!isSupabaseConfigured() ? (
              <p className="text-sm text-[var(--foreground-soft)]">
                Live Supabase credentials are required to write real records.
              </p>
            ) : null}
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
