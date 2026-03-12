import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashboardPriorityQueue } from "@/components/shared/dashboard-priority-queue";
import { FamiliesRoster } from "@/components/shared/families-roster";
import { FamilyCockpitOverview } from "@/components/shared/family-cockpit-overview";
import { buildDashboardSnapshot, toFamilyListItem } from "@/lib/domain/dashboard";
import { demoFamilies } from "@/lib/domain/demo-data";

describe("internal ops surfaces", () => {
  it("renders the dashboard queue with upcoming work cards and no rank label", () => {
    const snapshot = buildDashboardSnapshot(demoFamilies);

    render(<DashboardPriorityQueue students={snapshot.urgentStudents.slice(0, 2)} />);

    expect(screen.queryByText(/Rank 1/i)).not.toBeInTheDocument();
    expect(screen.getAllByText("Attention now").length).toBeGreaterThan(0);
    expect(screen.getByText(snapshot.urgentStudents[0].studentName)).toBeInTheDocument();
    expect(screen.getByText(snapshot.urgentStudents[0].upcomingWork[0].itemName)).toBeInTheDocument();
    expect(screen.getAllByText("Open student portfolio")).toHaveLength(2);
    expect(screen.getAllByText("Open family workspace")).toHaveLength(2);
  });

  it("renders the families roster with scan-first columns and actions", () => {
    const families = demoFamilies.slice(0, 2).map(toFamilyListItem);

    render(<FamiliesRoster families={families} />);

    expect(screen.getByText("Household")).toBeInTheDocument();
    expect(screen.getByText("Biggest risk")).toBeInTheDocument();
    expect(screen.getAllByText("Chen Family").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Open family workspace").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Add student").length).toBeGreaterThan(0);
  });

  it("renders the family cockpit overview with anchors and attention counts", () => {
    render(<FamilyCockpitOverview family={demoFamilies[0]} />);

    expect(screen.getByText("Household posture")).toBeInTheDocument();
    expect(screen.getAllByText("Attention now").length).toBeGreaterThan(0);
    expect(screen.getByText("Pending family input")).toBeInTheDocument();
    expect(screen.getByText("Top next actions")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Student roster" })).toHaveAttribute(
      "href",
      "#student-roster",
    );
  });
});
