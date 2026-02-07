"use client";

import { useEffect, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2, LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { mainNavItems } from "./nav-items";
import { signOut } from "@/app/login/actions";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const [isSigningOut, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut();
    });
  };

  // Close on route change
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-sidebar border-r border-sidebar-border shadow-2xl transition-transform duration-300 ease-in-out md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-sidebar-border shrink-0">
          <div className="flex items-center gap-2">
            <svg width="36" height="36" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
              <g transform="translate(15,15)">
                <rect x="0" y="20" width="70" height="50" rx="10" fill="#00CCFF" opacity="0.35"/>
                <rect x="10" y="15" width="70" height="50" rx="10" fill="#00CCFF" opacity="0.6"/>
                <rect x="20" y="10" width="70" height="50" rx="10" fill="#FF1493"/>
              </g>
            </svg>
            <span className="font-semibold text-sidebar-foreground">
              Nexum
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-sidebar-foreground"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto space-y-1 p-3 pt-4">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Menu
          </p>
          {mainNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
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
        <div className="border-t border-sidebar-border p-3 safe-area-bottom shrink-0">
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors disabled:opacity-50"
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
    </>
  );
}
