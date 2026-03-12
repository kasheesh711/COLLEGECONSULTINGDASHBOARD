import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured } from "@/lib/auth/config";
import {
  ACTIVE_ROLE_COOKIE_MAX_AGE,
  ACTIVE_ROLE_COOKIE_NAME,
  resolveActiveRole,
} from "@/lib/auth/roles";
import { normalizeAppPath } from "@/lib/auth/session";

type CallbackProfileRecord = {
  id: string;
  profile_roles?: Array<{ role: "strategist" | "ops" | "parent" }> | null;
};

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = normalizeAppPath(requestUrl.searchParams.get("next"), "/dashboard");

  if (!isSupabaseConfigured() || !code) {
    return NextResponse.redirect(new URL("/sign-in", requestUrl.origin));
  }

  const response = NextResponse.redirect(new URL(next, requestUrl.origin));
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(
      new URL(`/sign-in?error=auth_callback_failed&next=${encodeURIComponent(next)}`, requestUrl.origin),
    );
  }

  const { error: bootstrapError } = await supabase.rpc("bootstrap_profile");

  if (bootstrapError) {
    return NextResponse.redirect(
      new URL(`/sign-in?error=profile_bootstrap_failed&next=${encodeURIComponent(next)}`, requestUrl.origin),
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, profile_roles(role)")
      .eq("auth_user_id", user.id)
      .maybeSingle<CallbackProfileRecord>();

    const roles = (profile?.profile_roles ?? []).map((item) => item.role);
    const activeRole = resolveActiveRole(
      roles,
      request.cookies.get(ACTIVE_ROLE_COOKIE_NAME)?.value,
    );

    if (activeRole) {
      response.cookies.set(ACTIVE_ROLE_COOKIE_NAME, activeRole, {
        path: "/",
        sameSite: "lax",
        httpOnly: true,
        maxAge: ACTIVE_ROLE_COOKIE_MAX_AGE,
      });
    } else {
      response.cookies.delete(ACTIVE_ROLE_COOKIE_NAME);
    }
  }

  return response;
}
