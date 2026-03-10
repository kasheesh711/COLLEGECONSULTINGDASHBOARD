# Add Module

Use this skill when adding a new top-level workflow module to the dashboard.

## Rules

- Confirm the module belongs in MVP or backlog before coding.
- Update the relevant section in `docs/screens.md` and `docs/workflows.md`.
- Add any new domain types under `lib/domain`.
- Keep parent-visible behavior explicit; do not infer it from UI alone.
