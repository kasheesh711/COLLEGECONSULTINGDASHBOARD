import { describe, expect, it } from "vitest";
import {
  buildStudent360ViewModel,
  getRecordVisibilityTone,
} from "@/components/students/student-360-view-model";
import { buildStudentPortfolio, getDemoFamilies } from "@/lib/domain/dashboard";

describe("student 360 view model", () => {
  it("keeps current posture student-centered and family context secondary", () => {
    const portfolio = buildStudentPortfolio(getDemoFamilies(), "emma-chen");

    expect(portfolio).not.toBeNull();

    const viewModel = buildStudent360ViewModel(portfolio!);

    expect(viewModel.currentPostureHeadline).toContain("Emma finalized her personal statement angle");
    expect(viewModel.currentFocus).toEqual([
      "Finalize MIT maker portfolio evidence folder",
      "Lock recommender briefing packets",
      "Complete two supplemental essay outlines before March 24",
    ]);
    expect(viewModel.nextDeadlineLabel).toContain("Recommender briefing packet");
    expect(viewModel.familyContext.decisions).toHaveLength(1);
    expect(viewModel.familyContext.notes).toHaveLength(1);
    expect(viewModel.familyContext.artifacts).toHaveLength(1);
  });

  it("uses the latest internal updates instead of filtering to parent-visible only", () => {
    const portfolio = structuredClone(buildStudentPortfolio(getDemoFamilies(), "emma-chen"));

    expect(portfolio).not.toBeNull();

    portfolio!.student.academicUpdates.push({
      id: "acad_internal_latest",
      studentId: portfolio!.student.id,
      date: "2026-03-09",
      subjectPriority: "AP Physics lab write-ups",
      gradeOrPredictedTrend: "Stable, but missing one lab revision",
      tutoringStatus: "Extra physics lab review added",
      tutorNoteSummary: "Internal-only lab escalation.",
      testPrepStatus: "SAT paused for the week",
      parentVisible: false,
    });

    portfolio!.student.profileUpdates.push({
      id: "profile_internal_latest",
      studentId: portfolio!.student.id,
      date: "2026-03-10",
      projectName: "Urban Climate Sensors capstone",
      milestoneStatus: "Needs one internal review pass before sharing broadly",
      evidenceAdded: "Draft technical memo only",
      mentorNoteSummary: "Internal-only polish note.",
      parentVisible: false,
    });

    const viewModel = buildStudent360ViewModel(portfolio!);

    expect(viewModel.latestAcademicUpdate?.id).toBe("acad_internal_latest");
    expect(viewModel.latestProfileUpdate?.id).toBe("profile_internal_latest");
  });

  it("labels record visibility consistently across notes, decisions, and artifacts", () => {
    const portfolio = buildStudentPortfolio(getDemoFamilies(), "emma-chen");

    expect(portfolio).not.toBeNull();

    const note = portfolio!.student.notes[0];
    const decision = portfolio!.student.decisionLogItems[0];
    const artifact = portfolio!.student.artifactLinks[0];

    expect(getRecordVisibilityTone(note)).toBe("Parent visible");
    expect(getRecordVisibilityTone(decision)).toBe("Parent visible");
    expect(getRecordVisibilityTone(artifact)).toBe("Parent visible");
  });
});
