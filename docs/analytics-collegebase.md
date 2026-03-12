# Collegebase Analytics Dataset

This route is an internal-only, read-only reference tool. It does not read from live BeGifted operational records.

## Source of truth

- Normalized dataset path: `tmp/collegebase/collegebase-applications.normalized.json`
- Raw capture path: `tmp/collegebase/collegebase-applications.raw.json`
- Debug capture path: `tmp/collegebase/collegebase-applications.debug.json`
- Refresh command: `npm run extract:collegebase`

## Dataset assumptions

- Accepted and rejected comparisons are computed from applicant-level outcomes in the normalized local export.
- Waitlists remain separate and do not count toward accepted versus rejected summaries.
- Drill-down pages intentionally use extracted profile labels and source ids because the source export does not contain live BeGifted student identities.
- The normalization layer repairs a few known legacy issues so the analytics view stays usable:
  - pre-2016 2400-scale SAT values are converted to the 1600 scale
  - ACT values accidentally stored in the SAT field are recovered when they fit the ACT range
  - 100-point GPA values are normalized when they fit the documented conversion range

## Refresh process

1. Run `npm run extract:collegebase`.
2. Confirm the command rewrites the files in `tmp/collegebase/`.
3. Open `/analytics` and verify the route loads without the dataset-unavailable state.
4. Spot-check at least one school with both accepted and rejected applicants.
5. Open one applicant drill-down and confirm the back link returns to the same filtered `/analytics` state.

## Verification checklist

- The dataset loads from the normalized JSON file without schema errors.
- School filtering remains deterministic for the same URL query string.
- Waitlists are visible only in the drill-down detail, not in accepted versus rejected summaries.
- No operational write paths, auth behavior, or portal data contracts are involved in the analytics refresh.
