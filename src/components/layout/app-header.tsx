"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Bell, Layers, Loader2, LogOut, Menu, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/app/login/actions";
import { AppLogo } from "./app-logo";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface AppHeaderProps {
  onMenuToggle?: () => void;
}

function getDisplayName(user: SupabaseUser | null): string {
  if (!user) return "User";
  const meta = user.user_metadata;
  const name = meta?.full_name ?? meta?.name ?? "";
  return name.trim() || "User";
}

function getInitials(user: SupabaseUser | null): string {
  const name = getDisplayName(user);
  if (name === "User") return "U";
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function AppHeader({ onMenuToggle }: AppHeaderProps) {
  const [isSigningOut, startTransition] = useTransition();
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut();
    });
  };

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-sidebar-border bg-sidebar">
      <div className="flex h-full items-center">
        {/* Logo area — aligns with sidebar width on desktop */}
        <div className="flex items-center gap-3 px-4 md:w-60 md:border-r md:border-sidebar-border h-full shrink-0">
          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-sidebar-foreground"
            onClick={onMenuToggle}
          >
            <Menu className="size-5" />
          </Button>

          {/* Logo */}
          <AppLogo href="/dashboard" className="text-sidebar-foreground" />
        </div>

        {/* Main header content */}
        <div className="flex flex-1 items-center gap-4 px-4">
          <div className="flex-1" />

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-sidebar-foreground"
          >
            <Bell className="size-5" />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-sidebar" />
          </Button>

          {/* User avatar with dropdown menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar size="sm">
                  <AvatarFallback>{getInitials(user)}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-sidebar text-sidebar-foreground border-sidebar-border ring-sidebar-border"
            >
              <DropdownMenuLabel>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-sidebar-foreground">
                    {getDisplayName(user)}
                  </span>
                  <span className="text-xs text-sidebar-foreground/50 truncate">
                    {user?.email ?? "—"}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-sidebar-border" />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  asChild
                  className="text-sidebar-foreground/70 focus:bg-primary/15 focus:text-sidebar-foreground"
                >
                  <Link href="/dashboard/dap/portfolio">
                    <Layers className="size-4" />
                    Earn
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="text-sidebar-foreground/70 focus:bg-primary/15 focus:text-sidebar-foreground"
                >
                  <Link href="/dashboard/profile">
                    <User className="size-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="text-sidebar-foreground/70 focus:bg-primary/15 focus:text-sidebar-foreground"
                >
                  <Link href="/dashboard/settings">
                    <Settings className="size-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-sidebar-border" />
              <DropdownMenuItem
                variant="destructive"
                className="focus:bg-destructive/10 focus:text-destructive"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                {isSigningOut ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <LogOut className="size-4" />
                )}
                {isSigningOut ? "Signing out..." : "Sign out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
