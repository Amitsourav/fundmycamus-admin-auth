"use client";

import { useState } from "react";
import { useLandingLeads } from "@/hooks/queries/use-landing-leads";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { Megaphone } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { LandingLead } from "@/types/landing-lead";

const LOAN_STATUS_LABELS: Record<string, string> = {
  need_loan: "Need Loan",
  already_taken: "Already Taken",
  awaiting_calls: "Awaiting Calls",
  self_funding: "Self Funding",
};

export default function LandingLeadsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useLandingLeads({ page, limit: 20 });

  const leads = data?.data || [];
  const pagination = data?.pagination;

  const columns: ColumnDef<LandingLead>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => row.original.phone || "—",
    },
    {
      accessorKey: "source",
      header: "Source",
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.source.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      accessorKey: "loan_status",
      header: "Loan Status",
      cell: ({ row }) => (
        <Badge variant="outline">
          {LOAN_STATUS_LABELS[row.original.loan_status] || row.original.loan_status}
        </Badge>
      ),
    },
    {
      accessorKey: "consent",
      header: "Consent",
      cell: ({ row }) => (
        <Badge variant={row.original.consent ? "default" : "secondary"}>
          {row.original.consent ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Submitted",
      cell: ({ row }) => {
        const raw = row.original.created_at;
        if (!raw) return "—";
        // Handle "YYYY-MM-DD HH:MM:SS" format (no T separator)
        const isoDate = raw.includes("T") ? raw : raw.replace(" ", "T");
        return formatDate(isoDate);
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Landing Leads" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Landing Leads"
        description={`${pagination?.total || 0} leads from landing pages`}
      />

      {leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border py-16 text-muted-foreground">
          <Megaphone className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-lg font-medium">No landing leads yet</p>
          <p className="text-sm">Leads from landing pages will appear here</p>
        </div>
      ) : (
        <>
          <DataTable columns={columns} data={leads} />

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
