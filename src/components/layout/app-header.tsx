"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Bell, Loader2, LogOut, Menu, Search, Settings, User } from "lucide-react";
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

interface AppHeaderProps {
  onMenuToggle?: () => void;
}

export function AppHeader({ onMenuToggle }: AppHeaderProps) {
  const [isSigningOut, startTransition] = useTransition();

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
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                H
              </span>
            </div>
            <span className="font-semibold text-sidebar-foreground text-base">
              HyperMonks
            </span>
          </Link>
        </div>

        {/* Main header content */}
        <div className="flex flex-1 items-center gap-4 px-4">
          {/* Search bar (desktop only) */}
          <button className="hidden md:flex items-center gap-2 rounded-lg border border-sidebar-border bg-background/50 px-3 py-1.5 text-sm text-muted-foreground w-72 hover:bg-background/80 transition-colors">
            <Search className="size-4 shrink-0" />
            <span>Search...</span>
            <kbd className="ml-auto pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-sidebar-border bg-sidebar px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>

          <div className="flex-1" />

          {/* Mobile search */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-sidebar-foreground"
          >
            <Search className="size-5" />
          </Button>

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
                  <AvatarFallback>U</AvatarFallback>
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
                    User
                  </span>
                  <span className="text-xs text-sidebar-foreground/50">
                    user@example.com
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-sidebar-border" />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  asChild
                  className="text-sidebar-foreground/70 focus:bg-primary/15 focus:text-sidebar-foreground"
                >
                  <Link href="/profile">
                    <User className="size-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="text-sidebar-foreground/70 focus:bg-primary/15 focus:text-sidebar-foreground"
                >
                  <Link href="/settings">
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
