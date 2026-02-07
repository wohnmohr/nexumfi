"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { dashboardBottomNavItems, dapBottomNavItems, isDapRoute } from "./nav-items";

export function BottomNav() {
  const pathname = usePathname();
  const navItems = isDapRoute(pathname) ? dapBottomNavItems : dashboardBottomNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-sidebar-border bg-sidebar/95 backdrop-blur-lg md:hidden">
      <div className="flex items-center justify-around px-1 safe-area-bottom">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-3 py-2 text-[11px] font-medium transition-colors min-w-[56px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground active:text-foreground"
              )}
            >
              {/* Active indicator dot */}
              {isActive && (
                <span className="absolute top-0.5 left-1/2 -translate-x-1/2 h-[2px] w-5 rounded-full bg-primary" />
              )}
              <item.icon
                className={cn(
                  "size-5 transition-colors",
                  isActive && "text-primary"
                )}
              />
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
