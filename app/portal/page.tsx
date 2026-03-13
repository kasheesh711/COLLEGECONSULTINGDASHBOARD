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
        <section className="panel rounded-[2rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,244,239,0.94))] px-6 py-8 md:px-8">
          <p className="ui-kicker">Invited parent pilot</p>
          <h1 className="section-title mt-4 text-4xl font-semibold">
            This view is reserved for linked parent accounts
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--foreground-soft)]">
            The parent portal stays read-only and available only to invited households already linked by the internal team.
          </p>
        </section>
      </div>
    );
  }

  if (!portal) {
    return (
      <section className="panel rounded-[2rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,244,239,0.94))] px-6 py-8 md:px-8">
        <p className="ui-kicker">Invited parent pilot</p>
        <h1 className="section-title mt-3 text-4xl font-semibold">
          This account is not linked to a pilot household yet
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--foreground-soft)]">
          Once the internal team completes the household link, this page will show the parent-safe monthly view for that family only.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <section className="panel rounded-[2rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,244,239,0.94))] px-6 py-8 md:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="ui-kicker">Invited parent pilot</p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="section-title text-4xl font-semibold">{portal.family.familyLabel}</h1>
              <StatusBadge status={portal.family.overallStatus} />
            </div>
            <p className="text-base leading-8 text-[var(--foreground-soft)]">
              A read-only monthly digest for {portal.family.parentContactName}, grouped by student and limited to parent-safe updates, decisions, tasks, and shared resources.
            </p>
          </div>
          <div className="grid gap-3 rounded-[1.75rem] border border-[var(--border)] bg-white/82 p-5 text-sm text-[var(--foreground-soft)] sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-blue)]">Pilot scope</p>
              <p className="mt-2">Invited household only</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-blue)]">Portal mode</p>
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
            variant="portal"
          >
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="ui-subtle-card p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                  This month at a glance
                </p>
                <p className="mt-3 text-sm leading-8 text-[var(--foreground-soft)]">
                  {student.currentSummary?.parentVisibleSummary ?? "No student summary is available yet."}
                </p>
              </div>
              <div className="ui-subtle-card p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                  What stays visible
                </p>
                <div className="mt-3 space-y-2 text-sm leading-7 text-[var(--foreground-soft)]">
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
                variant="portal"
              >
                {student.academicUpdate ? (
                  <div className="space-y-3 text-sm leading-7 text-[var(--foreground-soft)]">
                    <p><strong className="text-[var(--foreground)]">Priority:</strong> {student.academicUpdate.subjectPriority}</p>
                    <p><strong className="text-[var(--foreground)]">Trend:</strong> {student.academicUpdate.gradeOrPredictedTrend}</p>
                    <p><strong className="text-[var(--foreground)]">Tutoring status:</strong> {student.academicUpdate.tutoringStatus}</p>
                    <p>{student.academicUpdate.tutorNoteSummary}</p>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--foreground-soft)]">No academic update available yet.</p>
                )}
              </SectionCard>

              <SectionCard
                eyebrow="Profile"
                title="Project and profile progress"
                description="Latest parent-visible profile signal."
                icon={Sparkles}
                variant="portal"
              >
                {student.profileUpdate ? (
                  <div className="space-y-3 text-sm leading-7 text-[var(--foreground-soft)]">
                    <p><strong className="text-[var(--foreground)]">Current project:</strong> {student.profileUpdate.projectName}</p>
                    <p><strong className="text-[var(--foreground)]">Milestone:</strong> {student.profileUpdate.milestoneStatus}</p>
                    <p>{student.profileUpdate.mentorNoteSummary}</p>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--foreground-soft)]">No profile update available yet.</p>
                )}
              </SectionCard>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <SectionCard
                eyebrow="Deadlines"
                title="Upcoming visible work"
                description="Only student tasks marked parent-visible are shown."
                icon={Orbit}
                variant="portal"
              >
                <div className="space-y-3">
                  {student.tasks.length === 0 ? (
                    <p className="text-sm text-[var(--foreground-soft)]">No visible tasks right now.</p>
                  ) : (
                    student.tasks.map((task) => (
                      <div key={task.id} className="ui-subtle-card p-5">
                        <p className="font-semibold">{task.itemName}</p>
                        <p className="mt-2 text-sm leading-7 text-[var(--foreground-soft)]">Owner: {task.owner}</p>
                        <p className="text-sm text-[var(--foreground-soft)]">Due {formatDisplayDate(task.dueDate)}</p>
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
                variant="portal"
              >
                <div className="space-y-3">
                  {student.decisions.length === 0 ? (
                    <p className="text-sm text-[var(--foreground-soft)]">No open student decisions right now.</p>
                  ) : (
                    student.decisions.map((decision) => (
                      <div key={decision.id} className="ui-subtle-card p-5">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="font-semibold">{decision.decisionType}</p>
                          {decision.pendingFamilyInput ? (
                            <span className="rounded-full bg-[var(--warn-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--warn)]">
                              Family input needed
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">{decision.summary}</p>
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
              variant="portal"
            >
              <div className="grid gap-4 md:grid-cols-2">
                {student.artifactLinks.length === 0 ? (
                  <p className="text-sm text-[var(--foreground-soft)]">No visible links yet.</p>
                ) : (
                  student.artifactLinks.map((artifact) => (
                    <a
                      key={artifact.id}
                      href={artifact.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-[1.75rem] border border-[var(--border)] bg-white/78 p-5 transition hover:bg-white"
                    >
                      <p className="font-semibold">{artifact.artifactName}</p>
                      <p className="mt-2 text-sm text-[var(--foreground-soft)]">
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
                variant="portal"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  {student.summaryHistory.map((summary) => (
                    <div key={summary.id} className="ui-subtle-card p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                        {formatDisplayDate(summary.reportingMonth)}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">{summary.parentVisibleSummary}</p>
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
          variant="portal"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              {portal.familyDecisions.map((decision) => (
                <div key={decision.id} className="ui-subtle-card p-5">
                  <p className="font-semibold">{decision.decisionType}</p>
                  <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">{decision.summary}</p>
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
                  className="ui-subtle-card block p-5 transition hover:bg-white"
                >
                  <p className="font-semibold">{artifact.artifactName}</p>
                  <p className="mt-2 text-sm text-[var(--foreground-soft)]">{artifact.artifactType.replace("_", " ")}</p>
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
                  : "border border-[var(--border)] bg-white text-[var(--foreground)]"
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
