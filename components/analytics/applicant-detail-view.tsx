import { Globe, GraduationCap, Medal, ScrollText, Sparkles } from "lucide-react";
import { SectionCard } from "@/components/shared/section-card";
import type { CollegebaseApplicantRecord, CollegebaseOtherSection } from "@/lib/domain/collegebase-analytics";

function renderSectionValue(section: CollegebaseOtherSection) {
  if (section.kind === "text") {
    return <p className="text-sm leading-7 text-[var(--foreground-soft)]">{section.value}</p>;
  }

  if (section.kind === "list") {
    return (
      <ul className="space-y-2 text-sm leading-7 text-[var(--foreground-soft)]">
        {section.value.map((item) => (
          <li key={item} className="ui-subtle-card px-4 py-3 shadow-none">
            {item}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <dl className="grid gap-3">
      {Object.entries(section.value).map(([label, value]) => (
        <div
          key={label}
          className="ui-subtle-card px-4 py-3 shadow-none"
        >
          <dt className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-soft)]">{label}</dt>
          <dd className="mt-2 text-sm leading-7 text-[var(--foreground)]">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function formatScoreLine(applicant: CollegebaseApplicantRecord) {
  const bits = [];

  if (applicant.academics.satComposite != null) {
    bits.push(`SAT ${applicant.academics.satComposite}`);
  }
  if (applicant.academics.actComposite != null) {
    bits.push(`ACT ${applicant.academics.actComposite}`);
  }
  if (applicant.academics.unweightedGpa != null) {
    bits.push(`UW GPA ${applicant.academics.unweightedGpa.toFixed(2)}`);
  }
  if (applicant.academics.weightedGpa != null) {
    bits.push(`W GPA ${applicant.academics.weightedGpa.toFixed(2)}`);
  }

  return bits.join(" • ");
}

export function ApplicantDetailView({ applicant }: { applicant: CollegebaseApplicantRecord }) {
  const acceptedSchools = applicant.schoolOutcomes
    .filter((item) => item.outcome === "accepted")
    .map((item) => item.schoolName);
  const rejectedSchools = applicant.schoolOutcomes
    .filter((item) => item.outcome === "rejected")
    .map((item) => item.schoolName);
  const optionalSections = Object.entries(applicant.otherSections).filter(
    ([key]) => key !== "Rejections" && key !== "Waitlists",
  );

  return (
    <div className="space-y-8">
      <section className="panel rounded-[2rem] px-6 py-8 md:px-8">
        <p className="ui-kicker">Extracted applicant profile</p>
        <h1 className="section-title mt-3 text-4xl font-semibold">{applicant.profileLabel}</h1>
        <p className="mt-4 max-w-4xl text-base leading-8 text-[var(--foreground-soft)]">
          {applicant.profileSubtitle}
          {applicant.overview.raceLabel ? ` • ${applicant.overview.raceLabel}` : ""}
          {applicant.overview.genderLabel ? ` • ${applicant.overview.genderLabel}` : ""}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {applicant.normalizedMajors.map((major) => (
            <span
              key={major}
              className="ui-chip"
            >
              {major}
            </span>
          ))}
          {applicant.overview.badges.map((badge) => (
            <span
              key={badge}
              className="ui-chip"
            >
              {badge}
            </span>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="ui-subtle-card p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--brand-blue)]">Scores</p>
          <p className="mt-3 text-sm leading-7">{formatScoreLine(applicant) || "No score data"}</p>
        </div>
        <div className="ui-subtle-card p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--brand-blue)]">Accepted</p>
          <p className="section-title mt-3 text-3xl font-semibold">{acceptedSchools.length}</p>
        </div>
        <div className="ui-subtle-card p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--brand-blue)]">Rejected</p>
          <p className="section-title mt-3 text-3xl font-semibold">{rejectedSchools.length}</p>
        </div>
        <div className="ui-subtle-card p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--brand-blue)]">Waitlisted</p>
          <p className="section-title mt-3 text-3xl font-semibold">{applicant.waitlistSchoolNames.length}</p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          eyebrow="Outcomes"
          title="School decisions"
          description="Accepted and rejected outcomes are separated from waitlists."
          icon={GraduationCap}
          variant="data"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="ui-subtle-card p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--brand-blue)]">Accepted</p>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--foreground-soft)]">
                {acceptedSchools.length > 0 ? (
                  acceptedSchools.map((school) => <li key={school}>{school}</li>)
                ) : (
                  <li>No accepted schools logged.</li>
                )}
              </ul>
            </div>
            <div className="ui-subtle-card p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--brand-blue)]">Rejected</p>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--foreground-soft)]">
                {rejectedSchools.length > 0 ? (
                  rejectedSchools.map((school) => <li key={school}>{school}</li>)
                ) : (
                  <li>No rejected schools logged.</li>
                )}
              </ul>
            </div>
          </div>
          {applicant.waitlistSchoolNames.length > 0 ? (
            <div className="ui-subtle-card mt-4 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--brand-blue)]">Waitlists</p>
              <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">
                {applicant.waitlistSchoolNames.join(" • ")}
              </p>
            </div>
          ) : null}
        </SectionCard>

        <SectionCard
          eyebrow="Academics"
          title="Academic snapshot"
          description="Testing, GPA, course rigor, and rank details from the extracted card."
          icon={Sparkles}
          variant="data"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <div className="ui-subtle-card p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--brand-blue)]">Unweighted GPA</p>
              <p className="mt-3 text-xl font-semibold">{applicant.academics.unweightedGpa ?? "—"}</p>
            </div>
            <div className="ui-subtle-card p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--brand-blue)]">Weighted GPA</p>
              <p className="mt-3 text-xl font-semibold">{applicant.academics.weightedGpa ?? "—"}</p>
            </div>
            <div className="ui-subtle-card p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--brand-blue)]">Class rank</p>
              <p className="mt-3 text-xl font-semibold">
                {applicant.academics.classRankDisplay ?? "Not reported"}
              </p>
            </div>
            <div className="ui-subtle-card p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--brand-blue)]">AP / IB courses</p>
              <p className="mt-3 text-xl font-semibold">
                {applicant.academics.apCourseCount ?? 0} AP • {applicant.academics.ibCourseCount ?? 0} IB
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          eyebrow="Activities"
          title="Extracurricular profile"
          description="Sorted activity descriptions from the extracted profile."
          icon={Medal}
          variant="data"
        >
          <ul className="space-y-3 text-sm leading-7 text-[var(--foreground-soft)]">
            {applicant.extracurricularItems.map((item) => (
              <li key={`${item.sortOrder}-${item.description}`} className="ui-subtle-card px-4 py-3 shadow-none">
                {item.description}
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          eyebrow="Awards"
          title="Recognition and distinctions"
          description="Awards are preserved as extracted text without extra scoring."
          icon={ScrollText}
          variant="data"
        >
          <ul className="space-y-3 text-sm leading-7 text-[var(--foreground-soft)]">
            {applicant.awardItems.length > 0 ? (
              applicant.awardItems.map((item) => (
                <li
                  key={`${item.sortOrder}-${item.description}`}
                  className="ui-subtle-card px-4 py-3 shadow-none"
                >
                  {item.description}
                </li>
              ))
            ) : (
              <li className="ui-subtle-card px-4 py-3 shadow-none">No awards listed.</li>
            )}
          </ul>
        </SectionCard>
      </div>

      {optionalSections.length > 0 ? (
        <SectionCard
          eyebrow="Profile notes"
          title="Essays, hooks, tags, and evaluations"
          description="Extracted notes remain grouped by their original section name."
          icon={Sparkles}
          variant="data"
        >
          <div className="grid gap-4 xl:grid-cols-2">
            {optionalSections.map(([label, section]) => (
              <div key={label} className="ui-subtle-card p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--brand-blue)]">{label}</p>
                <div className="mt-3">{renderSectionValue(section)}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}

      {applicant.sourceSnapshot?.url || applicant.sourceSnapshot?.title ? (
        <SectionCard
          eyebrow="Source"
          title="Extraction source"
          description="Original capture metadata for this record."
          icon={Globe}
          variant="data"
        >
          <div className="ui-subtle-card p-4 text-sm leading-7 text-[var(--foreground-soft)]">
            <p>{applicant.sourceSnapshot.title ?? "Collegebase capture"}</p>
            {applicant.sourceSnapshot.url ? <p>{applicant.sourceSnapshot.url}</p> : null}
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}
