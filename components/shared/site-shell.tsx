import Link from "next/link";
import { headers } from "next/headers";
import clsx from "clsx";
import {
  ChartColumn,
  ChevronRight,
  Files,
  GraduationCap,
  House,
  LayoutDashboard,
  LogIn,
  School,
  Users,
} from "lucide-react";
import { switchActiveRole } from "@/app/sign-in/actions";
import { getAppModeLabel } from "@/lib/auth/config";
import { formatRoleLabel, getInternalRoles } from "@/lib/auth/roles";
import { getOptionalSessionAccess } from "@/lib/auth/session";
import { SidebarToggle } from "@/components/shared/sidebar-toggle";

const navGroups = [
  {
    label: "Home",
    items: [{ href: "/", label: "Workspace", icon: House }],
  },
  {
    label: "Internal",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/families", label: "Families", icon: Users },
      { href: "/analytics", label: "Analytics", icon: ChartColumn },
      { href: "/colleges", label: "Colleges", icon: School },
      { href: "/students/new", label: "Students", icon: GraduationCap },
    ],
  },
  {
    label: "Client",
    items: [
      { href: "/portal", label: "Parent portal", icon: Files },
      { href: "/sign-in", label: "Sign in", icon: LogIn },
    ],
  },
];

function isActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const actor = await getOptionalSessionAccess();
  const internalRoles = actor ? getInternalRoles(actor.roles) : [];
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "/";

  const sidebarContent = (
    <div className="flex h-full flex-col overflow-y-auto border-r border-[var(--border)] bg-[rgba(251,247,241,0.94)] px-5 py-6 shadow-[2px_0_26px_rgba(21,40,61,0.04)] backdrop-blur-xl">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3">
        <span className="section-title rounded-full bg-[var(--foreground)] px-3 py-2 text-xs font-semibold tracking-[0.18em] text-white shadow-[0_2px_8px_rgba(21,40,61,0.18)]">
          BG
        </span>
        <div>
          <p className="section-title text-lg font-semibold leading-none">BeGifted</p>
          <p className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[var(--brand-blue)]">
            Boutique advisory workspace
          </p>
        </div>
      </Link>

      {/* App mode chip */}
      <div className="mt-5">
        <div className="ui-chip" data-tone="accent">
          {getAppModeLabel()}
        </div>
      </div>

      <div className="ui-divider" />

      {/* Navigation */}
      <nav className="flex-1 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--brand-blue)]">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = isActive(href, pathname);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={clsx(
                      "flex items-center gap-3 rounded-[1rem] px-3 py-2.5 text-sm font-medium",
                      active
                        ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                        : "text-[var(--foreground)] hover:bg-white/60"
                    )}
                  >
                    <Icon
                      className={clsx(
                        "h-4 w-4",
                        active ? "text-[var(--accent)]" : "text-[var(--foreground-soft)]"
                      )}
                    />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto pt-4">
        <div className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.18em] text-[var(--foreground-soft)]">
          <span>Internal cockpit</span>
          <ChevronRight className="h-3 w-3" />
          <span>Parent-safe portal</span>
        </div>

        <div className="ui-divider" />

        {/* User profile */}
        {actor ? (
          <div className="rounded-[1.25rem] border border-[var(--border)] bg-white/86 px-4 py-3 shadow-[0_10px_24px_rgba(21,40,61,0.04)]">
            <p className="text-sm font-semibold text-[var(--foreground)]">{actor.fullName}</p>
            <p className="mt-1 text-[0.69rem] font-semibold uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              {actor.mode === "demo"
                ? "Demo internal access"
                : actor.activeRole
                  ? formatRoleLabel(actor.activeRole)
                  : "Unassigned"}
            </p>
            <p className="mt-2 text-xs text-[var(--foreground-soft)]">
              {actor.roles.map((role) => formatRoleLabel(role)).join(" / ")}
            </p>
            {internalRoles.length > 1 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {internalRoles.map((role) => (
                  <form key={role} action={switchActiveRole}>
                    <input type="hidden" name="nextRole" value={role} />
                    <button
                      type="submit"
                      className={
                        actor.activeRole === role
                          ? "ui-button-primary px-3 py-2 text-[0.66rem]"
                          : "ui-button-secondary px-3 py-2 text-[0.66rem]"
                      }
                    >
                      {formatRoleLabel(role)}
                    </button>
                  </form>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <SidebarToggle>{sidebarContent}</SidebarToggle>
      <main className="px-4 pt-16 pb-10 md:px-8 md:pb-12 lg:ml-[272px] lg:pt-10">
        {children}
      </main>
    </div>
  );
}
