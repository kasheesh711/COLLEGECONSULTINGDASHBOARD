"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export function SidebarToggle({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger — mobile only */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-full border border-[var(--border)] bg-[rgba(251,247,241,0.94)] p-3 shadow-[var(--shadow-soft)] backdrop-blur-xl lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5 text-[var(--foreground)]" />
      </button>

      {/* Overlay — mobile only */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-[rgba(21,40,61,0.18)] backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar container — single render, CSS-driven visibility */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-[272px] transition-transform duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button — mobile only */}
        <button
          onClick={() => setOpen(false)}
          className="absolute right-3 top-4 z-10 rounded-full p-2 text-[var(--foreground-soft)] hover:bg-white/60 lg:hidden"
          aria-label="Close navigation"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </>
  );
}
