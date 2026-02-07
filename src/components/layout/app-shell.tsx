"use client";

import { useState, useCallback } from "react";
import { AppHeader } from "./app-header";
import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { MobileNav } from "./mobile-nav";
import { AmlGate } from "@/components/aml-gate";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleMenuToggle = useCallback(() => {
    setMobileNavOpen((prev) => !prev);
  }, []);

  const handleMobileNavClose = useCallback(() => {
    setMobileNavOpen(false);
  }, []);

  return (
    <AmlGate>
      <div className="min-h-dvh bg-background">
        {/* Top header — full width */}
        <AppHeader onMenuToggle={handleMenuToggle} />

        {/* Main layout: sidebar + content */}
        <div className="flex h-[calc(100dvh-3.5rem)]">
          {/* Desktop sidebar */}
          <Sidebar />

          {/* Page content — extra bottom padding on mobile for bottom nav */}
          <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
            {children}
          </main>
        </div>

        {/* Mobile bottom nav bar */}
        <BottomNav />

        {/* Mobile slide-over drawer (hamburger menu) */}
        <MobileNav isOpen={mobileNavOpen} onClose={handleMobileNavClose} />
      </div>
    </AmlGate>
  );
}
