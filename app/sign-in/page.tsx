import { MailCheck } from "lucide-react";
import { requestMagicLink } from "@/app/sign-in/actions";
import { InternalSurfaceHero } from "@/components/shared/internal-surface-hero";
import { SectionCard } from "@/components/shared/section-card";
import { getAppModeLabel, isSupabaseConfigured } from "@/lib/auth/config";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getStringValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const errorMap: Record<string, string> = {
  missing_email: "Enter an email address to receive the magic link.",
  demo_mode: "Supabase is not configured yet, so sign-in is disabled and the workspace is running in demo mode.",
  auth_callback_failed:
    "The magic link could not be completed. Request a fresh link and try again.",
  profile_bootstrap_failed:
    "Your sign-in completed, but the linked profile could not be prepared. Verify the matching profile record and try again.",
  profile_not_linked:
    "Your email is not linked to a dashboard profile yet. Add a matching profile row before signing in again.",
  email_not_allowed:
    "This email is not authorized to access the dashboard. Contact the administrator if you believe this is a mistake.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolved = await searchParams;
  const sent = getStringValue(resolved.sent);
  const rawError = getStringValue(resolved.error);
  const next = getStringValue(resolved.next) ?? "/dashboard";
  const message = rawError ? errorMap[rawError] ?? rawError : null;
  const live = isSupabaseConfigured();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <InternalSurfaceHero
        eyebrow="Authentication"
        title="Magic-link sign in"
        description="One entry point for internal staff and invited parents. Access scope is determined by the linked Supabase profile and household relationship."
        variant="auth"
      >
        <span className="ui-chip" data-tone="accent">
          {getAppModeLabel()}
        </span>
        <span className="ui-chip" data-tone="muted">
          Passwordless access
        </span>
      </InternalSurfaceHero>

      <SectionCard
        eyebrow="Access"
        title={getAppModeLabel()}
        description="In demo mode the form remains visible, but sign-in stays disabled."
        icon={MailCheck}
        variant="auth"
      >
        <form action={requestMagicLink} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <label className="block space-y-2 text-sm">
            <span className="font-semibold text-[var(--foreground-soft)]">Email</span>
            <input
              type="email"
              name="email"
              placeholder="name@example.com"
              disabled={!live}
              className="ui-field disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>
          <button
            type="submit"
            disabled={!live}
            className="ui-button-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            Send magic link
          </button>
        </form>
        {sent ? (
          <p className="mt-4 rounded-[1.25rem] border border-[var(--success)]/14 bg-[var(--success-soft)] px-4 py-3 text-sm text-[var(--success)]">
            Magic link sent. Check your inbox and complete the redirect back to `/auth/callback`.
          </p>
        ) : null}
        {message ? (
          <p className="mt-4 rounded-[1.25rem] border border-[var(--warn)]/14 bg-[var(--warn-soft)] px-4 py-3 text-sm text-[var(--warn)]">
            {message}
          </p>
        ) : null}
      </SectionCard>
    </div>
  );
}
