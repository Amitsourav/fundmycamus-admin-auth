"use client";

import { useState } from "react";
import { useUsers } from "@/hooks/queries/use-users";
import { useUpdateUserRole } from "@/hooks/mutations/use-update-user-role";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { USER_ROLE_OPTIONS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import type { Profile } from "@/types/user";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [roleDialog, setRoleDialog] = useState<{ open: boolean; user?: Profile; newRole: string }>({
    open: false,
    newRole: "",
  });

  const { data, isLoading } = useUsers({
    page,
    page_size: 25,
    role: roleFilter || undefined,
    search: search || undefined,
  });

  const updateRole = useUpdateUserRole();

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
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => <StatusBadge status={row.original.role} />,
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
      header: "Profile %",
      cell: ({ row }) => `${row.original.profile_completion_pct}%`,
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
          onClick={() =>
            setRoleDialog({
              open: true,
              user: row.original,
              newRole: row.original.role,
            })
          }
        >
          Change Role
        </Button>
      ),
    },
  ];

  async function handleRoleUpdate() {
    if (!roleDialog.user) return;
    try {
      await updateRole.mutateAsync({
        userId: roleDialog.user.id,
        role: roleDialog.newRole,
      });
      toast.success("Role updated successfully");
      setRoleDialog({ open: false, newRole: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    }
  }

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
        <Select
          value={roleFilter}
          onValueChange={(value) => {
            setRoleFilter(value === "all" ? "" : value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {USER_ROLE_OPTIONS.map((role) => (
              <SelectItem key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      <Dialog
        open={roleDialog.open}
        onOpenChange={(open) => setRoleDialog({ ...roleDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update role for {roleDialog.user?.full_name || roleDialog.user?.email}
            </DialogDescription>
          </DialogHeader>
          <Select
            value={roleDialog.newRole}
            onValueChange={(value) => setRoleDialog({ ...roleDialog, newRole: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {USER_ROLE_OPTIONS.map((role) => (
                <SelectItem key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialog({ open: false, newRole: "" })}>
              Cancel
            </Button>
            <Button onClick={handleRoleUpdate} disabled={updateRole.isPending}>
              {updateRole.isPending ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
