"use server";

import { redirect } from "next/navigation";

export async function applyAnalyticsFilters(formData: FormData) {
  const params = new URLSearchParams();

  const fields = [
    "schoolQuery",
    "school",
    "major",
    "gpaMin",
    "gpaMax",
    "satMin",
    "satMax",
    "actMin",
    "actMax",
    "outcome",
    "metric",
  ];

  for (const field of fields) {
    const value = String(formData.get(field) ?? "").trim();
    if (!value) continue;
    if (field === "outcome" && value === "all") continue;
    if (field === "metric" && value === "sat") continue;
    params.set(field, value);
  }

  redirect(`/analytics${params.size ? `?${params.toString()}` : ""}`);
}
