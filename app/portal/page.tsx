import Link from "next/link";
import { LockKeyhole, NotebookPen, Orbit, Sparkles } from "lucide-react";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getPortalAccess } from "@/lib/auth/session";
import { getParentPortalSnapshot } from "@/lib/db/queries";
import { formatDisplayDate } from "@/lib/domain/dashboard";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getStringValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatPathwayLabel(pathway: string) {
  return pathway
    .split("_")
    .map((part) => part.toUpperCase())
    .join(" ");
}

export default async function PortalPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolved = await searchParams;
  const familySlug = getStringValue(resolved.family);
  const access = await getPortalAccess("/portal");
  const portal = await getParentPortalSnapshot(access, familySlug);

  if (access.mode === "live" && !access.enabled) {
    return (
      <div className="space-y-8">
        <section className="panel rounded-[2rem] px-6 py-8 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            Invited parent pilot
          </p>
          <h1 className="section-title mt-3 text-4xl font-semibold">
            This view is reserved for linked parent accounts
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted)]">
            The soft-launch portal is read-only and limited to invited households that have already
            been linked by the internal team.
          </p>
        </section>
      </div>
    );
  }

  if (!portal) {
    return (
      <section className="panel rounded-[2rem] px-6 py-8 md:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
          Invited parent pilot
        </p>
        <h1 className="section-title mt-3 text-4xl font-semibold">
          This account is not linked to a pilot household yet
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted)]">
          Once the internal team completes the household link, this page will show the parent-safe
          monthly view for that family only.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <section className="panel rounded-[2rem] px-6 py-8 md:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              Invited parent pilot
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="section-title text-4xl font-semibold">{portal.family.familyLabel}</h1>
              <StatusBadge status={portal.family.overallStatus} />
            </div>
            <p className="text-base leading-8 text-[var(--muted)]">
              A read-only monthly digest for {portal.family.parentContactName}, grouped by student
              and limited to parent-safe updates, decisions, tasks, and shared resources.
            </p>
          </div>
          <div className="grid gap-3 rounded-[1.75rem] bg-white/70 p-5 text-sm text-[var(--muted)] sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em]">Pilot scope</p>
              <p className="mt-2">Invited household only</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em]">Portal mode</p>
              <p className="mt-2">Read-only for {portal.students.length} student{portal.students.length === 1 ? "" : "s"}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-6">
        {portal.students.map((student) => (
          <SectionCard
            key={student.id}
            eyebrow={student.gradeLevel}
            title={student.studentName}
            description={`${formatPathwayLabel(student.pathway)} • ${student.currentPhase}`}
            icon={LockKeyhole}
          >
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[1.75rem] bg-white/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  This month at a glance
                </p>
                <p className="mt-3 text-sm leading-8 text-[var(--muted)]">
                  {student.currentSummary?.parentVisibleSummary ?? "No student summary is available yet."}
                </p>
              </div>
              <div className="rounded-[1.75rem] bg-white/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  What stays visible
                </p>
                <div className="mt-3 space-y-2 text-sm leading-7 text-[var(--muted)]">
                  <p>{student.tasks.length} visible task{student.tasks.length === 1 ? "" : "s"}</p>
                  <p>{student.decisions.length} open decision{student.decisions.length === 1 ? "" : "s"}</p>
                  <p>{student.artifactLinks.length} shared resource{student.artifactLinks.length === 1 ? "" : "s"}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <SectionCard
                eyebrow="Academics"
                title="Latest academic snapshot"
                description="Only parent-visible tutoring and academic updates appear here."
                icon={NotebookPen}
              >
                {student.academicUpdate ? (
                  <div className="space-y-3 text-sm leading-7 text-[var(--muted)]">
                    <p><strong className="text-[var(--foreground)]">Priority:</strong> {student.academicUpdate.subjectPriority}</p>
                    <p><strong className="text-[var(--foreground)]">Trend:</strong> {student.academicUpdate.gradeOrPredictedTrend}</p>
                    <p><strong className="text-[var(--foreground)]">Tutoring status:</strong> {student.academicUpdate.tutoringStatus}</p>
                    <p>{student.academicUpdate.tutorNoteSummary}</p>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--muted)]">No academic update available yet.</p>
                )}
              </SectionCard>

              <SectionCard
                eyebrow="Profile"
                title="Project and profile progress"
                description="Latest parent-visible profile signal."
                icon={Sparkles}
              >
                {student.profileUpdate ? (
                  <div className="space-y-3 text-sm leading-7 text-[var(--muted)]">
                    <p><strong className="text-[var(--foreground)]">Current project:</strong> {student.profileUpdate.projectName}</p>
                    <p><strong className="text-[var(--foreground)]">Milestone:</strong> {student.profileUpdate.milestoneStatus}</p>
                    <p>{student.profileUpdate.mentorNoteSummary}</p>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--muted)]">No profile update available yet.</p>
                )}
              </SectionCard>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <SectionCard
                eyebrow="Deadlines"
                title="Upcoming visible work"
                description="Only student tasks marked parent-visible are shown."
                icon={Orbit}
              >
                <div className="space-y-3">
                  {student.tasks.length === 0 ? (
                    <p className="text-sm text-[var(--muted)]">No visible tasks right now.</p>
                  ) : (
                    student.tasks.map((task) => (
                      <div key={task.id} className="rounded-[1.75rem] bg-white/70 p-5">
                        <p className="font-semibold">{task.itemName}</p>
                        <p className="mt-2 text-sm leading-7 text-[var(--muted)]">Owner: {task.owner}</p>
                        <p className="text-sm text-[var(--muted)]">Due {formatDisplayDate(task.dueDate)}</p>
                      </div>
                    ))
                  )}
                </div>
              </SectionCard>

              <SectionCard
                eyebrow="Family input"
                title="Open decisions"
                description="Items awaiting household confirmation remain visible until resolved."
                icon={LockKeyhole}
              >
                <div className="space-y-3">
                  {student.decisions.length === 0 ? (
                    <p className="text-sm text-[var(--muted)]">No open student decisions right now.</p>
                  ) : (
                    student.decisions.map((decision) => (
                      <div key={decision.id} className="rounded-[1.75rem] bg-white/70 p-5">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="font-semibold">{decision.decisionType}</p>
                          {decision.pendingFamilyInput ? (
                            <span className="rounded-full bg-[var(--warn-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--warn)]">
                              Family input needed
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{decision.summary}</p>
                      </div>
                    ))
                  )}
                </div>
              </SectionCard>
            </div>

            <SectionCard
              eyebrow="Resources"
              title="Selected links"
              description="Google Drive remains the source of truth for shared artifacts."
              icon={NotebookPen}
            >
              <div className="grid gap-4 md:grid-cols-2">
                {student.artifactLinks.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">No visible links yet.</p>
                ) : (
                  student.artifactLinks.map((artifact) => (
                    <a
                      key={artifact.id}
                      href={artifact.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-[1.75rem] border border-[var(--border)] bg-white/70 p-5 transition hover:bg-white"
                    >
                      <p className="font-semibold">{artifact.artifactName}</p>
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        {artifact.artifactType.replace("_", " ")}
                      </p>
                    </a>
                  ))
                )}
              </div>
            </SectionCard>

            {student.summaryHistory.length > 0 ? (
              <SectionCard
                eyebrow="Archive"
                title="Prior monthly summaries"
                description="Monthly history stays visible instead of being overwritten."
                icon={Sparkles}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  {student.summaryHistory.map((summary) => (
                    <div key={summary.id} className="rounded-[1.75rem] bg-white/70 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                        {formatDisplayDate(summary.reportingMonth)}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{summary.parentVisibleSummary}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            ) : null}
          </SectionCard>
        ))}
      </div>

      {portal.familyDecisions.length > 0 || portal.familyArtifactLinks.length > 0 ? (
        <SectionCard
          eyebrow="Household"
          title="Shared family context"
          description="Family-wide resources and decisions remain visible below the student sections."
          icon={LockKeyhole}
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              {portal.familyDecisions.map((decision) => (
                <div key={decision.id} className="rounded-[1.75rem] bg-white/70 p-5">
                  <p className="font-semibold">{decision.decisionType}</p>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{decision.summary}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {portal.familyArtifactLinks.map((artifact) => (
                <a
                  key={artifact.id}
                  href={artifact.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-[1.75rem] border border-[var(--border)] bg-white/70 p-5 transition hover:bg-white"
                >
                  <p className="font-semibold">{artifact.artifactName}</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">{artifact.artifactType.replace("_", " ")}</p>
                </a>
              ))}
            </div>
          </div>
        </SectionCard>
      ) : null}

      {access.mode === "demo" ? (
        <div className="flex flex-wrap gap-3">
          {portal.availableSlugs.map((slug) => (
            <Link
              key={slug}
              href={`/portal?family=${slug}`}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                slug === portal.family.slug
                  ? "bg-[var(--accent)] text-white"
                  : "border border-[var(--border)] bg-white/70 text-[var(--foreground)]"
              }`}
            >
              Preview household: {slug}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
