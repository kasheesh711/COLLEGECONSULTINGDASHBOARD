"use server";

import { redirect } from "next/navigation";

export async function applyCollegeFilters(formData: FormData) {
  const params = new URLSearchParams();

  const fields = [
    "family",
    "q",
    "state",
    "city",
    "programCode",
    "ownership",
    "satMin",
    "satMax",
    "admissionRateMin",
    "admissionRateMax",
    "sizeMin",
    "sizeMax",
    "netPriceMax",
    "completionMin",
    "retentionMin",
    "earningsMin",
    "zip",
    "distance",
    "sort",
  ];

  for (const field of fields) {
    const value = String(formData.get(field) ?? "").trim();
    if (!value) continue;
    if (field === "ownership" && value === "all") continue;
    if (field === "sort" && value === "name_asc") continue;
    params.set(field, value);
  }

  redirect(`/colleges${params.size ? `?${params.toString()}` : ""}`);
}
