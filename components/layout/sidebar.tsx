"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  CheckSquare,
  FileText,
  BarChart2,
  Settings,
  Zap,
  Lightbulb,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const NAV_ITEMS = [
  {
    label: "승인 대기",
    href: "/approval",
    icon: CheckSquare,
    badge: null,
  },
  {
    label: "아이디어",
    href: "/ideas",
    icon: Lightbulb,
    badge: null,
  },
  {
    label: "드래프트",
    href: "/drafts",
    icon: FileText,
    badge: null,
  },
  {
    label: "애널리틱스",
    href: "/analytics",
    icon: BarChart2,
    badge: null,
  },
  {
    label: "설정",
    href: "/settings",
    icon: Settings,
    badge: null,
  },
];

const ACCOUNTS = [
  { id: "mistakr", label: "Mistakr", color: "bg-blue-500" },
  { id: "100:0lab", label: "100:0LAB", color: "bg-orange-500" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-border bg-sidebar flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="h-14 flex items-center gap-2 px-4 border-b border-border">
        <Zap className="w-5 h-5 text-primary" />
        <span className="font-semibold text-sm tracking-tight">IG Dashboard</span>
      </div>

      {/* Accounts */}
      <div className="px-3 pt-4 pb-2">
        <p className="text-xs text-muted-foreground font-medium px-2 mb-2">계정</p>
        <div className="flex flex-col gap-1">
          {ACCOUNTS.map((acc) => (
            <div
              key={acc.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sidebar-accent cursor-pointer transition-colors"
            >
              <span className={cn("w-2 h-2 rounded-full shrink-0", acc.color)} />
              <span className="text-sm text-sidebar-foreground">{acc.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-3 h-px bg-border my-2" />

      {/* Nav */}
      <nav className="flex-1 px-3 pb-4">
        <p className="text-xs text-muted-foreground font-medium px-2 mb-2">메뉴</p>
        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-2 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge !== null && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
