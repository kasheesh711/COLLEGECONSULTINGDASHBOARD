import Link from "next/link";
import { createFamilyWithStudentAction } from "@/app/families/actions";
import { InternalSurfaceHero } from "@/components/shared/internal-surface-hero";
import { FlashBanner } from "@/components/shared/flash-banner";
import { SectionCard } from "@/components/shared/section-card";
import { isSupabaseConfigured } from "@/lib/auth/config";
import { formatRoleLabel } from "@/lib/auth/roles";
import { requireInternalAccess } from "@/lib/auth/session";
import { getInternalAssigneeOptions } from "@/lib/db/queries";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getStringValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewFamilyPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const actor = await requireInternalAccess("/families/new");
  const assignees = await getInternalAssigneeOptions(actor);
  const resolved = await searchParams;
  const message = getStringValue(resolved.message);
  const error = getStringValue(resolved.error);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <InternalSurfaceHero
        eyebrow="Family creation"
        title="Create family + first student"
        description={`One intake flow for the household, parent lead, and the first student profile. ${formatRoleLabel(actor.activeRole)} mode.`}
        variant="form"
        actions={
          <Link href="/families" className="ui-button-secondary">
            Back to families
          </Link>
        }
      >
        <span className="ui-chip" data-tone="accent">
          Household + student in one pass
        </span>
      </InternalSurfaceHero>

      <FlashBanner message={message} error={error} />

      <form action={createFamilyWithStudentAction} className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard
          eyebrow="Household"
          title="Family details"
          description="Ownership, parent access, and routing metadata."
          variant="form"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm md:col-span-2">
              <span className="font-semibold text-[var(--foreground-soft)]">Family label</span>
              <input name="familyLabel" required placeholder="Chen Family" className="ui-field" />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-semibold text-[var(--foreground-soft)]">Parent contact name</span>
              <input name="parentContactName" required className="ui-field" />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-semibold text-[var(--foreground-soft)]">Parent email</span>
              <input type="email" name="parentEmail" required className="ui-field" />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-semibold text-[var(--foreground-soft)]">Strategist owner</span>
              <select
                name="strategistOwnerId"
                defaultValue={actor.activeRole === "strategist" ? actor.profileId : ""}
                disabled={actor.activeRole === "strategist"}
                className="ui-field disabled:opacity-60"
              >
                <option value="">Assign later</option>
                {assignees.strategists.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.fullName}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-semibold text-[var(--foreground-soft)]">Ops owner</span>
              <select name="opsOwnerId" defaultValue="" className="ui-field">
                <option value="">Assign later</option>
                {assignees.ops.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.fullName}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Student"
          title="First student profile"
          description="Required posture first, optional testing context second."
          variant="form"
        >
          <div className="grid gap-4 md:grid-cols-2">
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
              <input type="number" name="currentSat" min="0" placeholder="Current SAT" className="ui-field" />
              <input type="number" name="projectedSat" min="0" placeholder="Projected SAT" className="ui-field" />
              <input type="number" name="currentAct" min="0" placeholder="Current ACT" className="ui-field" />
              <input type="number" name="projectedAct" min="0" placeholder="Projected ACT" className="ui-field" />
            </div>
            <label className="space-y-2 text-sm md:col-span-2">
              <span className="font-semibold text-[var(--foreground-soft)]">Status reason</span>
              <textarea name="statusReason" required rows={4} className="ui-field" />
            </label>
            <label className="space-y-2 text-sm md:col-span-2">
              <span className="font-semibold text-[var(--foreground-soft)]">Testing strategy note</span>
              <textarea
                name="strategyNote"
                rows={3}
                placeholder="Optional context for current or projected testing posture"
                className="ui-field"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={!isSupabaseConfigured()}
              className="ui-button-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              Create family and first student
            </button>
            {!isSupabaseConfigured() ? (
              <p className="text-sm text-[var(--foreground-soft)]">
                Live Supabase credentials are required to write real records.
              </p>
            ) : null}
          </div>
        </SectionCard>
      </form>
    </div>
  );
}
