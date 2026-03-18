"use client";

import { useState } from "react";
import { useCounselors } from "@/hooks/queries/use-counselors";
import { useCreateCounselor, useUpdateCounselor } from "@/hooks/mutations/use-counselor-mutations";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { Counselor } from "@/types/counselor";

export default function CounselorsPage() {
  const { data: counselors, isLoading } = useCounselors();
  const createCounselor = useCreateCounselor();
  const updateCounselor = useUpdateCounselor();

  const [formDialog, setFormDialog] = useState<{
    open: boolean;
    counselor?: Counselor;
  }>({ open: false });
  const [form, setForm] = useState({
    name: "",
    email: "",
    title: "",
    phone: "",
    whatsapp_number: "",
    available_hours: "",
    max_active_cases: 10,
    specializations: "",
    is_active: true,
  });

  function openCreate() {
    setForm({
      name: "",
      email: "",
      title: "",
      phone: "",
      whatsapp_number: "",
      available_hours: "",
      max_active_cases: 10,
      specializations: "",
      is_active: true,
    });
    setFormDialog({ open: true });
  }

  function openEdit(counselor: Counselor) {
    setForm({
      name: counselor.name,
      email: counselor.email,
      title: counselor.title || "",
      phone: counselor.phone || "",
      whatsapp_number: counselor.whatsapp_number || "",
      available_hours: counselor.available_hours || "",
      max_active_cases: counselor.max_active_cases,
      specializations: counselor.specializations?.join(", ") || "",
      is_active: counselor.is_active,
    });
    setFormDialog({ open: true, counselor });
  }

  async function handleSubmit() {
    const specializations = form.specializations
      ? form.specializations.split(",").map((s) => s.trim()).filter(Boolean)
      : undefined;

    try {
      if (formDialog.counselor) {
        await updateCounselor.mutateAsync({
          counselorId: formDialog.counselor.id,
          data: {
            name: form.name,
            email: form.email,
            title: form.title || undefined,
            phone: form.phone || undefined,
            whatsapp_number: form.whatsapp_number || undefined,
            available_hours: form.available_hours || undefined,
            max_active_cases: form.max_active_cases,
            specializations,
            is_active: form.is_active,
          },
        });
        toast.success("Counselor updated");
      } else {
        await createCounselor.mutateAsync({
          name: form.name,
          email: form.email,
          title: form.title || undefined,
          phone: form.phone || undefined,
          whatsapp_number: form.whatsapp_number || undefined,
          available_hours: form.available_hours || undefined,
          max_active_cases: form.max_active_cases,
          specializations,
        });
        toast.success("Counselor created");
      }
      setFormDialog({ open: false });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Operation failed");
    }
  }

  const columns: ColumnDef<Counselor>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    {
      id: "caseload",
      header: "Cases",
      cell: ({ row }) =>
        `${row.original.current_active_cases}/${row.original.max_active_cases}`,
    },
    {
      accessorKey: "specializations",
      header: "Specializations",
      cell: ({ row }) =>
        row.original.specializations?.map((s) => (
          <Badge key={s} variant="secondary" className="mr-1">
            {s}
          </Badge>
        )) || "—",
    },
    {
      accessorKey: "is_active",
      header: "Active",
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? "default" : "secondary"}>
          {row.original.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => openEdit(row.original)}>
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Counselors" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Counselors" description={`${counselors?.length || 0} counselors`}>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Counselor
        </Button>
      </PageHeader>

      <DataTable columns={columns} data={counselors || []} />

      <Dialog open={formDialog.open} onOpenChange={(open) => setFormDialog({ ...formDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formDialog.counselor ? "Edit Counselor" : "Add Counselor"}
            </DialogTitle>
            <DialogDescription>
              {formDialog.counselor ? "Update counselor details" : "Create a new counselor profile"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Email *</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Senior Counselor" />
              </div>
              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>WhatsApp</Label>
                <Input value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Max Cases</Label>
                <Input type="number" value={form.max_active_cases} onChange={(e) => setForm({ ...form, max_active_cases: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Available Hours</Label>
              <Input value={form.available_hours} onChange={(e) => setForm({ ...form, available_hours: e.target.value })} placeholder="e.g. Mon-Fri 9AM-6PM" />
            </div>
            <div className="grid gap-2">
              <Label>Specializations (comma-separated)</Label>
              <Input value={form.specializations} onChange={(e) => setForm({ ...form, specializations: e.target.value })} placeholder="e.g. USA, UK, Canada" />
            </div>
            {formDialog.counselor && (
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={(checked) => setForm({ ...form, is_active: checked })} />
                <Label>Active</Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormDialog({ open: false })}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!form.name || !form.email || createCounselor.isPending || updateCounselor.isPending}
            >
              {createCounselor.isPending || updateCounselor.isPending
                ? "Saving..."
                : formDialog.counselor
                ? "Update"
                : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
