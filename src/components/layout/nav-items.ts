import {
  LayoutDashboard,
  Compass,
  Wallet,
  Bell,
  Settings,
  User,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const mainNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "Wallet", href: "/wallet", icon: Wallet },
  { label: "Activity", href: "/activity", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const bottomNavItems: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "Wallet", href: "/wallet", icon: Wallet },
  { label: "Activity", href: "/activity", icon: Bell },
  { label: "Profile", href: "/profile", icon: User },
];
