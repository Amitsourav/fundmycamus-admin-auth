"use client";

import { useState } from "react";
import { useContacts } from "@/hooks/queries/use-contacts";
import { useUpdateContact } from "@/hooks/mutations/use-contact-mutations";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { CONTACT_STATUS_OPTIONS } from "@/lib/constants";
import { formatDate, formatStatus } from "@/lib/utils";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ContactSubmission } from "@/types/contact";

export default function ContactsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { data: contacts, isLoading } = useContacts(statusFilter || undefined);
  const updateContact = useUpdateContact();

  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    contact?: ContactSubmission;
    status: string;
    admin_notes: string;
  }>({ open: false, status: "", admin_notes: "" });

  const columns: ColumnDef<ContactSubmission>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Phone" },
    {
      accessorKey: "message",
      header: "Message",
      cell: ({ row }) => (
        <span className="line-clamp-2 max-w-xs">{row.original.message || "—"}</span>
      ),
    },
    {
      accessorKey: "loan_type",
      header: "Loan Type",
      cell: ({ row }) => row.original.loan_type || "—",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
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
            setEditDialog({
              open: true,
              contact: row.original,
              status: row.original.status,
              admin_notes: row.original.admin_notes || "",
            })
          }
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  async function handleUpdate() {
    if (!editDialog.contact) return;
    try {
      await updateContact.mutateAsync({
        submissionId: editDialog.contact.id,
        data: {
          status: editDialog.status,
          admin_notes: editDialog.admin_notes || undefined,
        },
      });
      toast.success("Contact updated");
      setEditDialog({ open: false, status: "", admin_notes: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Contacts" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contacts"
        description={`${contacts?.length || 0} submissions`}
      />

      <Select
        value={statusFilter}
        onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {CONTACT_STATUS_OPTIONS.map((status) => (
            <SelectItem key={status} value={status}>
              {formatStatus(status)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DataTable columns={columns} data={contacts || []} />

      <Dialog
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog({ ...editDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Contact</DialogTitle>
            <DialogDescription>
              {editDialog.contact?.name} - {editDialog.contact?.email}
            </DialogDescription>
          </DialogHeader>
          {editDialog.contact?.message && (
            <div className="rounded-md bg-muted p-3 text-sm">
              {editDialog.contact.message}
            </div>
          )}
          <div className="grid gap-4">
            <Select
              value={editDialog.status}
              onValueChange={(value) => setEditDialog({ ...editDialog, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTACT_STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {formatStatus(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Admin notes..."
              value={editDialog.admin_notes}
              onChange={(e) =>
                setEditDialog({ ...editDialog, admin_notes: e.target.value })
              }
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog({ open: false, status: "", admin_notes: "" })}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateContact.isPending}>
              {updateContact.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
