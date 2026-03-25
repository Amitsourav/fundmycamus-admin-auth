"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { BorderBeam } from "@/components/ui/border-beam";
import {
  FileText,
  FolderOpen,
  Users2,
  Share2,
  ArrowRight,
} from "lucide-react";

const quickActions = [
  {
    title: "Loan Applications",
    description: "Review and process student loans",
    href: "/loans",
    icon: FileText,
    gradient: "from-blue-500/10 to-indigo-500/10",
    iconColor: "text-blue-600",
    beamFrom: "#3b82f6",
    beamTo: "#6366f1",
  },
  {
    title: "Documents",
    description: "Verify uploaded student documents",
    href: "/documents",
    icon: FolderOpen,
    gradient: "from-amber-500/10 to-orange-500/10",
    iconColor: "text-amber-600",
    beamFrom: "#f59e0b",
    beamTo: "#f97316",
  },
  {
    title: "Counselors",
    description: "Manage team and assignments",
    href: "/counselors",
    icon: Users2,
    gradient: "from-emerald-500/10 to-teal-500/10",
    iconColor: "text-emerald-600",
    beamFrom: "#10b981",
    beamTo: "#14b8a6",
  },
  {
    title: "Referrals",
    description: "Track referrals and payouts",
    href: "/referrals",
    icon: Share2,
    gradient: "from-violet-500/10 to-purple-500/10",
    iconColor: "text-violet-600",
    beamFrom: "#8b5cf6",
    beamTo: "#a855f7",
  },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function WelcomeHero() {
  const { user } = useAuth();
  const displayName = user?.name || user?.email?.split("@")[0] || "Admin";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {getGreeting()}, {displayName}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what needs your attention today.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href} className="group">
            <div
              className={`relative overflow-hidden rounded-xl border bg-gradient-to-br ${action.gradient} p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
            >
              <BorderBeam
                size={120}
                duration={8}
                colorFrom={action.beamFrom}
                colorTo={action.beamTo}
                borderWidth={1.5}
              />
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-lg bg-background/80 shadow-sm ${action.iconColor}`}
                  >
                    <action.icon className="h-4.5 w-4.5" strokeWidth={1.8} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{action.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/40 transition-all duration-300 group-hover:text-foreground group-hover:translate-x-0.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
