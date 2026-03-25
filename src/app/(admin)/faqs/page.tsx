"use client";

import { useState } from "react";
import { useFaqs } from "@/hooks/queries/use-faqs";
import {
  useCreateFaq,
  useUpdateFaq,
  useDeleteFaq,
} from "@/hooks/mutations/use-faq-mutations";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, GripVertical } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { FAQ, QuickReply } from "@/types/faq";

const EMPTY_FORM = {
  category: "",
  keywords: "",
  response: "",
  quick_replies: [] as QuickReply[],
  is_active: true,
  priority: 0,
};

export default function FaqsPage() {
  const { data: faqs, isLoading } = useFaqs();
  const createFaq = useCreateFaq();
  const updateFaq = useUpdateFaq();
  const deleteFaq = useDeleteFaq();

  const [formDialog, setFormDialog] = useState<{
    open: boolean;
    faq?: FAQ;
  }>({ open: false });
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    faq?: FAQ;
  }>({ open: false });

  function openCreate() {
    setForm({ ...EMPTY_FORM, quick_replies: [] });
    setFormDialog({ open: true });
  }

  function openEdit(faq: FAQ) {
    let quickReplies: QuickReply[] = [];
    try {
      quickReplies = JSON.parse(faq.quick_replies || "[]");
    } catch {
      quickReplies = [];
    }
    setForm({
      category: faq.category,
      keywords: Array.isArray(faq.keywords) ? faq.keywords.join(", ") : faq.keywords,
      response: faq.response,
      quick_replies: quickReplies,
      is_active: faq.is_active,
      priority: faq.priority,
    });
    setFormDialog({ open: true, faq });
  }

  async function handleSubmit() {
    const keywords = form.keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const payload = {
      category: form.category,
      keywords,
      response: form.response,
      quick_replies: JSON.stringify(form.quick_replies),
      is_active: form.is_active,
      priority: form.priority,
    };

    try {
      if (formDialog.faq) {
        await updateFaq.mutateAsync({ id: formDialog.faq.id, ...payload });
        toast.success("FAQ updated");
      } else {
        await createFaq.mutateAsync(payload);
        toast.success("FAQ created");
      }
      setFormDialog({ open: false });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Operation failed");
    }
  }

  async function handleDelete() {
    if (!deleteDialog.faq) return;
    try {
      await deleteFaq.mutateAsync(deleteDialog.faq.id);
      toast.success("FAQ deleted");
      setDeleteDialog({ open: false });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  // Quick replies builder helpers
  function addQuickReply() {
    setForm({
      ...form,
      quick_replies: [
        ...form.quick_replies,
        { label: "", action: "message" },
      ],
    });
  }

  function updateQuickReply(index: number, updates: Partial<QuickReply>) {
    const updated = form.quick_replies.map((qr, i) =>
      i === index ? { ...qr, ...updates } : qr
    );
    setForm({ ...form, quick_replies: updated });
  }

  function removeQuickReply(index: number) {
    setForm({
      ...form,
      quick_replies: form.quick_replies.filter((_, i) => i !== index),
    });
  }

  const columns: ColumnDef<FAQ>[] = [
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.category}</span>
      ),
    },
    {
      accessorKey: "keywords",
      header: "Keywords",
      cell: ({ row }) => {
        const kws = Array.isArray(row.original.keywords)
          ? row.original.keywords
          : [];
        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {kws.slice(0, 5).map((k) => (
              <Badge key={k} variant="secondary" className="text-xs">
                {k}
              </Badge>
            ))}
            {kws.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{kws.length - 5}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.priority}</span>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? "default" : "secondary"}>
          {row.original.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEdit(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteDialog({ open: true, faq: row.original })}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="FAQ Management" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="FAQ Management"
        description={`${faqs?.length || 0} FAQ entries powering the chat bot`}
      >
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add FAQ
        </Button>
      </PageHeader>

      <DataTable columns={columns} data={faqs || []} />

      {/* Create / Edit Dialog */}
      <Dialog
        open={formDialog.open}
        onOpenChange={(open) => setFormDialog({ ...formDialog, open })}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formDialog.faq ? "Edit FAQ" : "Add FAQ"}
            </DialogTitle>
            <DialogDescription>
              {formDialog.faq
                ? "Update this FAQ entry"
                : "Create a new FAQ entry for the chat bot"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Category *</Label>
                <Input
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  placeholder="e.g. Eligibility, Interest Rates"
                />
              </div>
              <div className="grid gap-2">
                <Label>Priority</Label>
                <Input
                  type="number"
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: Number(e.target.value) })
                  }
                  placeholder="Higher = matched first"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Keywords (comma-separated) *</Label>
              <Input
                value={form.keywords}
                onChange={(e) =>
                  setForm({ ...form, keywords: e.target.value })
                }
                placeholder="e.g. loan, process, how, apply, steps"
              />
              {form.keywords && (
                <div className="flex flex-wrap gap-1">
                  {form.keywords
                    .split(",")
                    .map((k) => k.trim())
                    .filter(Boolean)
                    .map((k) => (
                      <Badge key={k} variant="secondary" className="text-xs">
                        {k}
                      </Badge>
                    ))}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Response *</Label>
              <Textarea
                value={form.response}
                onChange={(e) =>
                  setForm({ ...form, response: e.target.value })
                }
                placeholder="The bot's reply text (supports multiline)"
                rows={4}
              />
            </div>

            {/* Quick Replies Builder */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Quick Replies</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addQuickReply}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add Button
                </Button>
              </div>
              {form.quick_replies.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No quick reply buttons. Click &quot;Add Button&quot; to add action
                  buttons shown below the bot response.
                </p>
              ) : (
                <div className="space-y-3">
                  {form.quick_replies.map((qr, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 rounded-md border p-3"
                    >
                      <GripVertical className="mt-2.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="flex-1 grid gap-2">
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={qr.label}
                            onChange={(e) =>
                              updateQuickReply(index, {
                                label: e.target.value,
                              })
                            }
                            placeholder="Button label"
                          />
                          <Select
                            value={qr.action}
                            onValueChange={(value) =>
                              updateQuickReply(index, {
                                action: value as QuickReply["action"],
                                url: value === "link" ? qr.url : undefined,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="message">
                                Message — sends label as chat message
                              </SelectItem>
                              <SelectItem value="link">
                                Link — opens URL in new tab
                              </SelectItem>
                              <SelectItem value="handoff">
                                Handoff — escalate to counselor
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {qr.action === "link" && (
                          <Input
                            value={qr.url || ""}
                            onChange={(e) =>
                              updateQuickReply(index, { url: e.target.value })
                            }
                            placeholder="https://..."
                          />
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 mt-0.5"
                        onClick={() => removeQuickReply(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) =>
                  setForm({ ...form, is_active: checked })
                }
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFormDialog({ open: false })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !form.category ||
                !form.keywords ||
                !form.response ||
                createFaq.isPending ||
                updateFaq.isPending
              }
            >
              {createFaq.isPending || updateFaq.isPending
                ? "Saving..."
                : formDialog.faq
                ? "Update"
                : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Delete FAQ"
        description={`Are you sure you want to delete the "${deleteDialog.faq?.category}" FAQ? This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleteFaq.isPending}
        destructive
      />
    </div>
  );
}
