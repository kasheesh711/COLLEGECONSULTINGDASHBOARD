import Link from "next/link";
import { notFound } from "next/navigation";
import { Filter, Search, School } from "lucide-react";
import { SectionCard } from "@/components/shared/section-card";
import { MetricCard } from "@/components/shared/metric-card";
import {
  addFamilyCollegeListItemAction,
} from "@/app/families/actions";
import { requireInternalAccess } from "@/lib/auth/session";
import { getInternalFamilyBySlug } from "@/lib/db/queries";
import {
  formatCollegeMoney,
  formatCollegePercent,
  getCurrentFamilyCollegeList,
  getPrimaryUsCollegeStudent,
  isCollegeScorecardConfigured,
  searchCollegeScorecard,
  suggestCollegeBucket,
} from "@/lib/domain/college-scorecard";
import { cip4Options } from "@/lib/domain/cip4";
import { collegeSearchFiltersSchema } from "@/lib/validation/schema";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getStringValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildFilters(searchParams: Record<string, string | string[] | undefined>) {
  const parsed = collegeSearchFiltersSchema.safeParse({
    familySlug: getStringValue(searchParams.family),
    query: getStringValue(searchParams.q),
    state: getStringValue(searchParams.state)?.toUpperCase(),
    city: getStringValue(searchParams.city),
    ownership: getStringValue(searchParams.ownership) ?? "all",
    sizeMin: getStringValue(searchParams.sizeMin),
    sizeMax: getStringValue(searchParams.sizeMax),
    admissionRateMin: getStringValue(searchParams.admissionRateMin),
    admissionRateMax: getStringValue(searchParams.admissionRateMax),
    satMin: getStringValue(searchParams.satMin),
    satMax: getStringValue(searchParams.satMax),
    netPriceMax: getStringValue(searchParams.netPriceMax),
    completionMin: getStringValue(searchParams.completionMin),
    retentionMin: getStringValue(searchParams.retentionMin),
    earningsMin: getStringValue(searchParams.earningsMin),
    zip: getStringValue(searchParams.zip),
    distance: getStringValue(searchParams.distance),
    programCode: getStringValue(searchParams.programCode),
    sort: getStringValue(searchParams.sort) ?? "name_asc",
    page: getStringValue(searchParams.page) ?? "0",
    perPage: getStringValue(searchParams.perPage) ?? "12",
  });

  return parsed.success ? parsed.data : { ownership: "all" as const, sort: "name_asc" as const, page: 0, perPage: 12 };
}

export default async function CollegesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const actor = await requireInternalAccess("/colleges");
  const resolved = await searchParams;
  const filters = buildFilters(resolved);
  const familySlug = filters.familySlug;
  const family = familySlug ? await getInternalFamilyBySlug(actor, familySlug) : null;
  if (familySlug && !family) notFound();

  const currentList = family ? getCurrentFamilyCollegeList(family) : null;
  const primaryUsCollegeStudent = family ? getPrimaryUsCollegeStudent(family) : null;
  const results = isCollegeScorecardConfigured() ? await searchCollegeScorecard(filters) : null;

  return (
    <div className="space-y-8">
      <section className="panel rounded-[2rem] px-6 py-8 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              College explorer
            </p>
            <h1 className="section-title mt-3 text-4xl font-semibold">College Scorecard research explorer</h1>
            <p className="mt-4 text-base leading-8 text-[var(--muted)]">
              Search bachelor’s-dominant US institutions with consultant-friendly filters, then add schools directly into a family’s current list.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {family ? (
              <Link
                href={`/families/${family.slug}`}
                className="inline-flex rounded-full border border-[var(--border)] bg-white/70 px-5 py-3 text-sm font-semibold"
              >
                Back to family
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {family ? (
        <SectionCard
          eyebrow="Family context"
          title={family.familyLabel}
          description="Explorer actions stay family-aware when opened from a workspace."
          icon={School}
        >
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-[1.5rem] bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Primary applicant</p>
              <p className="mt-2 font-semibold">{primaryUsCollegeStudent?.studentName ?? "No US college applicant"}</p>
            </div>
            <div className="rounded-[1.5rem] bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Current list</p>
              <p className="mt-2 font-semibold">{currentList?.listName ?? "No list yet"}</p>
            </div>
            <div className="rounded-[1.5rem] bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Testing</p>
              <p className="mt-2 font-semibold">
                {family.collegeStrategyProfile?.currentSat ?? primaryUsCollegeStudent?.testingProfile?.currentSat ?? "—"}
                {family.collegeStrategyProfile?.projectedSat || primaryUsCollegeStudent?.testingProfile?.projectedSat
                  ? ` -> ${
                      family.collegeStrategyProfile?.projectedSat ??
                      primaryUsCollegeStudent?.testingProfile?.projectedSat
                    }`
                  : ""}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Majors</p>
              <p className="mt-2 font-semibold">
                {family.collegeStrategyProfile?.intendedMajorLabels.join(" • ") || "Not set"}
              </p>
            </div>
          </div>
        </SectionCard>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Search mode"
          value="Bachelor's"
          helper="Scorecard search always scopes to bachelor’s-dominant institutions"
        />
        <MetricCard
          label="Programs"
          value={filters.programCode ? "Major-aware" : "All majors"}
          helper="Controlled CIP-4 picker, not free text"
        />
        <MetricCard
          label="Current page"
          value={String((results?.page ?? filters.page ?? 0) + 1)}
          helper={`${results?.perPage ?? filters.perPage ?? 12} schools per page`}
        />
        <MetricCard
          label="Results"
          value={String(results?.total ?? 0)}
          helper="Matches returned by the College Scorecard API"
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <SectionCard
          eyebrow="Filters"
          title="Research filter rail"
          description="Explorer state lives in the URL so searches stay shareable and deterministic."
          icon={Filter}
        >
          <form className="space-y-4">
            {family ? <input type="hidden" name="family" value={family.slug} /> : null}
            <label className="block text-sm">
              <span className="mb-2 block font-semibold text-[var(--muted)]">School name</span>
              <div className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-white/70 px-3 py-3">
                <Search className="h-4 w-4 text-[var(--muted)]" />
                <input
                  name="q"
                  defaultValue={filters.query ?? ""}
                  placeholder="School name"
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </label>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <label className="block text-sm">
                <span className="mb-2 block font-semibold text-[var(--muted)]">State</span>
                <input
                  name="state"
                  defaultValue={filters.state ?? ""}
                  placeholder="MA"
                  className="w-full rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-3 outline-none"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-2 block font-semibold text-[var(--muted)]">City</span>
                <input
                  name="city"
                  defaultValue={filters.city ?? ""}
                  placeholder="Boston"
                  className="w-full rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-3 outline-none"
                />
              </label>
            </div>
            <label className="block text-sm">
              <span className="mb-2 block font-semibold text-[var(--muted)]">Major / CIP-4</span>
              <select
                name="programCode"
                defaultValue={filters.programCode ?? ""}
                className="w-full rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-3 outline-none"
              >
                <option value="">All majors</option>
                {cip4Options.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-2 block font-semibold text-[var(--muted)]">Ownership</span>
              <select
                name="ownership"
                defaultValue={filters.ownership ?? "all"}
                className="w-full rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-3 outline-none"
              >
                <option value="all">All ownership types</option>
                <option value="Public">Public</option>
                <option value="Private nonprofit">Private nonprofit</option>
                <option value="Private for-profit">Private for-profit</option>
              </select>
            </label>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <label className="block text-sm">
                <span className="mb-2 block font-semibold text-[var(--muted)]">SAT min / max</span>
                <div className="grid grid-cols-2 gap-3">
                  <input name="satMin" defaultValue={filters.satMin ?? ""} placeholder="1350" className="w-full rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-3 outline-none" />
                  <input name="satMax" defaultValue={filters.satMax ?? ""} placeholder="1550" className="w-full rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-3 outline-none" />
                </div>
              </label>
              <label className="block text-sm">
                <span className="mb-2 block font-semibold text-[var(--muted)]">Admission % min / max</span>
                <div className="grid grid-cols-2 gap-3">
                  <input name="admissionRateMin" defaultValue={filters.admissionRateMin != null ? Math.round(filters.admissionRateMin * 100) : ""} placeholder="5" className="w-full rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-3 outline-none" />
                  <input name="admissionRateMax" defaultValue={filters.admissionRateMax != null ? Math.round(filters.admissionRateMax * 100) : ""} placeholder="25" className="w-full rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-3 outline-none" />
                </div>
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <label className="block text-sm">
                <span className="mb-2 block font-semibold text-[var(--muted)]">Size min / max</span>
                <div className="grid grid-cols-2 gap-3">
                  <input name="sizeMin" defaultValue={filters.sizeMin ?? ""} placeholder="5000" className="w-full rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-3 outline-none" />
                  <input name="sizeMax" defaultValue={filters.sizeMax ?? ""} placeholder="30000" className="w-full rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-3 outline-none" />
                </div>
              </label>
              <label className="block text-sm">
                <span className="mb-2 block font-semibold text-[var(--muted)]">Net price max</span>
                <input
                  name="netPriceMax"
                  defaultValue={filters.netPriceMax ?? ""}
                  placeholder="35000"
                  className="w-full rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-3 outline-none"
                />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <label className="block text-sm">
                <span className="mb-2 block font-semibold text-[var(--muted)]">Completion min %</span>
                <input name="completionMin" defaultValue={filters.completionMin != null ? Math.round(filters.completionMin * 100) : ""} placeholder="80" className="w-full rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-3 outline-none" />
              </label>
              <label className="block text-sm">
                <span className="mb-2 block font-semibold text-[var(--muted)]">Retention min %</span>
                <input name="retentionMin" defaultValue={filters.retentionMin != null ? Math.round(filters.retentionMin * 100) : ""} placeholder="90" className="w-full rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-3 outline-none" />
              </label>
            </div>
            <label className="block text-sm">
              <span className="mb-2 block font-semibold text-[var(--muted)]">Earnings min</span>
              <input
                name="earningsMin"
                defaultValue={filters.earningsMin ?? ""}
                placeholder="70000"
                className="w-full rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-3 outline-none"
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <label className="block text-sm">
                <span className="mb-2 block font-semibold text-[var(--muted)]">ZIP</span>
                <input name="zip" defaultValue={filters.zip ?? ""} placeholder="10001" className="w-full rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-3 outline-none" />
              </label>
              <label className="block text-sm">
                <span className="mb-2 block font-semibold text-[var(--muted)]">Distance</span>
                <input name="distance" defaultValue={filters.distance ?? ""} placeholder="25mi" className="w-full rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-3 outline-none" />
              </label>
            </div>
            <label className="block text-sm">
              <span className="mb-2 block font-semibold text-[var(--muted)]">Sort</span>
              <select name="sort" defaultValue={filters.sort ?? "name_asc"} className="w-full rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-3 outline-none">
                <option value="name_asc">Name</option>
                <option value="admission_rate_asc">Admission rate (lowest first)</option>
                <option value="admission_rate_desc">Admission rate (highest first)</option>
                <option value="sat_average_desc">SAT average</option>
                <option value="net_price_asc">Net price</option>
                <option value="earnings_desc">Earnings</option>
                <option value="completion_desc">Completion</option>
                <option value="size_desc">Student size</option>
              </select>
            </label>
            <button
              type="submit"
              className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
            >
              Apply filters
            </button>
          </form>
        </SectionCard>

        <SectionCard
          eyebrow="Results"
          title="Search results feed"
          description="Research results stay card-based and warm-toned rather than dropping into a generic search grid."
          icon={School}
        >
          {!isCollegeScorecardConfigured() ? (
            <div className="rounded-[1.5rem] bg-[var(--warn-soft)] p-5 text-sm leading-7 text-[var(--warn)]">
              Add `COLLEGE_SCORECARD_API_KEY` to `.env.local` to load live college data.
            </div>
          ) : results?.results.length === 0 ? (
            <div className="rounded-[1.5rem] bg-white/70 p-5 text-sm leading-7 text-[var(--muted)]">
              No schools matched the current filter set.
            </div>
          ) : (
            <div className="space-y-4">
              {results?.results.map((school) => {
                const suggestion = suggestCollegeBucket(family?.collegeStrategyProfile, school);
                return (
                  <article key={school.scorecardSchoolId} className="rounded-[1.75rem] border border-[var(--border)] bg-white/70 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-2xl font-semibold">{school.schoolName}</h2>
                          <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                            {school.ownership}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--muted)]">
                          {school.city}, {school.state}
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                          <div className="rounded-[1.25rem] bg-[var(--background-soft)] px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Admission</p>
                            <p className="mt-2 font-semibold">{formatCollegePercent(school.admissionRate)}</p>
                          </div>
                          <div className="rounded-[1.25rem] bg-[var(--background-soft)] px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">SAT avg</p>
                            <p className="mt-2 font-semibold">{school.satAverage ?? "—"}</p>
                          </div>
                          <div className="rounded-[1.25rem] bg-[var(--background-soft)] px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Net price</p>
                            <p className="mt-2 font-semibold">{formatCollegeMoney(school.averageNetPrice)}</p>
                          </div>
                          <div className="rounded-[1.25rem] bg-[var(--background-soft)] px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Completion</p>
                            <p className="mt-2 font-semibold">{formatCollegePercent(school.completionRate)}</p>
                          </div>
                          <div className="rounded-[1.25rem] bg-[var(--background-soft)] px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">10y earnings</p>
                            <p className="mt-2 font-semibold">{formatCollegeMoney(school.medianEarnings)}</p>
                          </div>
                        </div>
                        {school.matchedPrograms.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {school.matchedPrograms.map((program) => (
                              <span
                                key={`${school.scorecardSchoolId}-${program.code}`}
                                className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]"
                              >
                                {program.title}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        <p className="text-sm leading-7 text-[var(--muted)]">{suggestion.fitRationale}</p>
                      </div>
                      <div className="min-w-[240px] space-y-3 rounded-[1.5rem] bg-[var(--background-soft)] p-4">
                        <p className="text-sm font-semibold">
                          Suggested bucket: <span className="text-[var(--accent)]">{suggestion.bucket}</span>
                        </p>
                        <p className="text-sm text-[var(--muted)]">Fit score {suggestion.fitScore}</p>
                        {family && currentList ? (
                          <form action={addFamilyCollegeListItemAction}>
                            <input type="hidden" name="familyId" value={family.id} />
                            <input type="hidden" name="familySlug" value={family.slug} />
                            <input type="hidden" name="familyCollegeListId" value={currentList.id} />
                            <input type="hidden" name="returnPath" value={`/colleges?family=${family.slug}`} />
                            <input type="hidden" name="scorecardSchoolId" value={school.scorecardSchoolId} />
                            <input type="hidden" name="schoolName" value={school.schoolName} />
                            <input type="hidden" name="city" value={school.city} />
                            <input type="hidden" name="state" value={school.state} />
                            <input type="hidden" name="ownership" value={school.ownership} />
                            <input type="hidden" name="studentSize" value={school.studentSize ?? ""} />
                            <input type="hidden" name="admissionRate" value={school.admissionRate ?? ""} />
                            <input type="hidden" name="satAverage" value={school.satAverage ?? ""} />
                            <input type="hidden" name="completionRate" value={school.completionRate ?? ""} />
                            <input type="hidden" name="retentionRate" value={school.retentionRate ?? ""} />
                            <input type="hidden" name="averageNetPrice" value={school.averageNetPrice ?? ""} />
                            <input type="hidden" name="medianEarnings" value={school.medianEarnings ?? ""} />
                            {school.matchedPrograms.map((program) => (
                              <input key={`${program.code}-code`} type="hidden" name="matchedProgramCodes" value={program.code} />
                            ))}
                            {school.matchedPrograms.map((program) => (
                              <input key={`${program.code}-label`} type="hidden" name="matchedProgramLabels" value={program.title} />
                            ))}
                            <input type="hidden" name="bucket" value={suggestion.bucket} />
                            <input type="hidden" name="bucketSource" value="system" />
                            <input type="hidden" name="fitScore" value={suggestion.fitScore} />
                            <input type="hidden" name="fitRationale" value={suggestion.fitRationale} />
                            <button type="submit" className="w-full rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">
                              Add to current list
                            </button>
                          </form>
                        ) : family ? (
                          <div className="rounded-[1rem] bg-white p-3 text-sm text-[var(--muted)]">
                            Create a current named list in the family workspace to enable add actions.
                          </div>
                        ) : (
                          <div className="rounded-[1rem] bg-white p-3 text-sm text-[var(--muted)]">
                            Open this explorer from a family workspace to add schools directly into a list.
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
