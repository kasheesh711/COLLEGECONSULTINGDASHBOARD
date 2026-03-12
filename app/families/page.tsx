import Link from "next/link";
import { Filter, Search } from "lucide-react";
import { FlashBanner } from "@/components/shared/flash-banner";
import { FamiliesRoster } from "@/components/shared/families-roster";
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
    <div className="space-y-8">
      <InternalSurfaceHero
        eyebrow="Family list"
        title="Household workspace roster"
        description={
          <>
            Signed in as {actor.fullName}. Current mode: {formatRoleLabel(actor.activeRole)}. This
            roster is optimized for quick household comparison, with risk, due dates, and pending
            decisions visible before you open a case.
          </>
        }
        actions={
          <>
            <Link
              href="/families/new"
              className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
            >
              New family
            </Link>
            <Link
              href="/students/new"
              className="rounded-full border border-[var(--border)] bg-white/70 px-5 py-3 text-sm font-semibold"
            >
              Add student
            </Link>
          </>
        }
      >
        <span className="rounded-full bg-[var(--danger-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--danger)]">
          {urgentHouseholds} urgent households
        </span>
        <span className="rounded-full bg-[var(--warn-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--warn)]">
          {pendingDecisionHouseholds} with pending decisions
        </span>
        {nextDue ? (
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Next critical due {formatDisplayDate(nextDue)}
          </span>
        ) : null}
      </InternalSurfaceHero>

      <FlashBanner message={message} error={error} />

      <section className="sticky top-20 z-10 rounded-[2rem] border border-[var(--border)] bg-white/90 px-5 py-5 shadow-sm backdrop-blur">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-4 w-4 text-[var(--muted)]" />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Sticky filters
          </p>
        </div>
        <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-[var(--muted)]">Search</span>
            <div className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-white/70 px-3 py-3">
              <Search className="h-4 w-4 text-[var(--muted)]" />
              <input
                name="search"
                defaultValue={filters.search ?? ""}
                placeholder="Family, parent, or student"
                className="w-full bg-transparent outline-none"
              />
            </div>
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-[var(--muted)]">Strategist</span>
            <select
              name="strategist"
              defaultValue={filters.strategist ?? "all"}
              disabled={actor.activeRole !== "ops"}
              className="w-full rounded-2xl border border-[var(--border)] bg-white/70 px-3 py-3 outline-none disabled:opacity-60"
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
            <span className="font-semibold text-[var(--muted)]">Pathway</span>
            <select
              name="pathway"
              defaultValue={filters.pathway ?? "all"}
              className="w-full rounded-2xl border border-[var(--border)] bg-white/70 px-3 py-3 outline-none"
            >
              <option value="all">All pathways</option>
              <option value="us_college">US College</option>
              <option value="uk_college">UK College</option>
              <option value="us_boarding">US Boarding</option>
              <option value="uk_boarding">UK Boarding</option>
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-[var(--muted)]">Status</span>
            <select
              name="status"
              defaultValue={filters.status ?? "all"}
              className="w-full rounded-2xl border border-[var(--border)] bg-white/70 px-3 py-3 outline-none"
            >
              <option value="all">All statuses</option>
              <option value="green">Green</option>
              <option value="yellow">Yellow</option>
              <option value="red">Red</option>
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-[var(--muted)]">Deadline window</span>
            <select
              name="window"
              defaultValue={filters.deadlineWindow ?? "all"}
              className="w-full rounded-2xl border border-[var(--border)] bg-white/70 px-3 py-3 outline-none"
            >
              <option value="all">All deadlines</option>
              <option value="7">Next 7 days</option>
              <option value="30">Next 30 days</option>
              <option value="overdue">Overdue only</option>
            </select>
          </label>
          <div className="md:col-span-2 xl:col-span-5">
            <button
              type="submit"
              className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
            >
              Apply filters
            </button>
          </div>
        </form>
      </section>

      <FamiliesRoster families={families} />
    </div>
  );
}
