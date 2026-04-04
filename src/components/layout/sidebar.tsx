"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUnreadCount } from "@/hooks/queries/use-chat";
import {
  LayoutDashboard,
  Users,
  FileText,
  FolderOpen,
  UserCog,
  Share2,
  MessageSquare,
  Bell,
  GraduationCap,
  MessageCircle,
  HelpCircle,
  UserSearch,
  Megaphone,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Users", href: "/users", icon: Users },
  { title: "Loans", href: "/loans", icon: FileText },
  { title: "Documents", href: "/documents", icon: FolderOpen },
  { title: "Counselors", href: "/counselors", icon: UserCog },
  { title: "Chat", href: "/chat", icon: MessageCircle, badge: true },
  { title: "FAQ Management", href: "/faqs", icon: HelpCircle },
  { title: "Guest Leads", href: "/guest-chats", icon: UserSearch },
  { title: "Landing Leads", href: "/landing-leads", icon: Megaphone },
  { title: "Referrals", href: "/referrals", icon: Share2 },
  { title: "Contacts", href: "/contacts", icon: MessageSquare },
  { title: "Notifications", href: "/notifications", icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count || 0;

  return (
    <div className="hidden border-r bg-background md:block md:w-64">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <GraduationCap className="h-6 w-6" />
            <span>FMC Admin</span>
          </Link>
        </div>
        <ScrollArea className="flex-1 py-4">
          <nav className="grid gap-1 px-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  pathname.startsWith(item.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1">{item.title}</span>
                {item.badge && unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </ScrollArea>
      </div>
    </div>
  );
}
