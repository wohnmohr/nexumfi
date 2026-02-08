import {
  LayoutDashboard,
  Wallet,
  Settings,
  User,
  CreditCard,
  Gift,
  ArrowDownToLine,
  PieChart,
  Database,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/** Nav items shown on /dashboard (non-DAP) routes */
export const dashboardNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Get Credit", href: "/dashboard/get-credit", icon: CreditCard },
  { label: "Wallet", href: "/dashboard/wallet", icon: Wallet },
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

/** Nav items shown on /dashboard/dap/* routes */
export const dapNavItems: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Deposit", href: "/dashboard/dap/deposit", icon: ArrowDownToLine },
  { label: "Portfolio", href: "/dashboard/dap/portfolio", icon: PieChart },
  { label: "Rewards", href: "/dashboard/dap/rewards", icon: Gift },
  { label: "Data Room", href: "/dashboard/dap/data-room", icon: Database },
];

/** Bottom nav items for /dashboard (non-DAP) routes */
export const dashboardBottomNavItems: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Credit", href: "/dashboard/get-credit", icon: CreditCard },
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "Wallet", href: "/dashboard/wallet", icon: Wallet },
];

/** Bottom nav items for /dashboard/dap/* routes */
export const dapBottomNavItems: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Deposit", href: "/dashboard/dap/deposit", icon: ArrowDownToLine },
  { label: "Portfolio", href: "/dashboard/dap/portfolio", icon: PieChart },
  { label: "Rewards", href: "/dashboard/dap/rewards", icon: Gift },
  { label: "Data Room", href: "/dashboard/dap/data-room", icon: Database },
];

/** Helper: check if current pathname is inside DAP section */
export function isDapRoute(pathname: string) {
  return pathname.startsWith("/dashboard/dap");
}
