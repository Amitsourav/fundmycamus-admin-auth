"use client";

import { useState } from "react";
import { useUsers } from "@/hooks/queries/use-users";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { Eye } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { Profile } from "@/types/user";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [viewUser, setViewUser] = useState<Profile | null>(null);

  const { data, isLoading } = useUsers({
    page,
    page_size: 25,
    search: search || undefined,
  });

  const columns: ColumnDef<Profile>[] = [
    {
      accessorKey: "full_name",
      header: "Name",
      cell: ({ row }) => row.original.full_name || "—",
    },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => row.original.phone || "—",
    },
    {
      accessorKey: "country",
      header: "Country",
      cell: ({ row }) => row.original.country || "—",
    },
    {
      accessorKey: "contact_consent",
      header: "Consent",
      cell: ({ row }) => (
        <Badge variant={row.original.contact_consent ? "default" : "secondary"}>
          {row.original.contact_consent ? "Consented" : "No consent"}
        </Badge>
      ),
    },
    {
      accessorKey: "profile_completion_pct",
      header: "Profile",
      cell: ({ row }) => {
        const pct = row.original.profile_completion_pct;
        return (
          <div className="flex items-center gap-2">
            <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{pct}%</span>
          </div>
        );
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setViewUser(row.original)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Users" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description={`${data?.total || 0} total users`} />

      <div className="flex gap-4">
        <Input
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
      </div>

      <DataTable columns={columns} data={data?.items || []} />

      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.page} of {data.total_pages}
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
              disabled={page >= data.total_pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={!!viewUser} onOpenChange={() => setViewUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{viewUser?.full_name || "Student Profile"}</DialogTitle>
            <DialogDescription>{viewUser?.email}</DialogDescription>
          </DialogHeader>
          {viewUser && (
            <div className="grid gap-3 text-sm max-h-[60vh] overflow-auto">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Phone</span>
                <span>{viewUser.phone || "—"} {viewUser.phone_verified ? "(Verified)" : ""}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">WhatsApp</span>
                <span>{viewUser.is_whatsapp ? "Yes" : "No"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Gender</span>
                <span>{viewUser.gender || "—"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Date of Birth</span>
                <span>{viewUser.date_of_birth ? formatDate(viewUser.date_of_birth) : "—"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Marital Status</span>
                <span>{viewUser.marital_status || "—"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Passport</span>
                <span>{viewUser.passport_number || "—"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">PAN</span>
                <span>{viewUser.pan_number || "—"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Address</span>
                <span>{[viewUser.address_line1, viewUser.address_line2].filter(Boolean).join(", ") || "—"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">City / District</span>
                <span>{[viewUser.city, viewUser.district].filter(Boolean).join(", ") || "—"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">State</span>
                <span>{viewUser.state || "—"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Country</span>
                <span>{viewUser.country || "—"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">ZIP</span>
                <span>{viewUser.zip_code || "—"}</span>
              </div>
              {viewUser.linkedin_url && (
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">LinkedIn</span>
                  <span className="truncate">{viewUser.linkedin_url}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Profile</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${viewUser.profile_completion_pct >= 80 ? "bg-green-500" : viewUser.profile_completion_pct >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                      style={{ width: `${viewUser.profile_completion_pct}%` }}
                    />
                  </div>
                  <span className="text-xs">{viewUser.profile_completion_pct}%</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Consent</span>
                <span>{viewUser.contact_consent ? "Yes" : "No"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Referral Code</span>
                <span className="font-mono">{viewUser.referral_code}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Joined</span>
                <span>{formatDate(viewUser.created_at)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
