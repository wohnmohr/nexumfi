"use client";

import { useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { dashboardNavItems, dapNavItems, isDapRoute } from "./nav-items";
import { signOut } from "@/app/login/actions";

export function Sidebar() {
  const pathname = usePathname();
  const [isSigningOut, startTransition] = useTransition();
  const inDap = isDapRoute(pathname);
  const navItems = inDap ? dapNavItems : dashboardNavItems;

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut();
    });
  };

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 pt-4">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {inDap ? "DAP" : "Menu"}
        </p>
        {navItems.map((item) => {
          // Dashboard root: only active when pathname is exactly /dashboard
          const isDashboardRoot = item.href === "/dashboard";
          const isActive = isDashboardRoot
            ? pathname === "/dashboard"
            : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-full bg-sidebar-primary" />
              )}
              <item.icon
                className={cn(
                  "size-5 shrink-0 transition-colors",
                  isActive
                    ? "text-sidebar-primary"
                    : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors disabled:opacity-50"
        >
          {isSigningOut ? (
            <Loader2 className="size-5 text-sidebar-foreground/50 animate-spin" />
          ) : (
            <LogOut className="size-5 text-sidebar-foreground/50" />
          )}
          {isSigningOut ? "Signing out..." : "Sign Out"}
        </button>
      </div>
    </aside>
  );
}
