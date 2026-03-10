import {
  buildSourceId,
  extractRawRecordFromDetailRoot,
  normalizeRawExport,
} from "../scripts/collegebase/extract.mjs";

function renderDetailFixture() {
  document.body.innerHTML = `
    <section data-testid="detail-root">
      <div class="overview-card">
        <h2>OVERVIEW</h2>
        <div class="badges">
          <span>3.4+</span>
          <span>1300+/28+</span>
          <span>stem</span>
        </div>
        <p><strong>Major:</strong> biochem, public health, premed <strong>Race:</strong> african american <strong>Gender:</strong> Female</p>
      </div>
      <div class="academics-card">
        <h3>Academics</h3>
        <p>SAT: 1370</p>
        <p>ACT: 32</p>
        <p>Unweighted GPA: 3.7</p>
        <p>Weighted GPA: 4</p>
        <p>Rank: 120/700</p>
        <p>AP Courses: 7</p>
        <p>IB Courses: None</p>
      </div>
      <div class="extracurriculars-card">
        <h3>Extracurriculars</h3>
        <ol>
          <li>HOSA president</li>
          <li>NHS president</li>
          <li>anti-drug club president</li>
        </ol>
      </div>
      <div class="acceptances-card">
        <h3>Acceptances</h3>
        <ul>
          <li>Tuskegee University</li>
          <li>Jackson State University</li>
          <li>Duke University</li>
        </ul>
      </div>
      <div class="awards-card">
        <h3>Awards</h3>
        <ol>
          <li>state speech contest winner</li>
          <li>film fest finalist</li>
        </ol>
      </div>
      <div class="hooks-card">
        <h3>Hooks</h3>
        <p>QuestBridge finalist and first-generation college student.</p>
      </div>
    </section>
  `;

  return document.querySelector("[data-testid='detail-root']") as HTMLElement;
}

describe("CollegeBase extraction helpers", () => {
  it("maps detail DOM into the planned raw export shape", () => {
    const detailRoot = renderDetailFixture();
    const record = extractRawRecordFromDetailRoot(detailRoot, {
      sourceCardIndex: 1,
      applicationYearLabel: "2023",
      capturedTitle: "Collegebase | See Who Got In and Why",
      capturedUrl: "https://app.collegebase.org/",
    });

    expect(record.overviewBadges).toEqual(["3.4+", "1300+/28+", "stem"]);
    expect(record.overviewFields).toEqual({
      Major: "biochem, public health, premed",
      Race: "african american",
      Gender: "Female",
    });
    expect(record.sectionMap.Academics).toEqual({
      kind: "kv",
      value: {
        SAT: "1370",
        ACT: "32",
        "Unweighted GPA": "3.7",
        "Weighted GPA": "4",
        Rank: "120/700",
        "AP Courses": "7",
        "IB Courses": "None",
      },
    });
    expect(record.sectionMap.Extracurriculars).toEqual({
      kind: "list",
      value: ["HOSA president", "NHS president", "anti-drug club president"],
    });
    expect(record.sectionMap.Acceptances).toEqual({
      kind: "list",
      value: [
        "Tuskegee University",
        "Jackson State University",
        "Duke University",
      ],
    });
    expect(record.sectionMap.Hooks).toEqual({
      kind: "text",
      value: "QuestBridge finalist and first-generation college student.",
    });
  });

  it("normalizes academics, overview metadata, and ordered lists", () => {
    const detailRoot = renderDetailFixture();
    const rawExport = {
      source: "collegebase",
      listName: "all",
      extractedAt: "2026-03-10T10:00:00.000Z",
      extractionMode: "atlas_javascript_injection",
      sourceUrl: "https://app.collegebase.org/",
      recordCount: 1,
      records: [
        extractRawRecordFromDetailRoot(detailRoot, {
          sourceCardIndex: 1,
          applicationYearLabel: "2023",
          capturedTitle: "Collegebase | See Who Got In and Why",
          capturedUrl: "https://app.collegebase.org/",
        }),
      ],
    };

    const normalized = normalizeRawExport(rawExport);
    expect(normalized.records).toHaveLength(1);
    expect(normalized.records[0]).toMatchObject({
      listName: "all",
      sourceCardIndex: 1,
      applicationYearLabel: "2023",
      overview: {
        badges: ["3.4+", "1300+/28+", "stem"],
        intendedMajors: ["biochem", "public health", "premed"],
        raceLabel: "african american",
        genderLabel: "Female",
      },
      academics: {
        satComposite: 1370,
        actComposite: 32,
        unweightedGpa: 3.7,
        weightedGpa: 4,
        classRankDisplay: "120/700",
        classRankNumerator: 120,
        classRankDenominator: 700,
        apCourseCount: 7,
      },
      extracurricularItems: [
        { sortOrder: 1, description: "HOSA president" },
        { sortOrder: 2, description: "NHS president" },
        { sortOrder: 3, description: "anti-drug club president" },
      ],
      awardItems: [
        { sortOrder: 1, description: "state speech contest winner" },
        { sortOrder: 2, description: "film fest finalist" },
      ],
      acceptanceSchoolNames: [
        "Tuskegee University",
        "Jackson State University",
        "Duke University",
      ],
      sourceSnapshot: {
        title: "Collegebase | See Who Got In and Why",
        url: "https://app.collegebase.org/",
      },
    });
    expect(normalized.records[0].otherSections).toEqual({
      Hooks: {
        kind: "text",
        value: "QuestBridge finalist and first-generation college student.",
      },
    });
  });

  it("keeps source ids stable and handles sparse records", () => {
    const sparseRecord = {
      sourceCardIndex: 9,
      applicationYearLabel: undefined,
      overviewBadges: [],
      overviewFields: {},
      sectionMap: {
        Acceptances: { kind: "list", value: ["Albany College"] },
      },
      capturedTitle: "Collegebase | See Who Got In and Why",
      capturedUrl: "https://app.collegebase.org/",
    };

    const normalized = normalizeRawExport({ records: [sparseRecord] });
    const firstId = normalized.records[0].sourceId;
    const secondId = buildSourceId(normalized.records[0]);

    expect(firstId).toBe(secondId);
    expect(normalized.records[0]).toMatchObject({
      overview: {
        badges: [],
        intendedMajors: [],
      },
      academics: {
        rawItems: {},
      },
      extracurricularItems: [],
      awardItems: [],
      acceptanceSchoolNames: ["Albany College"],
    });
  });
});
