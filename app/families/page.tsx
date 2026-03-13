import Link from "next/link";
import { Filter, Search } from "lucide-react";
import { FamiliesRoster } from "@/components/shared/families-roster";
import { FlashBanner } from "@/components/shared/flash-banner";
import { InternalSurfaceHero } from "@/components/shared/internal-surface-hero";
import { formatRoleLabel } from "@/lib/auth/roles";
import { requireInternalAccess } from "@/lib/auth/session";
import { listInternalFamilies } from "@/lib/db/queries";
import { formatDisplayDate } from "@/lib/domain/dashboard";
import type { FamilyFilters, OverallStatus, Pathway } from "@/lib/domain/types";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getStringValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function FamiliesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const actor = await requireInternalAccess("/families");
  const resolved = await searchParams;
  const message = getStringValue(resolved.message);
  const error = getStringValue(resolved.error);
  const filters: FamilyFilters = {
    search: getStringValue(resolved.search),
    strategist: getStringValue(resolved.strategist),
    pathway: getStringValue(resolved.pathway) as Pathway | "all" | undefined,
    status: getStringValue(resolved.status) as OverallStatus | "all" | undefined,
    deadlineWindow: getStringValue(resolved.window) as "all" | "7" | "30" | "overdue" | undefined,
  };

  const families = await listInternalFamilies(actor, filters);
  const strategistOptions =
    actor.activeRole === "ops"
      ? [...new Set(families.map((family) => family.strategistOwnerName))].sort()
      : [actor.fullName];
  const urgentHouseholds = families.filter(
    (family) => family.activeStatuses.includes("red") || family.overdueTaskCount > 0,
  ).length;
  const pendingDecisionHouseholds = families.filter((family) => family.pendingDecisionCount > 0).length;
  const nextDue = families
    .map((family) => family.nextCriticalDueDate)
    .filter((value): value is string => Boolean(value))
    .sort()[0];

  return (
    <div className="space-y-6">
      <InternalSurfaceHero
        eyebrow="Family roster"
        title="Household workspace roster"
        description={
          <>
            {formatRoleLabel(actor.activeRole)} view for {actor.fullName}. Compare risk, due dates, ownership, and pending decisions before opening a family cockpit.
          </>
        }
        actions={
          <>
            <Link href="/families/new" className="ui-button-primary">
              New family
            </Link>
            <Link href="/students/new" className="ui-button-secondary">
              Add student
            </Link>
          </>
        }
      >
        <span className="ui-chip" data-tone="urgent">
          {urgentHouseholds} urgent
        </span>
        <span className="ui-chip" data-tone="accent">
          {pendingDecisionHouseholds} pending decisions
        </span>
        {nextDue ? (
          <span className="ui-chip" data-tone="internal">
            Next due {formatDisplayDate(nextDue)}
          </span>
        ) : null}
      </InternalSurfaceHero>

      <FlashBanner message={message} error={error} />

      <section className="sticky top-16 z-20 lg:top-4 rounded-[2rem] border border-[var(--border)] bg-[rgba(255,253,250,0.95)] px-5 py-5 shadow-[0_14px_30px_rgba(21,40,61,0.06)] backdrop-blur">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-4 w-4 text-[var(--brand-blue)]" />
          <p className="ui-kicker">Filter rail</p>
        </div>
        <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-[var(--foreground-soft)]">Search</span>
            <div className="flex items-center gap-2 rounded-[1.25rem] border border-[var(--border)] bg-white/80 px-3 py-3">
              <Search className="h-4 w-4 text-[var(--foreground-soft)]" />
              <input
                name="search"
                defaultValue={filters.search ?? ""}
                placeholder="Family, parent, or student"
                className="w-full bg-transparent outline-none"
              />
            </div>
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-[var(--foreground-soft)]">Strategist</span>
            <select
              name="strategist"
              defaultValue={filters.strategist ?? "all"}
              disabled={actor.activeRole !== "ops"}
              className="ui-field disabled:opacity-60"
            >
              <option value="all">All strategists</option>
              {strategistOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-[var(--foreground-soft)]">Pathway</span>
            <select name="pathway" defaultValue={filters.pathway ?? "all"} className="ui-field">
              <option value="all">All pathways</option>
              <option value="us_college">US College</option>
              <option value="uk_college">UK College</option>
              <option value="us_boarding">US Boarding</option>
              <option value="uk_boarding">UK Boarding</option>
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-[var(--foreground-soft)]">Status</span>
            <select name="status" defaultValue={filters.status ?? "all"} className="ui-field">
              <option value="all">All statuses</option>
              <option value="green">Green</option>
              <option value="yellow">Yellow</option>
              <option value="red">Red</option>
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-[var(--foreground-soft)]">Deadline window</span>
            <select name="window" defaultValue={filters.deadlineWindow ?? "all"} className="ui-field">
              <option value="all">All deadlines</option>
              <option value="7">Next 7 days</option>
              <option value="30">Next 30 days</option>
              <option value="overdue">Overdue only</option>
            </select>
          </label>
          <div className="md:col-span-2 xl:col-span-5">
            <button type="submit" className="ui-button-primary">
              Apply filters
            </button>
          </div>
        </form>
      </section>

      <FamiliesRoster families={families} />
    </div>
  );
}
