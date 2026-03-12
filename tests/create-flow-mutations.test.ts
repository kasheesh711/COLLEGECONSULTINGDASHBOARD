import { beforeEach, describe, expect, it, vi } from "vitest";

const { createSupabaseServerClient } = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient,
}));

import {
  createFamilyWithStudent,
  createStudent,
} from "@/lib/db/mutations";

type Result<T> = {
  data: T | null;
  error: { code?: string; message?: string } | null;
};

function buildMutationClient(options?: {
  familyInsertResults?: Array<Result<{ id: string; slug: string }>>;
  studentInsertResults?: Array<Result<{ id: string; slug: string }>>;
  familyContactError?: { message?: string } | null;
  testingProfileInsertError?: { message?: string } | null;
  familyTouchError?: { message?: string } | null;
}) {
  const state = {
    familyInsertPayloads: [] as Array<Record<string, unknown>>,
    studentInsertPayloads: [] as Array<Record<string, unknown>>,
    familyContactPayloads: [] as Array<Record<string, unknown>>,
    testingProfilePayloads: [] as Array<Record<string, unknown>>,
    familyDeletes: [] as string[],
    studentDeletes: [] as string[],
    familyTouches: [] as Array<Record<string, unknown>>,
  };

  const familyInsertResults = [...(options?.familyInsertResults ?? [])];
  const studentInsertResults = [...(options?.studentInsertResults ?? [])];

  return {
    state,
    client: {
      from(table: string) {
        if (table === "families") {
          return {
            insert(payload: Record<string, unknown>) {
              state.familyInsertPayloads.push(payload);
              return {
                select() {
                  return {
                    single: async () =>
                      familyInsertResults.shift() ?? {
                        data: { id: "family-1", slug: String(payload.slug) },
                        error: null,
                      },
                  };
                },
              };
            },
            update(payload: Record<string, unknown>) {
              state.familyTouches.push(payload);
              return {
                eq: async (_column: string, id: string) => {
                  state.familyTouches.push({ id });
                  return { error: options?.familyTouchError ?? null };
                },
              };
            },
            delete() {
              return {
                eq: async (_column: string, id: string) => {
                  state.familyDeletes.push(id);
                  return { error: null };
                },
              };
            },
          };
        }

        if (table === "family_contacts") {
          return {
            insert: async (payload: Record<string, unknown>) => {
              state.familyContactPayloads.push(payload);
              return { error: options?.familyContactError ?? null };
            },
          };
        }

        if (table === "students") {
          return {
            insert(payload: Record<string, unknown>) {
              state.studentInsertPayloads.push(payload);
              return {
                select() {
                  return {
                    single: async () =>
                      studentInsertResults.shift() ?? {
                        data: { id: "student-1", slug: String(payload.slug) },
                        error: null,
                      },
                  };
                },
              };
            },
            delete() {
              return {
                eq: async (_column: string, id: string) => {
                  state.studentDeletes.push(id);
                  return { error: null };
                },
              };
            },
          };
        }

        if (table === "student_testing_profiles") {
          return {
            select() {
              return {
                eq() {
                  return {
                    maybeSingle: async () => ({ data: null, error: null }),
                  };
                },
              };
            },
            insert: async (payload: Record<string, unknown>) => {
              state.testingProfilePayloads.push(payload);
              return { error: options?.testingProfileInsertError ?? null };
            },
            update: () => ({
              eq: async () => ({ error: null }),
            }),
          };
        }

        throw new Error(`Unhandled table mock: ${table}`);
      },
    },
  };
}

describe("create-flow mutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retries family slug creation with a suffix after a unique collision", async () => {
    const mock = buildMutationClient({
      familyInsertResults: [
        {
          data: null,
          error: { code: "23505", message: "duplicate key value violates unique constraint" },
        },
        {
          data: { id: "family-1", slug: "morgan-family-2" },
          error: null,
        },
      ],
    });
    createSupabaseServerClient.mockResolvedValue(mock.client);

    const result = await createFamilyWithStudent({
      familyLabel: "Morgan Family",
      parentContactName: "Taylor Morgan",
      parentEmail: "taylor@example.com",
      studentName: "Alex Morgan",
      gradeLevel: "Grade 11",
      pathway: "us_college",
      tier: "Core",
      currentPhase: "Launch",
      overallStatus: "green",
      statusReason: "The student has a clear launch plan and no active blockers.",
    });

    expect(mock.state.familyInsertPayloads.map((payload) => payload.slug)).toEqual([
      "morgan-family",
      "morgan-family-2",
    ]);
    expect(result.family.slug).toBe("morgan-family-2");
  });

  it("removes the new family if first-student testing setup fails", async () => {
    const mock = buildMutationClient({
      testingProfileInsertError: { message: "testing profile write failed" },
    });
    createSupabaseServerClient.mockResolvedValue(mock.client);

    await expect(
      createFamilyWithStudent({
        familyLabel: "Morgan Family",
        parentContactName: "Taylor Morgan",
        parentEmail: "taylor@example.com",
        studentName: "Alex Morgan",
        gradeLevel: "Grade 11",
        pathway: "us_college",
        tier: "Core",
        currentPhase: "Launch",
        overallStatus: "green",
        statusReason: "The student has a clear launch plan and no active blockers.",
        currentSat: 1410,
      }),
    ).rejects.toThrow("testing profile write failed");

    expect(mock.state.familyDeletes).toEqual(["family-1"]);
  });

  it("removes the new student if the family touch fails after creation", async () => {
    const mock = buildMutationClient({
      familyTouchError: { message: "family touch failed" },
    });
    createSupabaseServerClient.mockResolvedValue(mock.client);

    await expect(
      createStudent({
        familyId: "family-1",
        familySlug: "morgan-family",
        studentName: "Alex Morgan",
        gradeLevel: "Grade 11",
        pathway: "us_college",
        tier: "Core",
        currentPhase: "Launch",
        overallStatus: "green",
        statusReason: "The student has a clear launch plan and no active blockers.",
      }),
    ).rejects.toThrow("family touch failed");

    expect(mock.state.studentDeletes).toEqual(["student-1"]);
  });
});
