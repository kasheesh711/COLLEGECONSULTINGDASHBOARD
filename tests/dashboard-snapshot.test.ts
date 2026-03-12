import { describe, expect, it } from "vitest";
import { buildDashboardSnapshot } from "@/lib/domain/dashboard";
import { demoFamilies } from "@/lib/domain/demo-data";

describe("dashboard snapshot", () => {
  it("caps upcoming work at three items per student and sorts by due date then status", () => {
    const families = structuredClone(demoFamilies);
    const nathan = families
      .flatMap((family) => family.students)
      .find((student) => student.slug === "nathan-rattanachai");

    if (!nathan) {
      throw new Error("Expected Nathan in demo families.");
    }

    nathan.tasks.push(
      {
        id: "task_nathan_3",
        studentId: nathan.id,
        itemName: "Portfolio review",
        category: "project",
        owner: "Alicia Wong",
        dueDate: "2026-03-16",
        status: "in_progress",
        dependencyNotes: "Needs latest project draft",
        parentVisible: false,
      },
      {
        id: "task_nathan_4",
        studentId: nathan.id,
        itemName: "Campus visit outline",
        category: "application",
        owner: "Suda Rattanachai",
        dueDate: "2026-03-22",
        status: "not_started",
        dependencyNotes: "Waiting on travel dates",
        parentVisible: true,
      },
    );

    const snapshot = buildDashboardSnapshot(families);
    const queueItem = snapshot.urgentStudents.find((student) => student.slug === "nathan-rattanachai");

    expect(queueItem).toBeDefined();
    expect(queueItem?.upcomingWork).toHaveLength(3);
    expect(queueItem?.upcomingWork.map((task) => task.itemName)).toEqual([
      "ACT diagnostic booking",
      "Summer shortlist decision memo",
      "Portfolio review",
    ]);
  });

  it("supports students with one, two, and three upcoming work items in the queue", () => {
    const families = structuredClone(demoFamilies);
    const emma = families.flatMap((family) => family.students).find((student) => student.slug === "emma-chen");
    const lucas = families.flatMap((family) => family.students).find((student) => student.slug === "lucas-chen");
    const nathan = families
      .flatMap((family) => family.students)
      .find((student) => student.slug === "nathan-rattanachai");

    if (!emma || !lucas || !nathan) {
      throw new Error("Expected demo students were not found.");
    }

    nathan.tasks.push({
      id: "task_nathan_3",
      studentId: nathan.id,
      itemName: "Portfolio review",
      category: "project",
      owner: "Alicia Wong",
      dueDate: "2026-03-16",
      status: "in_progress",
      dependencyNotes: "Needs latest project draft",
      parentVisible: false,
    });

    const snapshot = buildDashboardSnapshot(families);
    const emmaQueue = snapshot.urgentStudents.find((student) => student.slug === emma.slug);
    const lucasQueue = snapshot.urgentStudents.find((student) => student.slug === lucas.slug);
    const nathanQueue = snapshot.urgentStudents.find((student) => student.slug === nathan.slug);

    expect(emmaQueue?.upcomingWork).toHaveLength(2);
    expect(lucasQueue?.upcomingWork).toHaveLength(1);
    expect(nathanQueue?.upcomingWork).toHaveLength(3);
  });

  it("orders urgent students by urgency, due date, then last updated date", () => {
    const families = structuredClone(demoFamilies);
    const emma = families.flatMap((family) => family.students).find((student) => student.slug === "emma-chen");
    const nathan = families
      .flatMap((family) => family.students)
      .find((student) => student.slug === "nathan-rattanachai");

    if (!emma || !nathan) {
      throw new Error("Expected demo students were not found.");
    }

    emma.overallStatus = "red";
    emma.lastUpdatedDate = "2026-03-01";
    emma.tasks = [
      {
        ...emma.tasks[0],
        dueDate: "2026-03-16",
      },
    ];
    nathan.overallStatus = "red";
    nathan.lastUpdatedDate = "2026-03-05";
    nathan.tasks = [
      {
        ...nathan.tasks[0],
        dueDate: "2026-03-16",
        status: "in_progress",
      },
    ];

    const snapshot = buildDashboardSnapshot(families);
    const emmaIndex = snapshot.urgentStudents.findIndex((student) => student.slug === "emma-chen");
    const nathanIndex = snapshot.urgentStudents.findIndex((student) => student.slug === "nathan-rattanachai");

    expect(emmaIndex).toBeLessThan(nathanIndex);
  });
});
