"use client";

import { useState } from "react";
import { useDocumentsForReview } from "@/hooks/queries/use-documents";
import { useReviewDocument } from "@/hooks/mutations/use-review-document";
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
import { DOCUMENT_STATUS_OPTIONS } from "@/lib/constants";
import { formatDate, formatStatus } from "@/lib/utils";
import { toast } from "sonner";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { Document } from "@/types/document";

export default function DocumentsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean;
    doc?: Document;
    action: "verified" | "rejected";
  }>({ open: false, action: "verified" });
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: documents, isLoading } = useDocumentsForReview(statusFilter || undefined);
  const reviewDocument = useReviewDocument();

  const columns: ColumnDef<Document>[] = [
    { accessorKey: "file_name", header: "File Name" },
    {
      accessorKey: "document_type",
      header: "Type",
      cell: ({ row }) => formatStatus(row.original.document_type),
    },
    {
      accessorKey: "user_id",
      header: "User ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.user_id.slice(0, 8)}...</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "created_at",
      header: "Uploaded",
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPreviewDoc(row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {(row.original.status === "pending_review" || row.original.status === "under_review") && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-green-600"
                onClick={() =>
                  setReviewDialog({ open: true, doc: row.original, action: "verified" })
                }
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600"
                onClick={() =>
                  setReviewDialog({ open: true, doc: row.original, action: "rejected" })
                }
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  async function handleReview() {
    if (!reviewDialog.doc) return;
    try {
      await reviewDocument.mutateAsync({
        docId: reviewDialog.doc.id,
        data: {
          status: reviewDialog.action,
          rejection_reason: reviewDialog.action === "rejected" ? rejectionReason : undefined,
        },
      });
      toast.success(`Document ${reviewDialog.action}`);
      setReviewDialog({ open: false, action: "verified" });
      setRejectionReason("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to review document");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Documents" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description={`${documents?.length || 0} documents for review`}
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
          {DOCUMENT_STATUS_OPTIONS.map((status) => (
            <SelectItem key={status} value={status}>
              {formatStatus(status)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DataTable columns={columns} data={documents || []} />

      {/* Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{previewDoc?.file_name}</DialogTitle>
            <DialogDescription>
              {previewDoc && formatStatus(previewDoc.document_type)} - {previewDoc && <StatusBadge status={previewDoc.status} />}
            </DialogDescription>
          </DialogHeader>
          {previewDoc && (
            <div className="flex-1 overflow-auto">
              {previewDoc.mime_type?.startsWith("image/") ? (
                <img
                  src={previewDoc.file_url}
                  alt={previewDoc.file_name}
                  className="max-w-full"
                />
              ) : (
                <iframe
                  src={previewDoc.file_url}
                  className="h-[60vh] w-full"
                  title={previewDoc.file_name}
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog
        open={reviewDialog.open}
        onOpenChange={(open) => setReviewDialog({ ...reviewDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewDialog.action === "verified" ? "Approve" : "Reject"} Document
            </DialogTitle>
            <DialogDescription>{reviewDialog.doc?.file_name}</DialogDescription>
          </DialogHeader>
          {reviewDialog.action === "rejected" && (
            <Textarea
              placeholder="Rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialog({ open: false, action: "verified" })}
            >
              Cancel
            </Button>
            <Button
              variant={reviewDialog.action === "rejected" ? "destructive" : "default"}
              onClick={handleReview}
              disabled={reviewDocument.isPending || (reviewDialog.action === "rejected" && !rejectionReason)}
            >
              {reviewDocument.isPending
                ? "Processing..."
                : reviewDialog.action === "verified"
                ? "Approve"
                : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
