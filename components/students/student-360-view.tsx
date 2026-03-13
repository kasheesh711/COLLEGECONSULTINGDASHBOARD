import Link from "next/link";
import {
  Activity,
  BookMarked,
  CalendarClock,
  Files,
  Flag,
  GraduationCap,
  LineChart,
  MessageSquare,
  School,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { FlashBanner } from "@/components/shared/flash-banner";
import { MetricCard } from "@/components/shared/metric-card";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  buildStudent360ViewModel,
  getRecordVisibilityTone,
} from "@/components/students/student-360-view-model";
import {
  saveAcademicUpdateAction,
  saveArtifactLinkAction,
  saveDecisionAction,
  saveMonthlySummaryAction,
  saveNoteAction,
  saveProfileUpdateAction,
  saveStudentActivityAction,
  saveStudentCompetitionAction,
  saveStudentSchoolTargetAction,
  saveTaskAction,
  saveTestingProfileAction,
} from "@/app/families/actions";
import { isSupabaseConfigured } from "@/lib/auth/config";
import { formatRoleLabel } from "@/lib/auth/roles";
import { computeTaskStatus, formatDisplayDate } from "@/lib/domain/dashboard";
import type { AppRole, StudentPortfolio } from "@/lib/domain/types";

type Student360ViewProps = {
  actorRole: AppRole;
  portfolio: StudentPortfolio;
  message?: string;
  error?: string;
};

const fieldClass = "ui-field w-full";
const submitButtonClass = "ui-button-primary disabled:cursor-not-allowed disabled:opacity-60";
const checkboxLabelClass = "flex items-center gap-2 text-sm text-[var(--foreground-soft)]";

function getStringLabel(value: string) {
  return value.replaceAll("_", " ");
}

function StudentScopedHiddenInputs({
  familyId,
  familySlug,
  studentId,
  studentSlug,
  returnPath,
}: {
  familyId: string;
  familySlug: string;
  studentId: string;
  studentSlug: string;
  returnPath: string;
}) {
  return (
    <>
      <input type="hidden" name="familyId" value={familyId} />
      <input type="hidden" name="familySlug" value={familySlug} />
      <input type="hidden" name="studentId" value={studentId} />
      <input type="hidden" name="studentSlug" value={studentSlug} />
      <input type="hidden" name="returnPath" value={returnPath} />
    </>
  );
}

function SectionEmpty({ copy }: { copy: string }) {
  return <div className="ui-subtle-card p-4 text-sm text-[var(--foreground-soft)]">{copy}</div>;
}

function Composer({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details className="mt-5 rounded-[1.5rem] border border-[var(--border)] bg-[var(--background-soft)]/78 p-4">
      <summary className="cursor-pointer text-sm font-semibold uppercase tracking-[0.16em] text-[var(--brand-blue)]">
        {title}
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}

function AnchorRail() {
  const items = [
    { href: "#posture", label: "Posture", icon: Sparkles },
    { href: "#testing", label: "Testing", icon: LineChart },
    { href: "#academics", label: "Academics", icon: BookMarked },
    { href: "#activities", label: "Activities", icon: Activity },
    { href: "#targets", label: "Targets", icon: Target },
    { href: "#execution", label: "Execution", icon: CalendarClock },
    { href: "#notes", label: "Notes", icon: MessageSquare },
    { href: "#family-context", label: "Family context", icon: Users },
  ];

  return (
    <div className="mt-5 space-y-3">
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href}
          className="ui-subtle-card flex items-center justify-between px-3 py-3 transition hover:bg-white"
        >
          <span className="flex items-center gap-3">
            <item.icon className="h-4 w-4 text-[var(--brand-blue)]" />
            <span className="text-sm font-medium">{item.label}</span>
          </span>
          <span className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-soft)]">Jump</span>
        </a>
      ))}
    </div>
  );
}

export function Student360View({ actorRole, portfolio, message, error }: Student360ViewProps) {
  const viewModel = buildStudent360ViewModel(portfolio);
  const { family, student } = viewModel;
  const writesEnabled = isSupabaseConfigured();
  const returnPath = `/students/${student.slug}`;

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <aside className="panel rounded-[2rem] p-6">
          <div className="ui-subtle-card p-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-[var(--brand-blue)] text-xl font-semibold text-white">
              {student.studentName
                .split(" ")
                .slice(0, 2)
                .map((part) => part[0])
                .join("")}
            </div>
            <h1 className="section-title mt-4 text-3xl font-semibold">{student.studentName}</h1>
            <p className="mt-2 text-sm text-[var(--foreground-soft)]">{family.familyLabel}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <StatusBadge status={student.overallStatus} />
              <span className="ui-chip">
                {student.gradeLevel}
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--foreground-soft)]">{student.statusReason}</p>
          </div>

          <AnchorRail />

          <div className="mt-5 rounded-[1.5rem] border border-[var(--border)] bg-[var(--background-soft)]/78 p-4 text-sm text-[var(--foreground-soft)]">
            <p>Pathway: {viewModel.pathwayLabel}</p>
            <p>Context: {viewModel.studentContext}</p>
            <p>Family lead: {family.parentContactName}</p>
            <p>Strategist: {family.strategistOwnerName}</p>
            <p>Ops: {family.opsOwnerName}</p>
            <p>Mode: {formatRoleLabel(actorRole)}</p>
          </div>
        </aside>

        <div className="space-y-6">
          <FlashBanner message={message} error={error} />

          <section id="posture" className="panel rounded-[2rem] p-6 md:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-4xl space-y-4">
                <p className="ui-kicker">Current posture</p>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="section-title text-4xl font-semibold">{viewModel.currentPostureHeadline}</h2>
                  <span className="ui-chip">
                    Student 360
                  </span>
                </div>
                <p className="max-w-3xl text-base leading-8 text-[var(--foreground-soft)]">{viewModel.currentPostureDetail}</p>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="ui-subtle-card p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--brand-blue)]">Current focus</p>
                    <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">{viewModel.currentFocus[0]}</p>
                  </div>
                  <div className="ui-subtle-card p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--brand-blue)]">Biggest risk</p>
                    <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">{viewModel.currentRisk}</p>
                  </div>
                  <div className="ui-subtle-card p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--brand-blue)]">Next deadline</p>
                    <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">{viewModel.nextDeadlineLabel}</p>
                  </div>
                </div>
              </div>

              <div className="ui-subtle-card w-full max-w-sm p-5 text-sm text-[var(--foreground-soft)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                  Immediate next actions
                </p>
                <div className="mt-4 space-y-3">
                  {viewModel.currentFocus.slice(0, 3).map((action, index) => (
                    <div key={`${action}-${index}`} className="rounded-[1.25rem] bg-[var(--background-soft)] px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-soft)]">
                        Priority {index + 1}
                      </p>
                      <p className="mt-2 leading-7">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard
              label="Current SAT"
              value={student.testingProfile?.currentSat ? String(student.testingProfile.currentSat) : "—"}
              helper={student.testingProfile?.currentAct ? `ACT ${student.testingProfile.currentAct}` : "Testing baseline"}
              variant="internal"
            />
            <MetricCard
              label="Projected SAT"
              value={student.testingProfile?.projectedSat ? String(student.testingProfile.projectedSat) : "—"}
              helper={student.testingProfile?.projectedAct ? `Projected ACT ${student.testingProfile.projectedAct}` : "Working target"}
              variant="internal"
            />
            <MetricCard
              label="School list"
              value={`${student.schoolTargets.length}`}
              helper={`Reach ${viewModel.schoolBucketCounts.reach} • Target ${viewModel.schoolBucketCounts.target} • Likely ${viewModel.schoolBucketCounts.likely}`}
              variant="internal"
            />
            <MetricCard
              label="Open tasks"
              value={`${viewModel.taskCounts.total - viewModel.sortedTasks.filter((task) => computeTaskStatus(task) === "done").length}`}
              helper={`${viewModel.taskCounts.overdue} overdue • ${viewModel.taskCounts.parentVisibleOpen} parent-visible open`}
              variant="internal"
            />
          </div>

          <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <SectionCard
              eyebrow="Narrative"
              title="Summary and momentum"
              description="Current position first, editing controls second."
              icon={Sparkles}
              variant="internal"
            >
              <div className="space-y-4 text-sm leading-7 text-[var(--foreground-soft)]">
                <div className="ui-subtle-card p-4">
                  <p className="font-semibold text-[var(--foreground)]">Current summary</p>
                  <p className="mt-2">
                    {viewModel.latestSummary?.parentVisibleSummary ?? "No current monthly summary has been logged yet."}
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="ui-subtle-card p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--brand-blue)]">Advisor lens</p>
                    <p className="mt-3">
                      {viewModel.latestSummary?.internalSummaryNotes ?? "Add internal summary notes when strategist framing changes."}
                    </p>
                  </div>
                  <div className="ui-subtle-card p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--brand-blue)]">Reporting month</p>
                    <p className="mt-3">
                      {viewModel.latestSummary ? formatDisplayDate(viewModel.latestSummary.reportingMonth) : "No month logged yet"}
                    </p>
                  </div>
                </div>
              </div>

              <Composer title="Update current summary">
                <form action={saveMonthlySummaryAction} className="space-y-4">
                  <StudentScopedHiddenInputs
                    familyId={family.id}
                    familySlug={family.slug}
                    studentId={student.id}
                    studentSlug={student.slug}
                    returnPath={returnPath}
                  />
                  <input type="hidden" name="summaryId" value={viewModel.latestSummary?.id ?? ""} />
                  <input
                    type="date"
                    name="reportingMonth"
                    defaultValue={viewModel.latestSummary?.reportingMonth ?? student.lastUpdatedDate}
                    className={fieldClass}
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <textarea
                      name="biggestWin"
                      defaultValue={viewModel.latestSummary?.biggestWin ?? ""}
                      rows={4}
                      placeholder="Biggest win"
                      className={fieldClass}
                    />
                    <textarea
                      name="biggestRisk"
                      defaultValue={viewModel.latestSummary?.biggestRisk ?? ""}
                      rows={4}
                      placeholder="Biggest risk"
                      className={fieldClass}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    {[1, 2, 3].map((index) => (
                      <input
                        key={index}
                        name={`topNextAction${index}`}
                        defaultValue={viewModel.latestSummary?.topNextActions[index - 1] ?? ""}
                        placeholder={`Top next action ${index}`}
                        className={fieldClass}
                      />
                    ))}
                  </div>
                  <textarea
                    name="parentVisibleSummary"
                    defaultValue={viewModel.latestSummary?.parentVisibleSummary ?? ""}
                    rows={3}
                    placeholder="Parent-visible summary"
                    className={fieldClass}
                  />
                  <textarea
                    name="internalSummaryNotes"
                    defaultValue={viewModel.latestSummary?.internalSummaryNotes ?? ""}
                    rows={3}
                    placeholder="Internal summary notes"
                    className={fieldClass}
                  />
                  <button
                    type="submit"
                    disabled={!writesEnabled}
                    className={submitButtonClass}
                  >
                    Save summary
                  </button>
                </form>
              </Composer>
            </SectionCard>

            <SectionCard
              eyebrow="Workbench"
              title="Testing and school-fit guidance"
              description="Testing posture sits beside the current list recommendation."
              icon={LineChart}
              variant="internal"
            >
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="ui-subtle-card p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--brand-blue)]">Current baseline</p>
                    <p className="section-title mt-3 text-3xl font-semibold">
                      {student.testingProfile?.currentSat ?? "—"}
                    </p>
                    <p className="mt-2 text-sm text-[var(--foreground-soft)]">
                      {student.testingProfile?.currentAct ? `ACT ${student.testingProfile.currentAct}` : "No ACT logged"}
                    </p>
                  </div>
                  <div className="ui-subtle-card p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--brand-blue)]">Projected ceiling</p>
                    <p className="section-title mt-3 text-3xl font-semibold">
                      {student.testingProfile?.projectedSat ?? "—"}
                    </p>
                    <p className="mt-2 text-sm text-[var(--foreground-soft)]">
                      {student.testingProfile?.projectedAct ? `Projected ACT ${student.testingProfile.projectedAct}` : "No ACT projection logged"}
                    </p>
                  </div>
                </div>
                <div className="ui-subtle-card p-4 text-sm leading-7 text-[var(--foreground-soft)]">
                  <p className="font-semibold text-[var(--foreground)]">Strategy note</p>
                  <p className="mt-2">
                    {student.testingProfile?.strategyNote ?? "No testing strategy note is logged yet."}
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-[var(--background-soft)] p-4 text-sm leading-7 text-[var(--foreground-soft)]">
                  {viewModel.schoolFitRecommendation}
                </div>
              </div>

              <Composer title="Update testing profile">
                <form action={saveTestingProfileAction} className="grid gap-4 md:grid-cols-2">
                  <StudentScopedHiddenInputs
                    familyId={family.id}
                    familySlug={family.slug}
                    studentId={student.id}
                    studentSlug={student.slug}
                    returnPath={returnPath}
                  />
                  <input
                    type="number"
                    min="0"
                    name="currentSat"
                    defaultValue={student.testingProfile?.currentSat ?? ""}
                    placeholder="Current SAT"
                    className={fieldClass}
                  />
                  <input
                    type="number"
                    min="0"
                    name="projectedSat"
                    defaultValue={student.testingProfile?.projectedSat ?? ""}
                    placeholder="Projected SAT"
                    className={fieldClass}
                  />
                  <input
                    type="number"
                    min="0"
                    name="currentAct"
                    defaultValue={student.testingProfile?.currentAct ?? ""}
                    placeholder="Current ACT"
                    className={fieldClass}
                  />
                  <input
                    type="number"
                    min="0"
                    name="projectedAct"
                    defaultValue={student.testingProfile?.projectedAct ?? ""}
                    placeholder="Projected ACT"
                    className={fieldClass}
                  />
                  <textarea
                    name="strategyNote"
                    defaultValue={student.testingProfile?.strategyNote ?? ""}
                    rows={3}
                    placeholder="Testing strategy note"
                    className={`md:col-span-2 ${fieldClass}`}
                  />
                  <button
                    type="submit"
                    disabled={!writesEnabled}
                    className={`md:col-span-2 ${submitButtonClass}`}
                  >
                    Save testing profile
                  </button>
                </form>
              </Composer>
            </SectionCard>
          </section>

          <section id="academics" className="grid gap-6 md:grid-cols-2">
            <SectionCard
              eyebrow="Academic"
              title="Academic and tutoring"
              description="Latest academic posture stays readable at a glance before the update form."
              icon={BookMarked}
              variant="internal"
            >
              {viewModel.latestAcademicUpdate ? (
                <div className="ui-subtle-card space-y-3 p-4 text-sm leading-7 text-[var(--foreground-soft)]">
                  <p>
                    <strong className="text-[var(--foreground)]">Priority:</strong>{" "}
                    {viewModel.latestAcademicUpdate.subjectPriority}
                  </p>
                  <p>
                    <strong className="text-[var(--foreground)]">Trend:</strong>{" "}
                    {viewModel.latestAcademicUpdate.gradeOrPredictedTrend}
                  </p>
                  <p>
                    <strong className="text-[var(--foreground)]">Tutoring:</strong>{" "}
                    {viewModel.latestAcademicUpdate.tutoringStatus}
                  </p>
                  <p>
                    <strong className="text-[var(--foreground)]">Test prep:</strong>{" "}
                    {viewModel.latestAcademicUpdate.testPrepStatus ?? "Not logged"}
                  </p>
                  <p>{viewModel.latestAcademicUpdate.tutorNoteSummary}</p>
                </div>
              ) : (
                <SectionEmpty copy="No academic update has been logged yet." />
              )}

              <Composer title="Update academics">
                <form action={saveAcademicUpdateAction} className="space-y-4">
                  <StudentScopedHiddenInputs
                    familyId={family.id}
                    familySlug={family.slug}
                    studentId={student.id}
                    studentSlug={student.slug}
                    returnPath={returnPath}
                  />
                  <input type="hidden" name="academicUpdateId" value={viewModel.latestAcademicUpdate?.id ?? ""} />
                  <input
                    type="date"
                    name="date"
                    defaultValue={viewModel.latestAcademicUpdate?.date ?? student.lastUpdatedDate}
                    className={fieldClass}
                  />
                  <input
                    name="subjectPriority"
                    defaultValue={viewModel.latestAcademicUpdate?.subjectPriority ?? ""}
                    placeholder="Subject priority"
                    className={fieldClass}
                  />
                  <input
                    name="gradeOrPredictedTrend"
                    defaultValue={viewModel.latestAcademicUpdate?.gradeOrPredictedTrend ?? ""}
                    placeholder="Grade or predicted trend"
                    className={fieldClass}
                  />
                  <input
                    name="tutoringStatus"
                    defaultValue={viewModel.latestAcademicUpdate?.tutoringStatus ?? ""}
                    placeholder="Tutoring status"
                    className={fieldClass}
                  />
                  <textarea
                    name="tutorNoteSummary"
                    defaultValue={viewModel.latestAcademicUpdate?.tutorNoteSummary ?? ""}
                    rows={3}
                    placeholder="Tutor note summary"
                    className={fieldClass}
                  />
                  <input
                    name="testPrepStatus"
                    defaultValue={viewModel.latestAcademicUpdate?.testPrepStatus ?? ""}
                    placeholder="Test prep status"
                    className={fieldClass}
                  />
                  <label className={checkboxLabelClass}>
                    <input
                      type="checkbox"
                      name="parentVisible"
                      defaultChecked={viewModel.latestAcademicUpdate?.parentVisible ?? true}
                    />
                    Parent visible
                  </label>
                  <button
                    type="submit"
                    disabled={!writesEnabled}
                    className={submitButtonClass}
                  >
                    Save academic update
                  </button>
                </form>
              </Composer>
            </SectionCard>

            <SectionCard
              eyebrow="Profile"
              title="Profile and project progress"
              description="Project progress, evidence, and mentor signal remain readable before editing."
              icon={GraduationCap}
              variant="internal"
            >
              {viewModel.latestProfileUpdate ? (
                <div className="ui-subtle-card space-y-3 p-4 text-sm leading-7 text-[var(--foreground-soft)]">
                  <p>
                    <strong className="text-[var(--foreground)]">Project:</strong>{" "}
                    {viewModel.latestProfileUpdate.projectName}
                  </p>
                  <p>
                    <strong className="text-[var(--foreground)]">Milestone:</strong>{" "}
                    {viewModel.latestProfileUpdate.milestoneStatus}
                  </p>
                  <p>
                    <strong className="text-[var(--foreground)]">Evidence:</strong>{" "}
                    {viewModel.latestProfileUpdate.evidenceAdded}
                  </p>
                  <p>{viewModel.latestProfileUpdate.mentorNoteSummary}</p>
                </div>
              ) : (
                <SectionEmpty copy="No profile update has been logged yet." />
              )}

              <Composer title="Update profile progress">
                <form action={saveProfileUpdateAction} className="space-y-4">
                  <StudentScopedHiddenInputs
                    familyId={family.id}
                    familySlug={family.slug}
                    studentId={student.id}
                    studentSlug={student.slug}
                    returnPath={returnPath}
                  />
                  <input type="hidden" name="profileUpdateId" value={viewModel.latestProfileUpdate?.id ?? ""} />
                  <input
                    type="date"
                    name="date"
                    defaultValue={viewModel.latestProfileUpdate?.date ?? student.lastUpdatedDate}
                    className={fieldClass}
                  />
                  <input
                    name="projectName"
                    defaultValue={viewModel.latestProfileUpdate?.projectName ?? ""}
                    placeholder="Project name"
                    className={fieldClass}
                  />
                  <input
                    name="milestoneStatus"
                    defaultValue={viewModel.latestProfileUpdate?.milestoneStatus ?? ""}
                    placeholder="Milestone status"
                    className={fieldClass}
                  />
                  <input
                    name="evidenceAdded"
                    defaultValue={viewModel.latestProfileUpdate?.evidenceAdded ?? ""}
                    placeholder="Evidence added"
                    className={fieldClass}
                  />
                  <textarea
                    name="mentorNoteSummary"
                    defaultValue={viewModel.latestProfileUpdate?.mentorNoteSummary ?? ""}
                    rows={3}
                    placeholder="Mentor note summary"
                    className={fieldClass}
                  />
                  <label className={checkboxLabelClass}>
                    <input
                      type="checkbox"
                      name="parentVisible"
                      defaultChecked={viewModel.latestProfileUpdate?.parentVisible ?? true}
                    />
                    Parent visible
                  </label>
                  <button
                    type="submit"
                    disabled={!writesEnabled}
                    className={submitButtonClass}
                  >
                    Save profile update
                  </button>
                </form>
              </Composer>
            </SectionCard>
          </section>

          <section id="activities" className="grid gap-6 md:grid-cols-2">
            <SectionCard
              eyebrow="Activities"
              title="Activities and leadership"
              description="Leadership evidence stays visible as a strategy readout instead of a list buried below forms."
              icon={Activity}
              variant="internal"
            >
              <div className="space-y-3">
                {viewModel.sortedActivities.length === 0 ? (
                  <SectionEmpty copy="No activities have been logged yet." />
                ) : (
                  viewModel.sortedActivities.map((activity) => (
                    <div key={activity.id} className="ui-subtle-card p-4">
                      <p className="font-semibold">{activity.activityName}</p>
                      <p className="mt-1 text-sm text-[var(--foreground-soft)]">{activity.role}</p>
                      <p className="mt-2 text-sm leading-7 text-[var(--foreground-soft)]">{activity.impactSummary}</p>
                    </div>
                  ))
                )}
              </div>

              <Composer title="Add activity">
                <form action={saveStudentActivityAction} className="space-y-4">
                  <StudentScopedHiddenInputs
                    familyId={family.id}
                    familySlug={family.slug}
                    studentId={student.id}
                    studentSlug={student.slug}
                    returnPath={returnPath}
                  />
                  <input
                    name="activityName"
                    placeholder="Activity name"
                    className={fieldClass}
                  />
                  <input
                    name="role"
                    placeholder="Role"
                    className={fieldClass}
                  />
                  <textarea
                    name="impactSummary"
                    rows={3}
                    placeholder="Impact summary"
                    className={fieldClass}
                  />
                  <button
                    type="submit"
                    disabled={!writesEnabled}
                    className={submitButtonClass}
                  >
                    Save activity
                  </button>
                </form>
              </Composer>
            </SectionCard>

            <SectionCard
              eyebrow="Awards"
              title="Competitions and awards"
              description="Competitive signal remains adjacent to activities so the full profile can be scanned in one pass."
              icon={Trophy}
              variant="internal"
            >
              <div className="space-y-3">
                {viewModel.sortedCompetitions.length === 0 ? (
                  <SectionEmpty copy="No competitions or awards have been logged yet." />
                ) : (
                  viewModel.sortedCompetitions.map((item) => (
                    <div key={item.id} className="ui-subtle-card p-4">
                      <p className="font-semibold">{item.competitionName}</p>
                      <p className="mt-1 text-sm text-[var(--foreground-soft)]">{item.yearLabel}</p>
                      <p className="mt-2 text-sm leading-7 text-[var(--foreground-soft)]">{item.result}</p>
                    </div>
                  ))
                )}
              </div>

              <Composer title="Add competition or award">
                <form action={saveStudentCompetitionAction} className="space-y-4">
                  <StudentScopedHiddenInputs
                    familyId={family.id}
                    familySlug={family.slug}
                    studentId={student.id}
                    studentSlug={student.slug}
                    returnPath={returnPath}
                  />
                  <input
                    name="competitionName"
                    placeholder="Competition or award name"
                    className={fieldClass}
                  />
                  <input
                    name="yearLabel"
                    placeholder="Year"
                    className={fieldClass}
                  />
                  <textarea
                    name="result"
                    rows={3}
                    placeholder="Result"
                    className={fieldClass}
                  />
                  <button
                    type="submit"
                    disabled={!writesEnabled}
                    className={submitButtonClass}
                  >
                    Save competition
                  </button>
                </form>
              </Composer>
            </SectionCard>
          </section>

          <section id="targets">
            <SectionCard
              eyebrow="Targets"
              title="School target list"
              description="The current school mix stays readable in one place so bucket balance and fit notes are easy to scan."
              icon={School}
              variant="internal"
            >
              <div className="grid gap-4 lg:grid-cols-3">
                {(["reach", "target", "likely"] as const).map((bucket) => (
                  <div key={bucket} className="ui-subtle-card space-y-3 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                      {bucket}
                    </p>
                    {viewModel.sortedSchoolTargets.filter((school) => school.bucket === bucket).length === 0 ? (
                      <p className="text-sm text-[var(--foreground-soft)]">No schools in this bucket yet.</p>
                    ) : (
                      viewModel.sortedSchoolTargets
                        .filter((school) => school.bucket === bucket)
                        .map((school) => (
                          <div key={school.id} className="rounded-[1.25rem] bg-[var(--background-soft)] px-4 py-3">
                            <p className="font-semibold">{school.schoolName}</p>
                            <p className="mt-1 text-sm text-[var(--foreground-soft)]">{school.country}</p>
                            <p className="mt-2 text-sm leading-7 text-[var(--foreground-soft)]">{school.fitNote}</p>
                          </div>
                        ))
                    )}
                  </div>
                ))}
              </div>

              <Composer title="Add school target">
                <form action={saveStudentSchoolTargetAction} className="space-y-4">
                  <StudentScopedHiddenInputs
                    familyId={family.id}
                    familySlug={family.slug}
                    studentId={student.id}
                    studentSlug={student.slug}
                    returnPath={returnPath}
                  />
                  <input
                    name="schoolName"
                    placeholder="School name"
                    className={fieldClass}
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      name="country"
                      placeholder="Country"
                      className={fieldClass}
                    />
                    <select
                      name="bucket"
                      defaultValue="target"
                      className={fieldClass}
                    >
                      <option value="reach">Reach</option>
                      <option value="target">Target</option>
                      <option value="likely">Likely</option>
                    </select>
                  </div>
                  <textarea
                    name="fitNote"
                    rows={3}
                    placeholder="Fit note"
                    className={fieldClass}
                  />
                  <button
                    type="submit"
                    disabled={!writesEnabled}
                    className={submitButtonClass}
                  >
                    Save school target
                  </button>
                </form>
              </Composer>
            </SectionCard>
          </section>

          <section id="execution" className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <SectionCard
              eyebrow="Execution"
              title="Tasks and deadlines"
              description="Open work stays student-scoped here, with the next deadlines and parent-facing visibility clear at a glance."
              icon={CalendarClock}
              variant="internal"
            >
              <div className="space-y-3">
                {viewModel.sortedTasks.length === 0 ? (
                  <SectionEmpty copy="No student-scoped tasks have been logged yet." />
                ) : (
                  viewModel.sortedTasks.map((task) => (
                    <div key={task.id} className="ui-subtle-card p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold">{task.itemName}</p>
                            <span className="ui-chip">
                              {getRecordVisibilityTone(task)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-[var(--foreground-soft)]">
                            {task.category} • {task.owner}
                          </p>
                          {task.dependencyNotes ? (
                            <p className="mt-2 text-sm leading-7 text-[var(--foreground-soft)]">{task.dependencyNotes}</p>
                          ) : null}
                        </div>
                        <div className="space-y-2 text-sm text-[var(--foreground-soft)] md:text-right">
                          <StatusBadge status={computeTaskStatus(task)} kind="task" />
                          <p>{formatDisplayDate(task.dueDate)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Composer title="Add student task">
                <form action={saveTaskAction} className="grid gap-4 md:grid-cols-2">
                  <StudentScopedHiddenInputs
                    familyId={family.id}
                    familySlug={family.slug}
                    studentId={student.id}
                    studentSlug={student.slug}
                    returnPath={returnPath}
                  />
                  <input
                    name="itemName"
                    placeholder="Task name"
                    className={fieldClass}
                  />
                  <select
                    name="category"
                    defaultValue="application"
                    className={fieldClass}
                  >
                    <option value="application">Application</option>
                    <option value="testing">Testing</option>
                    <option value="academics">Academics</option>
                    <option value="project">Project</option>
                    <option value="admin">Admin</option>
                  </select>
                  <input
                    name="owner"
                    placeholder="Owner"
                    className={fieldClass}
                  />
                  <input
                    type="date"
                    name="dueDate"
                    defaultValue={student.lastUpdatedDate}
                    className={fieldClass}
                  />
                  <select
                    name="status"
                    defaultValue="not_started"
                    className={fieldClass}
                  >
                    <option value="not_started">Not started</option>
                    <option value="in_progress">In progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="done">Done</option>
                    <option value="overdue">Overdue</option>
                  </select>
                  <input
                    name="dependencyNotes"
                    placeholder="Dependency notes"
                    className={fieldClass}
                  />
                  <label className={`md:col-span-2 ${checkboxLabelClass}`}>
                    <input type="checkbox" name="parentVisible" />
                    Parent visible
                  </label>
                  <button
                    type="submit"
                    disabled={!writesEnabled}
                    className={`md:col-span-2 ${submitButtonClass}`}
                  >
                    Save task
                  </button>
                </form>
              </Composer>
            </SectionCard>

            <div className="space-y-6">
              <SectionCard
                eyebrow="Decisions"
                title="Decisions"
                description="Student-scoped decisions remain separate from family-wide coordination."
                icon={Flag}
                variant="internal"
              >
                <div className="space-y-3">
                  {viewModel.sortedDecisions.length === 0 ? (
                    <SectionEmpty copy="No student decisions have been logged yet." />
                  ) : (
                    viewModel.sortedDecisions.map((decision) => (
                      <div key={decision.id} className="ui-subtle-card p-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="font-semibold">{decision.decisionType}</p>
                          {decision.pendingFamilyInput ? <StatusBadge status="yellow" /> : null}
                          <span className="ui-chip">
                            {getRecordVisibilityTone(decision)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-[var(--foreground-soft)]">
                          {formatDisplayDate(decision.date)} • {decision.owner} • {decision.status}
                        </p>
                        <p className="mt-2 text-sm leading-7 text-[var(--foreground-soft)]">{decision.summary}</p>
                      </div>
                    ))
                  )}
                </div>

                <Composer title="Add student decision">
                  <form action={saveDecisionAction} className="space-y-4">
                    <StudentScopedHiddenInputs
                      familyId={family.id}
                      familySlug={family.slug}
                      studentId={student.id}
                      studentSlug={student.slug}
                      returnPath={returnPath}
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        type="date"
                        name="date"
                        defaultValue={student.lastUpdatedDate}
                        className={fieldClass}
                      />
                      <input
                        name="decisionType"
                        placeholder="Decision type"
                        className={fieldClass}
                      />
                    </div>
                    <textarea
                      name="summary"
                      rows={3}
                      placeholder="Decision summary"
                      className={fieldClass}
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        name="owner"
                        placeholder="Owner"
                        className={fieldClass}
                      />
                      <select
                        name="status"
                        defaultValue="pending"
                        className={fieldClass}
                      >
                        <option value="pending">Pending</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                    <label className={checkboxLabelClass}>
                      <input type="checkbox" name="pendingFamilyInput" />
                      Pending family input
                    </label>
                    <label className={checkboxLabelClass}>
                      <input type="checkbox" name="parentVisible" defaultChecked />
                      Parent visible
                    </label>
                    <button
                      type="submit"
                      disabled={!writesEnabled}
                      className={submitButtonClass}
                    >
                      Save decision
                    </button>
                  </form>
                </Composer>
              </SectionCard>

              <SectionCard
                eyebrow="History"
                title="Prior summaries"
                description="Past monthly summaries stay compact and chronological so history supports current posture instead of competing with it."
                icon={Sparkles}
                variant="internal"
              >
                <div className="space-y-3">
                  {viewModel.summaryHistory.length === 0 ? (
                    <SectionEmpty copy="No prior summaries have been logged yet." />
                  ) : (
                    viewModel.summaryHistory.map((summary) => (
                      <div key={summary.id} className="ui-subtle-card p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                          {formatDisplayDate(summary.reportingMonth)}
                        </p>
                        <p className="mt-2 font-semibold">{summary.biggestWin}</p>
                        <p className="mt-2 text-sm leading-7 text-[var(--foreground-soft)]">{summary.biggestRisk}</p>
                      </div>
                    ))
                  )}
                </div>
              </SectionCard>
            </div>
          </section>

          <section id="notes" className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
            <SectionCard
              eyebrow="Notes"
              title="Notes"
              description="Notes retain visibility context so internal-only records never get confused with parent-safe ones."
              icon={MessageSquare}
              variant="internal"
            >
              <div className="space-y-3">
                {viewModel.sortedNotes.length === 0 ? (
                  <SectionEmpty copy="No notes have been logged yet." />
                ) : (
                  viewModel.sortedNotes.map((note) => (
                    <div key={note.id} className="ui-subtle-card p-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="font-semibold">{note.summary}</p>
                        <span className="ui-chip">
                          {getRecordVisibilityTone(note)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-[var(--foreground-soft)]">
                        {formatDisplayDate(note.date)} • {getStringLabel(note.authorRole)} • {getStringLabel(note.noteType)}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[var(--foreground-soft)]">{note.body}</p>
                    </div>
                  ))
                )}
              </div>

              <Composer title="Add student note">
                <form action={saveNoteAction} className="space-y-4">
                  <StudentScopedHiddenInputs
                    familyId={family.id}
                    familySlug={family.slug}
                    studentId={student.id}
                    studentSlug={student.slug}
                    returnPath={returnPath}
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      type="date"
                      name="date"
                      defaultValue={student.lastUpdatedDate}
                      className={fieldClass}
                    />
                    <select
                      name="authorRole"
                      defaultValue="strategist"
                      className={fieldClass}
                    >
                      <option value="strategist">Strategist</option>
                      <option value="ops">Ops</option>
                      <option value="tutor_input">Tutor input</option>
                      <option value="mentor_input">Mentor input</option>
                    </select>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      name="noteType"
                      placeholder="Note type"
                      className={fieldClass}
                    />
                    <select
                      name="visibility"
                      defaultValue="internal"
                      className={fieldClass}
                    >
                      <option value="internal">Internal</option>
                      <option value="parent">Parent</option>
                    </select>
                  </div>
                  <input
                    name="summary"
                    placeholder="Note summary"
                    className={fieldClass}
                  />
                  <textarea
                    name="body"
                    rows={4}
                    placeholder="Detailed note"
                    className={fieldClass}
                  />
                  <button
                    type="submit"
                    disabled={!writesEnabled}
                    className={submitButtonClass}
                  >
                    Save note
                  </button>
                </form>
              </Composer>
            </SectionCard>

            <SectionCard
              eyebrow="Artifacts"
              title="Artifacts"
              description="Student-owned artifacts stay separate from family-wide resources, with family resources shown only as context."
              icon={Files}
              variant="internal"
            >
              <div className="space-y-3">
                {viewModel.sortedArtifacts.length === 0 ? (
                  <SectionEmpty copy="No student artifacts have been logged yet." />
                ) : (
                  viewModel.sortedArtifacts.map((artifact) => (
                    <a
                      key={artifact.id}
                      href={artifact.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ui-subtle-card block p-4 transition hover:bg-white"
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="font-semibold">{artifact.artifactName}</p>
                        <span className="ui-chip">
                          {getRecordVisibilityTone(artifact)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-[var(--foreground-soft)]">
                        {getStringLabel(artifact.artifactType)} • {artifact.owner} • {formatDisplayDate(artifact.uploadDate)}
                      </p>
                    </a>
                  ))
                )}
              </div>

              <Composer title="Add student artifact">
                <form action={saveArtifactLinkAction} className="space-y-4">
                  <StudentScopedHiddenInputs
                    familyId={family.id}
                    familySlug={family.slug}
                    studentId={student.id}
                    studentSlug={student.slug}
                    returnPath={returnPath}
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      name="artifactName"
                      placeholder="Artifact name"
                      className={fieldClass}
                    />
                    <select
                      name="artifactType"
                      defaultValue="drive_folder"
                      className={fieldClass}
                    >
                      <option value="drive_folder">Drive folder</option>
                      <option value="doc">Doc</option>
                      <option value="sheet">Sheet</option>
                      <option value="slide">Slide</option>
                      <option value="external_link">External link</option>
                    </select>
                  </div>
                  <input
                    name="linkUrl"
                    placeholder="https://..."
                    className={fieldClass}
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      type="date"
                      name="uploadDate"
                      defaultValue={student.lastUpdatedDate}
                      className={fieldClass}
                    />
                    <input
                      name="owner"
                      placeholder="Owner"
                      className={fieldClass}
                    />
                  </div>
                  <label className={checkboxLabelClass}>
                    <input type="checkbox" name="parentVisible" />
                    Parent visible
                  </label>
                  <button
                    type="submit"
                    disabled={!writesEnabled}
                    className={submitButtonClass}
                  >
                    Save artifact
                  </button>
                </form>
              </Composer>
            </SectionCard>
          </section>

          {(viewModel.familyContext.notes.length > 0 ||
            viewModel.familyContext.decisions.length > 0 ||
            viewModel.familyContext.artifacts.length > 0) ? (
            <section id="family-context">
              <SectionCard
                eyebrow="Family context"
                title="Shared household context"
                description="Family-wide items stay visible at the end of the page so household constraints are still in view without taking over the student workspace."
                icon={Users}
                variant="internal"
              >
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                      Family decisions
                    </p>
                    {viewModel.familyContext.decisions.length === 0 ? (
                      <p className="ui-subtle-card px-4 py-3 text-sm text-[var(--foreground-soft)]">
                        No family-wide decisions logged.
                      </p>
                    ) : (
                      viewModel.familyContext.decisions.map((decision) => (
                        <div key={decision.id} className="ui-subtle-card px-4 py-3">
                          <p className="font-semibold">{decision.decisionType}</p>
                          <p className="mt-2 text-sm leading-7 text-[var(--foreground-soft)]">{decision.summary}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                      Family notes
                    </p>
                    {viewModel.familyContext.notes.length === 0 ? (
                      <p className="ui-subtle-card px-4 py-3 text-sm text-[var(--foreground-soft)]">
                        No family-wide notes logged.
                      </p>
                    ) : (
                      viewModel.familyContext.notes.map((note) => (
                        <div key={note.id} className="ui-subtle-card px-4 py-3">
                          <p className="font-semibold">{note.summary}</p>
                          <p className="mt-2 text-sm leading-7 text-[var(--foreground-soft)]">{note.body}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                      Shared resources
                    </p>
                    {viewModel.familyContext.artifacts.length === 0 ? (
                      <p className="ui-subtle-card px-4 py-3 text-sm text-[var(--foreground-soft)]">
                        No family-wide resources logged.
                      </p>
                    ) : (
                      viewModel.familyContext.artifacts.map((artifact) => (
                        <a
                          key={artifact.id}
                          href={artifact.linkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="ui-subtle-card block px-4 py-3 transition hover:bg-white"
                        >
                          <p className="font-semibold">{artifact.artifactName}</p>
                          <p className="mt-2 text-sm leading-7 text-[var(--foreground-soft)]">{artifact.owner}</p>
                        </a>
                      ))
                    )}
                  </div>
                </div>
                <div className="mt-5">
                  <Link
                    href={`/families/${family.slug}`}
                    className="ui-button-secondary"
                  >
                    Open family workspace
                  </Link>
                </div>
              </SectionCard>
            </section>
          ) : null}
        </div>
      </section>
    </div>
  );
}
