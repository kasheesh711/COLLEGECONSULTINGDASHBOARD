import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ApplicantDetailView } from "@/components/analytics/applicant-detail-view";
import { requireInternalAccess } from "@/lib/auth/session";
import { loadCollegebaseAnalyticsDataset } from "@/lib/domain/collegebase-analytics";
import { resolveCollegebaseAnalyticsReturnHref } from "@/lib/reporting/collegebase-analytics";

type Params = Promise<{ sourceId: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getStringValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AnalyticsApplicantDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { sourceId } = await params;
  const resolvedSearchParams = await searchParams;
  await requireInternalAccess(`/analytics/applicants/${sourceId}`);
  const returnHref = resolveCollegebaseAnalyticsReturnHref(resolvedSearchParams.returnTo);
  const selectedSchool = getStringValue(resolvedSearchParams.school);
  const rosterOutcome = getStringValue(resolvedSearchParams.rosterOutcome);

  let dataset = null;
  let loadError: string | null = null;

  try {
    dataset = await loadCollegebaseAnalyticsDataset();
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Unable to load the local Collegebase analytics dataset.";
  }

  if (!dataset) {
    return (
      <div className="panel rounded-[2rem] p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
          Extracted profile
        </p>
        <h1 className="section-title mt-3 text-3xl font-semibold">Applicant detail is unavailable</h1>
        <p className="mt-4 text-base leading-8 text-[var(--muted)]">{loadError}</p>
      </div>
    );
  }

  const applicant = dataset.records.find((item) => item.sourceId === sourceId);
  if (!applicant) notFound();

  return (
    <div className="space-y-6">
      <Link
        href={returnHref}
        className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to filtered analytics view
      </Link>
      {selectedSchool ? (
        <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/80 px-4 py-4 text-sm text-[var(--muted)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em]">School context</p>
          <p className="mt-2">
            Opened from the {rosterOutcome ?? "school"} cohort for <span className="font-semibold text-[var(--foreground)]">{selectedSchool}</span>.
          </p>
        </div>
      ) : null}
      <ApplicantDetailView applicant={applicant} />
    </div>
  );
}
