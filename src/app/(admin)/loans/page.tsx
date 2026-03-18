"use client";

import { useState } from "react";
import Link from "next/link";
import { useLoans } from "@/hooks/queries/use-loans";
import { useCounselors } from "@/hooks/queries/use-counselors";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LOAN_STATUS_OPTIONS } from "@/lib/constants";
import { formatCurrency, formatDate, formatStatus } from "@/lib/utils";
import { Eye } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { LoanApplication } from "@/types/loan";

export default function LoansPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [counselorFilter, setCounselorFilter] = useState<string>("");

  const { data: loans, isLoading } = useLoans({
    status: statusFilter || undefined,
    counselor_id: counselorFilter || undefined,
  });
  const { data: counselors } = useCounselors();

  const columns: ColumnDef<LoanApplication>[] = [
    {
      accessorKey: "application_id",
      header: "App ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.application_id}</span>
      ),
    },
    { accessorKey: "full_name", header: "Name" },
    { accessorKey: "target_country", header: "Country" },
    { accessorKey: "target_college", header: "College" },
    {
      accessorKey: "loan_amount",
      header: "Amount",
      cell: ({ row }) => formatCurrency(row.original.loan_amount),
    },
    {
      accessorKey: "bank_name",
      header: "Bank",
      cell: ({ row }) => row.original.bank_name || "—",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "assigned_counselor_id",
      header: "Counselor",
      cell: ({ row }) => {
        const counselor = counselors?.find((c) => c.id === row.original.assigned_counselor_id);
        return counselor?.name || "—";
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Link href={`/loans/${row.original.id}`}>
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Loan Applications" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Loan Applications"
        description={`${loans?.length || 0} applications`}
      />

      <div className="flex gap-4">
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {LOAN_STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {formatStatus(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={counselorFilter}
          onValueChange={(v) => setCounselorFilter(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Counselors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Counselors</SelectItem>
            {counselors?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={loans || []} />
    </div>
  );
}
