import { parseISO } from "date-fns";
import { computeTaskStatus, formatDisplayDate, getLatestSummary, getSummaryHistory } from "@/lib/domain/dashboard";
import type {
  AcademicUpdate,
  ArtifactLink,
  DecisionLogItem,
  NoteItem,
  ProfileUpdate,
  StudentPortfolio,
  TaskItem,
} from "@/lib/domain/types";

export type Student360ViewModel = ReturnType<typeof buildStudent360ViewModel>;

function sortByNewest<T extends { date?: string; reportingMonth?: string; uploadDate?: string }>(items: T[]) {
  return [...items].sort((left, right) => {
    const leftDate = parseISO(left.date ?? left.reportingMonth ?? left.uploadDate ?? "1970-01-01").getTime();
    const rightDate = parseISO(right.date ?? right.reportingMonth ?? right.uploadDate ?? "1970-01-01").getTime();
    return rightDate - leftDate;
  });
}

function formatPathway(pathway: string) {
  return pathway
    .split("_")
    .map((part) => (part.length <= 2 ? part.toUpperCase() : part[0]?.toUpperCase() + part.slice(1)))
    .join(" ");
}

function getLatestUpdate<T extends AcademicUpdate | ProfileUpdate>(items: T[]) {
  return sortByNewest(items)[0];
}

function getNextCriticalTask(tasks: TaskItem[]) {
  return [...tasks]
    .filter((task) => computeTaskStatus(task) !== "done")
    .sort((left, right) => parseISO(left.dueDate).getTime() - parseISO(right.dueDate).getTime())[0];
}

function getTaskCounts(tasks: TaskItem[]) {
  return tasks.reduce(
    (counts, task) => {
      const computedStatus = computeTaskStatus(task);
      counts.total += 1;
      if (computedStatus === "overdue") counts.overdue += 1;
      if (computedStatus === "in_progress") counts.inProgress += 1;
      if (task.parentVisible && computedStatus !== "done") counts.parentVisibleOpen += 1;
      return counts;
    },
    { total: 0, overdue: 0, inProgress: 0, parentVisibleOpen: 0 },
  );
}

function getSchoolFitRecommendation(currentSat?: number, projectedSat?: number, targetCount = 0, likelyCount = 0) {
  const bestScore = projectedSat ?? currentSat;

  if (!bestScore) return "Add a testing baseline before expanding the school list.";
  if (bestScore >= 1500) {
    return targetCount < 3
      ? "Testing supports one more ambitious target while the evidence stack is strong."
      : "Hold the current mix and sharpen differentiation evidence instead of adding more names.";
  }
  if (bestScore >= 1450) {
    return likelyCount < 2
      ? "Add one more likely school to protect the list before pushing more reach ambition."
      : "Keep the spread steady and improve fit notes before shifting buckets.";
  }
  if (bestScore >= 1380) {
    return "Increase the likely bucket while the testing ceiling and narrative evidence keep compounding.";
  }
  return "Reduce score-dependent reaches and rebalance toward likely schools.";
}

function getCurrentPostureDetail(portfolio: StudentPortfolio) {
  const latestSummary = getLatestSummary(portfolio.student);

  if (latestSummary?.internalSummaryNotes) return latestSummary.internalSummaryNotes;
  if (latestSummary?.parentVisibleSummary) return latestSummary.parentVisibleSummary;
  return portfolio.student.statusReason;
}

function getCurrentPostureHeadline(portfolio: StudentPortfolio) {
  const latestSummary = getLatestSummary(portfolio.student);
  return latestSummary?.biggestWin ?? portfolio.student.statusReason;
}

function getCurrentRisk(portfolio: StudentPortfolio) {
  const latestSummary = getLatestSummary(portfolio.student);
  return latestSummary?.biggestRisk ?? portfolio.student.statusReason;
}

export function buildStudent360ViewModel(portfolio: StudentPortfolio) {
  const { family, student, familyWideArtifacts, familyWideDecisions, familyWideNotes } = portfolio;
  const latestSummary = getLatestSummary(student);
  const summaryHistory = getSummaryHistory(student);
  const latestAcademicUpdate = getLatestUpdate(student.academicUpdates);
  const latestProfileUpdate = getLatestUpdate(student.profileUpdates);
  const nextCriticalTask = getNextCriticalTask(student.tasks);
  const taskCounts = getTaskCounts(student.tasks);
  const reachCount = student.schoolTargets.filter((item) => item.bucket === "reach").length;
  const targetCount = student.schoolTargets.filter((item) => item.bucket === "target").length;
  const likelyCount = student.schoolTargets.filter((item) => item.bucket === "likely").length;
  const currentFocus = latestSummary?.topNextActions.filter((item) => item.trim().length > 0) ?? [];

  return {
    family,
    student,
    latestSummary,
    summaryHistory,
    latestAcademicUpdate,
    latestProfileUpdate,
    nextCriticalTask,
    taskCounts,
    schoolBucketCounts: {
      reach: reachCount,
      target: targetCount,
      likely: likelyCount,
    },
    schoolFitRecommendation: getSchoolFitRecommendation(
      student.testingProfile?.currentSat,
      student.testingProfile?.projectedSat,
      targetCount,
      likelyCount,
    ),
    currentPostureHeadline: getCurrentPostureHeadline(portfolio),
    currentPostureDetail: getCurrentPostureDetail(portfolio),
    currentRisk: getCurrentRisk(portfolio),
    currentFocus: currentFocus.length > 0 ? currentFocus : [nextCriticalTask?.itemName ?? "Log the next advising move."],
    pathwayLabel: formatPathway(student.pathway),
    studentContext: `${student.gradeLevel} • ${student.currentPhase} • ${student.tier}`,
    nextDeadlineLabel: nextCriticalTask
      ? `${nextCriticalTask.itemName} due ${formatDisplayDate(nextCriticalTask.dueDate)}`
      : "No active deadline is currently logged.",
    sortedActivities: [...student.activities].sort((left, right) => left.sortOrder - right.sortOrder),
    sortedCompetitions: [...student.competitions].sort((left, right) => left.sortOrder - right.sortOrder),
    sortedSchoolTargets: [...student.schoolTargets].sort((left, right) => left.sortOrder - right.sortOrder),
    sortedTasks: [...student.tasks].sort(
      (left, right) => parseISO(left.dueDate).getTime() - parseISO(right.dueDate).getTime(),
    ),
    sortedDecisions: sortByNewest(student.decisionLogItems),
    sortedNotes: sortByNewest(student.notes),
    sortedArtifacts: sortByNewest(student.artifactLinks),
    familyContext: {
      notes: sortByNewest(familyWideNotes).slice(0, 3),
      decisions: sortByNewest(familyWideDecisions).slice(0, 3),
      artifacts: sortByNewest(familyWideArtifacts).slice(0, 3),
    },
  };
}

export function getRecordVisibilityTone(record: DecisionLogItem | NoteItem | ArtifactLink | TaskItem) {
  if ("visibility" in record) {
    return record.visibility === "parent" ? "Parent visible" : "Internal only";
  }
  if ("parentVisible" in record) {
    return record.parentVisible ? "Parent visible" : "Internal only";
  }
  return "Internal only";
}
