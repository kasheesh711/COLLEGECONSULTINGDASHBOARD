import { afterEach, describe, expect, it } from "vitest";
import {
  buildCollegeScorecardUrl,
  clampPerPage,
  makeCollegeListItemInput,
  mapCollegeOwnership,
  mapCollegeSearchResult,
  suggestCollegeBucket,
} from "@/lib/domain/college-scorecard";
import type { CollegeSearchResult, FamilyCollegeStrategyProfile } from "@/lib/domain/types";

const originalApiKey = process.env.COLLEGE_SCORECARD_API_KEY;

function makeProfile(overrides: Partial<FamilyCollegeStrategyProfile> = {}): FamilyCollegeStrategyProfile {
  return {
    id: "profile-1",
    familyId: "family-1",
    currentSat: 1410,
    projectedSat: 1490,
    currentAct: undefined,
    projectedAct: undefined,
    intendedMajorCodes: ["1107"],
    intendedMajorLabels: ["Computer Science"],
    strategyNote: "Focus on selective CS programs.",
    ...overrides,
  };
}

function makeSchool(overrides: Partial<CollegeSearchResult> = {}): CollegeSearchResult {
  return {
    scorecardSchoolId: 166027,
    schoolName: "Sample University",
    city: "Cambridge",
    state: "MA",
    ownership: "Private nonprofit",
    studentSize: 21000,
    admissionRate: 0.14,
    satAverage: 1450,
    completionRate: 0.9,
    retentionRate: 0.94,
    averageNetPrice: 28000,
    medianEarnings: 88000,
    latitude: 42.37,
    longitude: -71.11,
    matchedPrograms: [{ code: "1107", title: "Computer Science" }],
    ...overrides,
  };
}

afterEach(() => {
  if (originalApiKey == null) delete process.env.COLLEGE_SCORECARD_API_KEY;
  else process.env.COLLEGE_SCORECARD_API_KEY = originalApiKey;
});

describe("college scorecard integration", () => {
  it("always includes the bachelor's predominant-degree filter and normalized query params", () => {
    process.env.COLLEGE_SCORECARD_API_KEY = "test-api-key";

    const url = new URL(
      buildCollegeScorecardUrl({
        query: "Boston",
        ownership: "Public",
        sizeMin: 5000,
        sizeMax: 25000,
        admissionRateMin: 0.1,
        admissionRateMax: 0.3,
        satMin: 1300,
        satMax: 1500,
        completionMin: 0.8,
        retentionMin: 0.9,
        earningsMin: 70000,
        netPriceMax: 35000,
        programCode: "1107",
        perPage: 99,
        sort: "earnings_desc",
      }),
    );

    expect(url.searchParams.get("school.degrees_awarded.predominant")).toBe("3");
    expect(url.searchParams.get("school.name")).toBe("Boston");
    expect(url.searchParams.get("school.ownership")).toBe("1");
    expect(url.searchParams.get("latest.student.size__range")).toBe("5000..25000");
    expect(url.searchParams.get("latest.admissions.admission_rate.overall__range")).toBe(
      "0.1..0.3",
    );
    expect(url.searchParams.get("latest.admissions.sat_scores.average.overall__range")).toBe(
      "1300..1500",
    );
    expect(url.searchParams.get("latest.cost.avg_net_price.overall__range")).toBe("..35000");
    expect(url.searchParams.get("latest.completion.rate_suppressed.overall__range")).toBe(
      "0.8..",
    );
    expect(url.searchParams.get("latest.student.retention_rate.four_year.full_time__range")).toBe(
      "0.9..",
    );
    expect(url.searchParams.get("latest.earnings.10_yrs_after_entry.median__range")).toBe(
      "70000..",
    );
    expect(url.searchParams.get("all_programs_nested")).toBe("true");
    expect(url.searchParams.get("latest.programs.cip_4_digit.code")).toBe("1107");
    expect(url.searchParams.get("per_page")).toBe("20");
    expect(url.searchParams.get("sort")).toBe("latest.earnings.10_yrs_after_entry.median:desc");
    expect(url.searchParams.get("fields")).toContain("latest.programs");
  });

  it("maps ownership codes into explicit labels", () => {
    expect(mapCollegeOwnership(1)).toBe("Public");
    expect(mapCollegeOwnership(2)).toBe("Private nonprofit");
    expect(mapCollegeOwnership(3)).toBe("Private for-profit");
    expect(mapCollegeOwnership(99)).toBe("Unknown");
  });

  it("keeps only matching bachelor's nested programs", () => {
    const school = mapCollegeSearchResult(
      {
        id: 110662,
        school: {
          name: "University of California, Berkeley",
          city: "Berkeley",
          state: "CA",
          ownership: 1,
        },
        latest: {
          student: { size: 45000 },
          admissions: {
            admission_rate: { overall: 0.12 },
            sat_scores: { average: { overall: 1415 } },
          },
          completion: { rate_suppressed: { overall: 0.94 } },
          cost: { avg_net_price: { overall: 18600 } },
          earnings: { "10_yrs_after_entry": { median: 88000 } },
          programs: {
            cip_4_digit: [
              { code: "1107", title: "Computer Science", credential: { level: 3 } },
              { code: "1107", title: "Computer Science Master's", credential: { level: 5 } },
              { code: "5202", title: "Business Administration", credential: { level: 3 } },
            ],
          },
        },
      },
      "1107",
    );

    expect(school.matchedPrograms).toEqual([{ code: "1107", title: "Computer Science" }]);
  });

  it("clamps per-page requests to supported bounds", () => {
    expect(clampPerPage(undefined)).toBe(12);
    expect(clampPerPage(0)).toBe(12);
    expect(clampPerPage(5)).toBe(5);
    expect(clampPerPage(100)).toBe(20);
  });

  it("suggests a likely bucket when projected testing clears the school profile", () => {
    const suggestion = suggestCollegeBucket(
      makeProfile(),
      makeSchool({
        admissionRate: 0.22,
      }),
    );

    expect(suggestion.bucket).toBe("likely");
    expect(suggestion.fitScore).toBeGreaterThan(70);
    expect(suggestion.fitRationale).toContain("projected testing");
  });

  it("falls back to admission rate when testing data is unavailable", () => {
    const suggestion = suggestCollegeBucket(
      makeProfile({
        currentSat: undefined,
        projectedSat: undefined,
        currentAct: undefined,
        projectedAct: undefined,
      }),
      makeSchool({
        satAverage: undefined,
        admissionRate: 0.42,
        matchedPrograms: [],
      }),
    );

    expect(suggestion.bucket).toBe("likely");
    expect(suggestion.fitRationale).toContain("admission rate");
  });

  it("builds saved list inputs from a stable school snapshot", () => {
    const school = makeSchool();
    const suggestion = suggestCollegeBucket(makeProfile(), school);

    const input = makeCollegeListItemInput("list-1", school, suggestion, 3);

    expect(input.familyCollegeListId).toBe("list-1");
    expect(input.matchedProgramCodes).toEqual(["1107"]);
    expect(input.matchedProgramLabels).toEqual(["Computer Science"]);
    expect(input.bucketSource).toBe("system");
    expect(input.sortOrder).toBe(3);
  });
});
