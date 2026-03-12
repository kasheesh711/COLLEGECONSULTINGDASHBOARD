import { describe, expect, it } from "vitest";
import {
  COLLEGEBASE_ANALYTICS_ASSUMPTIONS,
  loadCollegebaseAnalyticsDatasetFromFile,
  parseCollegebaseAnalyticsDataset,
  type CollegebaseAnalyticsFilters,
} from "@/lib/domain/collegebase-analytics";
import {
  buildCollegebaseAnalyticsHref,
  buildCollegebaseAnalyticsSnapshot,
  buildCollegebaseApplicantDetailHref,
  resolveCollegebaseAnalyticsReturnHref,
} from "@/lib/reporting/collegebase-analytics";

function makeDataset() {
  return parseCollegebaseAnalyticsDataset({
    records: [
      {
        sourceId: "alpha1111",
        listName: "all",
        sourceCardIndex: 1,
        applicationYearLabel: "2024",
        overview: {
          badges: ["3.8+", "1500+/34+"],
          intendedMajors: ["Computer science", "llustration"],
          raceLabel: "Asian",
          genderLabel: "Female",
        },
        academics: {
          satComposite: 1520,
          unweightedGpa: 3.92,
          weightedGpa: 4.45,
          rawItems: {},
        },
        extracurricularItems: [{ sortOrder: 1, description: "Research lead" }],
        awardItems: [{ sortOrder: 1, description: "National Merit" }],
        acceptanceSchoolNames: ["Yale University", "Brown University"],
        otherSections: {
          Rejections: {
            kind: "list",
            value: ["Stanford University"],
          },
          Waitlists: {
            kind: "list",
            value: ["Columbia University"],
          },
        },
      },
      {
        sourceId: "beta2222",
        listName: "all",
        sourceCardIndex: 2,
        applicationYearLabel: "2024",
        overview: {
          badges: ["3.6+", "31+"],
          intendedMajors: ["Computer Science"],
        },
        academics: {
          actComposite: 33,
          unweightedGpa: 3.74,
          rawItems: {},
        },
        extracurricularItems: [{ sortOrder: 1, description: "Debate captain" }],
        awardItems: [],
        acceptanceSchoolNames: ["Stanford University"],
        otherSections: {
          Rejections: {
            kind: "list",
            value: ["Yale University"],
          },
        },
      },
      {
        sourceId: "gamma3333",
        listName: "all",
        sourceCardIndex: 3,
        applicationYearLabel: "2024",
        overview: {
          badges: [],
          intendedMajors: ["Economics"],
        },
        academics: {
          satComposite: 1450,
          actComposite: 32,
          rawItems: {},
        },
        extracurricularItems: [],
        awardItems: [],
        acceptanceSchoolNames: [],
        otherSections: {
          Rejections: {
            kind: "list",
            value: ["Yale University"],
          },
        },
      },
    ],
  });
}

function makeFilters(overrides: Partial<CollegebaseAnalyticsFilters> = {}): CollegebaseAnalyticsFilters {
  return {
    metric: "sat",
    outcome: "all",
    ...overrides,
  };
}

describe("collegebase analytics domain", () => {
  it("normalizes majors with light cleanup and merges case-only variants", () => {
    const dataset = makeDataset();

    expect(dataset.availableMajors[0]).toEqual({
      label: "Computer Science",
      applicantCount: 2,
    });
    expect(dataset.records[0].normalizedMajors).toContain("Illustration");
  });

  it("flattens accepted and rejected school outcomes while keeping waitlists separate", () => {
    const dataset = makeDataset();
    const first = dataset.records[0];

    expect(first.schoolOutcomes).toEqual([
      { schoolName: "Yale University", outcome: "accepted" },
      { schoolName: "Brown University", outcome: "accepted" },
      { schoolName: "Stanford University", outcome: "rejected" },
    ]);
    expect(first.waitlistSchoolNames).toEqual(["Columbia University"]);
  });

  it("dedupes repeated school outcomes so school filters stay stable", () => {
    const dataset = parseCollegebaseAnalyticsDataset({
      records: [
        {
          sourceId: "repeat111",
          listName: "all",
          sourceCardIndex: 1,
          applicationYearLabel: "2024",
          overview: {
            badges: [],
            intendedMajors: ["Economics"],
          },
          academics: {
            satComposite: 1490,
            rawItems: {},
          },
          extracurricularItems: [],
          awardItems: [],
          acceptanceSchoolNames: ["Yale University", " yale university ", "Yale University"],
          otherSections: {
            Rejections: {
              kind: "list",
              value: ["Brown University", "brown university"],
            },
            Waitlists: {
              kind: "list",
              value: ["Columbia University", "columbia university"],
            },
          },
        },
      ],
    });

    expect(dataset.records[0].schoolOutcomes).toEqual([
      { schoolName: "Yale University", outcome: "accepted" },
      { schoolName: "Brown University", outcome: "rejected" },
    ]);
    expect(dataset.records[0].waitlistSchoolNames).toEqual(["Columbia University"]);
  });

  it("builds accepted versus rejected summaries and scatter exclusions for a selected school", () => {
    const snapshot = buildCollegebaseAnalyticsSnapshot(
      makeDataset(),
      makeFilters({ school: "Yale University", metric: "sat" }),
    );

    expect(snapshot.outcomeSummaries).toEqual([
      expect.objectContaining({
        outcome: "accepted",
        totalCount: 1,
        averageSat: 1520,
        averageGpa: 3.92,
      }),
      expect.objectContaining({
        outcome: "rejected",
        totalCount: 2,
        averageSat: 1450,
        satSampleSize: 1,
        gpaSampleSize: 1,
      }),
    ]);
    expect(snapshot.scatter.points).toEqual([
      expect.objectContaining({ sourceId: "alpha1111", outcome: "accepted", x: 1520, y: 3.92 }),
    ]);
    expect(snapshot.scatter.excludedCount).toBe(2);
  });

  it("filters applicant pools by major and score ranges", () => {
    const snapshot = buildCollegebaseAnalyticsSnapshot(
      makeDataset(),
      makeFilters({ major: "Computer Science", satMin: 1500 }),
    );

    expect(snapshot.filteredApplicantCount).toBe(1);
    expect(snapshot.outcomeSummaries[0]).toEqual(
      expect.objectContaining({
        outcome: "accepted",
        totalCount: 1,
        averageSat: 1520,
      }),
    );
    expect(snapshot.availableMajors.map((item) => item.label)).toContain("Computer Science");
  });

  it("sorts school-specific rosters deterministically using the selected metric", () => {
    const dataset = parseCollegebaseAnalyticsDataset({
      records: [
        {
          sourceId: "act-high",
          listName: "all",
          sourceCardIndex: 1,
          applicationYearLabel: "2024",
          overview: { badges: [], intendedMajors: ["Economics"] },
          academics: { satComposite: 1450, actComposite: 35, unweightedGpa: 3.8, rawItems: {} },
          extracurricularItems: [],
          awardItems: [],
          acceptanceSchoolNames: ["Yale University"],
          otherSections: {},
        },
        {
          sourceId: "sat-high",
          listName: "all",
          sourceCardIndex: 2,
          applicationYearLabel: "2024",
          overview: { badges: [], intendedMajors: ["Economics"] },
          academics: { satComposite: 1540, actComposite: 33, unweightedGpa: 3.9, rawItems: {} },
          extracurricularItems: [],
          awardItems: [],
          acceptanceSchoolNames: ["Yale University"],
          otherSections: {},
        },
        {
          sourceId: "act-mid",
          listName: "all",
          sourceCardIndex: 3,
          applicationYearLabel: "2024",
          overview: { badges: [], intendedMajors: ["Economics"] },
          academics: { satComposite: 1500, actComposite: 34, unweightedGpa: 3.95, rawItems: {} },
          extracurricularItems: [],
          awardItems: [],
          acceptanceSchoolNames: ["Yale University"],
          otherSections: {},
        },
      ],
    });

    const snapshot = buildCollegebaseAnalyticsSnapshot(
      dataset,
      makeFilters({ school: "Yale University", metric: "act" }),
    );

    expect(snapshot.roster.accepted.map((item) => item.sourceId)).toEqual([
      "act-high",
      "act-mid",
      "sat-high",
    ]);
  });

  it("repairs legacy score scales instead of rejecting the dataset", () => {
    const dataset = parseCollegebaseAnalyticsDataset({
      records: [
        {
          sourceId: "legacy111",
          listName: "all",
          sourceCardIndex: 1,
          applicationYearLabel: "2017",
          overview: {
            badges: [],
            intendedMajors: ["Economics"],
          },
          academics: {
            satComposite: 2360,
            unweightedGpa: 96,
            weightedGpa: 102,
            rawItems: {
              SAT: "2360",
              "Unweighted GPA": "96",
              "Weighted GPA": "102",
            },
          },
          extracurricularItems: [],
          awardItems: [],
          acceptanceSchoolNames: ["Brown University"],
          otherSections: {},
        },
        {
          sourceId: "legacy222",
          listName: "all",
          sourceCardIndex: 2,
          applicationYearLabel: "2021",
          overview: {
            badges: [],
            intendedMajors: ["Computer Science"],
          },
          academics: {
            satComposite: 31,
            rawItems: {
              SAT: "31",
              ACT: "None",
            },
          },
          extracurricularItems: [],
          awardItems: [],
          acceptanceSchoolNames: [],
          otherSections: {
            Rejections: {
              kind: "list",
              value: ["Stanford University"],
            },
          },
        },
      ],
    });

    expect(dataset.records[0].academics.satComposite).toBe(1573);
    expect(dataset.records[0].academics.unweightedGpa).toBe(3.84);
    expect(dataset.records[0].academics.weightedGpa).toBe(4.08);
    expect(dataset.records[1].academics.satComposite).toBeUndefined();
    expect(dataset.records[1].academics.actComposite).toBe(31);
  });

  it("throws a clear error when the dataset file is missing", async () => {
    await expect(
      loadCollegebaseAnalyticsDatasetFromFile("/tmp/does-not-exist-collegebase.json"),
    ).rejects.toThrow("Collegebase analytics dataset not found");
  });

  it("keeps drill-down links and return navigation pinned to the filtered analytics view", () => {
    expect(
      buildCollegebaseApplicantDetailHref(
        "alpha1111",
        {
          school: "Yale University",
          metric: "act",
          satMin: "1450",
        },
        {
          school: "Yale University",
          rosterOutcome: "accepted",
        },
      ),
    ).toBe(
      "/analytics/applicants/alpha1111?school=Yale+University&rosterOutcome=accepted&returnTo=%2Fanalytics%3Fschool%3DYale%2BUniversity%26metric%3Dact%26satMin%3D1450",
    );

    expect(
      resolveCollegebaseAnalyticsReturnHref(
        "/analytics?school=Yale+University&metric=act&satMin=1450",
      ),
    ).toBe("/analytics?school=Yale+University&metric=act&satMin=1450");
    expect(resolveCollegebaseAnalyticsReturnHref("https://example.com/phish")).toBe("/analytics");
  });

  it("documents the dataset assumptions in code for the analytics surface", () => {
    expect(COLLEGEBASE_ANALYTICS_ASSUMPTIONS).toHaveLength(4);
    expect(COLLEGEBASE_ANALYTICS_ASSUMPTIONS.join(" ")).toContain("read-only");
    expect(COLLEGEBASE_ANALYTICS_ASSUMPTIONS.join(" ")).toContain("Waitlists");
    expect(buildCollegebaseAnalyticsHref({ school: "Yale University", metric: "sat" })).toBe(
      "/analytics?school=Yale+University&metric=sat",
    );
  });
});
