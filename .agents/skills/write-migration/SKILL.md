# Write Migration

Use this skill when changing the Supabase schema.

## Checklist

- Add a new timestamped SQL file under `supabase/migrations/`.
- Keep existing data compatible unless the user explicitly approves a breaking change.
- Update `docs/data-model.md` with table, enum, index, and RLS changes.
- Add or adjust seed data if the new schema is required for local demo fidelity.
