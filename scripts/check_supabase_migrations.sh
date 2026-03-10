#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP_ROOT="${ROOT_DIR}/tmp/pg-schema-check"
PGDATA="${TMP_ROOT}/data"
LOGFILE="${TMP_ROOT}/postgres.log"
PORT="${SUPABASE_SCHEMA_CHECK_PORT:-55432}"

rm -rf "${TMP_ROOT}"
mkdir -p "${TMP_ROOT}"

cleanup() {
  if [[ -d "${PGDATA}" ]]; then
    pg_ctl -D "${PGDATA}" -m immediate stop >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT

initdb -D "${PGDATA}" >/dev/null
pg_ctl -D "${PGDATA}" -o "-p ${PORT}" -l "${LOGFILE}" start >/dev/null
createdb -p "${PORT}" schema_check

psql -p "${PORT}" -d schema_check <<'SQL' >/dev/null
create role anon nologin;
create role authenticated nologin;
create schema auth;
create function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
create function auth.jwt() returns jsonb language sql stable as $$ select '{}'::jsonb $$;
SQL

migrations=(
  "supabase/migrations/20260310_initial_schema.sql"
  "supabase/migrations/20260310_multi_role_profiles.sql"
  "supabase/migrations/20260310_internal_pilot_auth.sql"
  "supabase/migrations/20260310_multi_student_family_workspace.sql"
  "supabase/migrations/20260310_family_college_scorecard_workspace.sql"
  "supabase/migrations/20260310_policy_function_security.sql"
  "supabase/migrations/20260310_app_schema_grants.sql"
  "supabase/migrations/20260310_security_alignment.sql"
)

for migration in "${migrations[@]}"; do
  psql -v ON_ERROR_STOP=1 -p "${PORT}" -d schema_check -f "${ROOT_DIR}/${migration}" >/dev/null
  printf 'applied %s\n' "${migration}"
done

psql -v ON_ERROR_STOP=1 -p "${PORT}" -d schema_check -f "${ROOT_DIR}/supabase/seed.sql" >/dev/null
printf 'seeded supabase/seed.sql\n'
