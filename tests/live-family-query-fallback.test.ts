import { beforeEach, describe, expect, it, vi } from "vitest";
import type { InternalAccess } from "@/lib/auth/session";

const { createSupabaseServerClient } = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("@/lib/auth/config", () => ({
  isSupabaseConfigured: () => true,
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient,
}));

import { listInternalFamilies } from "@/lib/db/queries";

describe("live family query fallback", () => {
  const actor: InternalAccess = {
    mode: "live",
    profileId: "11111111-1111-1111-1111-111111111111",
    email: "alicia.wong@begifted.example",
    fullName: "Alicia Wong",
    roles: ["ops", "strategist"],
    activeRole: "ops",
    familyScope: "all",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("falls back to the legacy family schema when student tables are unavailable", async () => {
    const select = vi
      .fn()
      .mockResolvedValueOnce({
        data: null,
        error: {
          code: "PGRST205",
          message: "Could not find the table 'public.students' in the schema cache",
          details: null,
          hint: null,
        },
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: "family-1",
            slug: "legacy-family",
            student_name: "Legacy Student",
            parent_contact_name: "Legacy Parent",
            pathway: "us_college",
            tier: "Core Pathway",
            strategist_owner_id: "11111111-1111-1111-1111-111111111111",
            ops_owner_id: "22222222-2222-2222-2222-222222222222",
            strategist: { full_name: "Alicia Wong" },
            ops: { full_name: "Narin Chai" },
            current_phase: "Launch and roadmap",
            overall_status: "yellow",
            status_reason: "Legacy-only family record",
            created_date: "2026-01-01",
            last_updated_date: "2026-03-10",
            family_contacts: [],
            monthly_summaries: [],
            academic_updates: [],
            profile_updates: [],
            tasks: [],
            decision_log_items: [],
            notes: [],
            artifact_links: [],
          },
        ],
        error: null,
      });

    createSupabaseServerClient.mockResolvedValue({
      from: vi.fn(() => ({
        select,
      })),
    });

    const families = await listInternalFamilies(actor);

    expect(select).toHaveBeenCalledTimes(2);
    expect(families).toEqual([
      expect.objectContaining({
        slug: "legacy-family",
        studentCount: 1,
        studentNames: ["Legacy Student"],
        strategistOwnerName: "Alicia Wong",
      }),
    ]);
  });
});
