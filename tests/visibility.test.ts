import { describe, expect, it } from "vitest";
import { buildPortalCase, getDemoFamilies } from "@/lib/domain/dashboard";

describe("parent portal visibility", () => {
  it("exposes only parent-visible tasks and artifact links grouped by student", () => {
    const portal = buildPortalCase(getDemoFamilies(), "chen-family");

    expect(portal).not.toBeNull();
    expect(portal?.family.slug).toBe("chen-family");
    expect(portal?.students.map((student) => student.slug)).toEqual(["emma-chen", "lucas-chen"]);
    expect(portal?.students.every((student) => student.tasks.every((task) => task.parentVisible))).toBe(
      true,
    );
    expect(
      portal?.students.every((student) =>
        student.artifactLinks.every((artifact) => artifact.parentVisible),
      ),
    ).toBe(true);
    expect(portal?.students.find((student) => student.slug === "emma-chen")?.artifactLinks).toHaveLength(1);
  });

  it("preserves monthly history per student while keeping the latest summary separate", () => {
    const portal = buildPortalCase(getDemoFamilies(), "chen-family");
    const emma = portal?.students.find((student) => student.slug === "emma-chen");

    expect(emma?.currentSummary?.reportingMonth).toBe("2026-03-01");
    expect(emma?.currentSummary?.parentVisibleSummary).toContain("March is moving well");
    expect(emma?.summaryHistory.map((item) => item.reportingMonth)).toEqual(["2026-02-01"]);
  });

  it("does not leak internal-only notes or summary fields into the portal shape", () => {
    const portal = buildPortalCase(getDemoFamilies(), "singh-family");
    const priya = portal?.students.find((student) => student.slug === "priya-singh");

    expect(priya).not.toBeNull();
    expect("notes" in (priya as object)).toBe(false);
    expect(priya?.currentSummary).toBeDefined();
    expect("internalSummaryNotes" in (priya?.currentSummary as object)).toBe(false);
    expect("biggestRisk" in (priya?.currentSummary as object)).toBe(false);
    expect("biggestWin" in (priya?.currentSummary as object)).toBe(false);
    expect(
      priya?.summaryHistory.every((summary) => !("internalSummaryNotes" in (summary as object))),
    ).toBe(true);
  });
});
