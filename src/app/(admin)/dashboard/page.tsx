"use client";

import { useDashboardStats } from "@/hooks/queries/use-dashboard";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  FolderOpen,
  Share2,
  Banknote,
  UserPlus,
  MessageSquare,
  Activity,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#f97316", "#84cc16", "#ec4899", "#6366f1",
];

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Overview of FundMyCampus operations" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statusData = Object.entries(stats.applications_by_status).map(([name, value]) => ({
    name: name.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    value,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of FundMyCampus operations" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total Users" value={stats.total_users} description={`+${stats.new_users_this_month} this month`} icon={Users} />
        <StatCard title="Applications" value={stats.total_applications} description={`+${stats.applications_this_month} this month`} icon={FileText} />
        <StatCard title="Disbursed" value={stats.total_disbursed} description={formatCurrency(stats.disbursed_amount_total)} icon={DollarSign} />
        <StatCard title="Conversion Rate" value={`${stats.conversion_rate.toFixed(1)}%`} description={`Avg: ${formatCurrency(stats.average_loan_amount)}`} icon={TrendingUp} />
        <StatCard title="New Users" value={stats.new_users_this_month} description="This month" icon={UserPlus} />
        <StatCard title="Pending Docs" value={stats.pending_documents} icon={FolderOpen} />
        <StatCard title="Active Referrals" value={stats.active_referrals} icon={Share2} />
        <StatCard title="Pending Payouts" value={stats.pending_payouts} icon={Banknote} />
        <StatCard title="New Contacts" value={stats.contact_submissions_new} icon={MessageSquare} />
        <StatCard title="Avg Loan" value={formatCurrency(stats.average_loan_amount)} icon={Activity} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Applications by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.top_countries}>
                <XAxis dataKey="country" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Banks</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.top_banks} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="bank" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Counselor Caseloads</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.counselor_caseloads}>
                <XAxis dataKey="counselor_id" tick={false} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="caseload" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
