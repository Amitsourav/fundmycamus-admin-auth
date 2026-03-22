"use client";

import { useState, useEffect, useMemo } from "react";
import { useDocumentsForReview } from "@/hooks/queries/use-documents";
import { useReviewDocument } from "@/hooks/mutations/use-review-document";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Eye, CheckCircle, XCircle, Download, ChevronDown, ChevronRight, User, Search, Clock } from "lucide-react";
import { api } from "@/lib/api-client";
import type { Document } from "@/types/document";
import type { Profile } from "@/types/user";
import type { LoanApplication } from "@/types/loan";
import type { PaginatedResponse } from "@/types/common";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

function getDocFileUrl(docId: string) {
  return `${API_URL}/api/v1/documents/${docId}/file`;
}

function downloadFile(docId: string, fileName: string) {
  fetch(getDocFileUrl(docId), { credentials: "include" })
    .then((res) => res.blob())
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    });
}

function AuthenticatedFile({ docId, mimeType, fileName }: { docId: string; mimeType?: string; fileName: string }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    let revoked = false;
    fetch(getDocFileUrl(docId), { credentials: "include" })
      .then((res) => res.blob())
      .then((blob) => {
        if (!revoked) setBlobUrl(URL.createObjectURL(blob));
      })
      .catch(() => {});
    return () => {
      revoked = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId]);

  if (!blobUrl) return <Skeleton className="h-[60vh] w-full" />;

  if (mimeType?.startsWith("image/")) {
    return <img src={blobUrl} alt={fileName} className="max-w-full" />;
  }
  return <iframe src={blobUrl} className="h-[60vh] w-full" title={fileName} />;
}

interface StudentInfo {
  name: string;
  email: string;
  applicationId?: string;
}

function useStudentInfo(userIds: string[]) {
  const [info, setInfo] = useState<Record<string, StudentInfo>>({});

  useEffect(() => {
    if (userIds.length === 0) return;

    async function fetchInfo() {
      const result: Record<string, StudentInfo> = {};

      // Fetch user profiles
      const profiles = await Promise.all(
        userIds.map((id) =>
          api.get<Profile>(`/api/v1/users/${id}`).catch(() => null)
        )
      );

      profiles.forEach((profile, i) => {
        if (profile) {
          result[userIds[i]] = {
            name: profile.full_name || profile.email,
            email: profile.email,
          };
        } else {
          result[userIds[i]] = {
            name: userIds[i].slice(0, 8) + "...",
            email: "",
          };
        }
      });

      // Fetch loan applications for app IDs
      try {
        const loans = await api.get<PaginatedResponse<LoanApplication>>("/api/v1/loans", { page_size: 100 });
        for (const loan of loans.items) {
          if (result[loan.user_id]) {
            result[loan.user_id].applicationId = loan.application_id;
            if (!result[loan.user_id].name || result[loan.user_id].name === result[loan.user_id].email) {
              result[loan.user_id].name = loan.full_name;
            }
          }
        }
      } catch {
        // Loans API unavailable
      }

      setInfo(result);
    }

    fetchInfo();
  }, [userIds.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  return info;
}

export default function DocumentsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean;
    doc?: Document;
    action: "under_review" | "verified" | "rejected";
  }>({ open: false, action: "verified" });
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: documents, isLoading } = useDocumentsForReview(statusFilter || undefined);
  const reviewDocument = useReviewDocument();

  // Group documents by user_id
  const grouped = useMemo(() => {
    const map: Record<string, Document[]> = {};
    for (const doc of documents || []) {
      if (!map[doc.user_id]) map[doc.user_id] = [];
      map[doc.user_id].push(doc);
    }
    return map;
  }, [documents]);

  const userIds = useMemo(() => Object.keys(grouped), [grouped]);
  const studentInfo = useStudentInfo(userIds);

  // Filter by search
  const filteredUserIds = useMemo(() => {
    if (!searchQuery) return userIds;
    const q = searchQuery.toLowerCase();
    return userIds.filter((id) => {
      const info = studentInfo[id];
      if (!info) return id.toLowerCase().includes(q);
      return (
        info.name.toLowerCase().includes(q) ||
        info.email.toLowerCase().includes(q) ||
        (info.applicationId?.toLowerCase().includes(q) ?? false) ||
        id.toLowerCase().includes(q)
      );
    });
  }, [userIds, studentInfo, searchQuery]);

  function toggleUser(userId: string) {
    setExpandedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

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

  const pendingCount = documents?.filter((d) => d.status === "pending_review" || d.status === "under_review").length || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description={`${documents?.length || 0} documents across ${userIds.length} students${pendingCount > 0 ? ` \u00B7 ${pendingCount} pending review` : ""}`}
      />

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or app ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
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
      </div>

      {filteredUserIds.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          No students found matching your search.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUserIds.map((userId) => {
            const info = studentInfo[userId];
            const docs = grouped[userId];
            const isExpanded = expandedUsers.has(userId);
            const pendingDocs = docs.filter((d) => d.status === "pending_review" || d.status === "under_review").length;

            return (
              <Card key={userId}>
                <CardHeader
                  className="cursor-pointer py-4 px-6"
                  onClick={() => toggleUser(userId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {info?.name || userId.slice(0, 8) + "..."}
                          {info?.applicationId && (
                            <span className="ml-2 text-sm font-normal text-muted-foreground">
                              {info.applicationId}
                            </span>
                          )}
                        </CardTitle>
                        {info?.email && (
                          <p className="text-sm text-muted-foreground">{info.email}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {docs.length} {docs.length === 1 ? "document" : "documents"}
                      </span>
                      {pendingDocs > 0 && (
                        <StatusBadge status="pending_review" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                {isExpanded && (
                  <CardContent className="pt-0 px-6 pb-4">
                    <div className="rounded-md border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="px-4 py-2 text-left font-medium">File Name</th>
                            <th className="px-4 py-2 text-left font-medium">Type</th>
                            <th className="px-4 py-2 text-left font-medium">Status</th>
                            <th className="px-4 py-2 text-left font-medium">Uploaded</th>
                            <th className="px-4 py-2 text-right font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {docs.map((doc) => (
                            <tr key={doc.id} className="border-b last:border-0">
                              <td className="px-4 py-2">{doc.file_name}</td>
                              <td className="px-4 py-2">{formatStatus(doc.document_type)}</td>
                              <td className="px-4 py-2">
                                <StatusBadge status={doc.status} />
                              </td>
                              <td className="px-4 py-2">{formatDate(doc.created_at)}</td>
                              <td className="px-4 py-2">
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="sm" onClick={() => setPreviewDoc(doc)}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => downloadFile(doc.id, doc.file_name)}>
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  {doc.status === "pending_review" && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-blue-600"
                                      title="Mark as Under Review"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setReviewDialog({ open: true, doc, action: "under_review" });
                                      }}
                                    >
                                      <Clock className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {(doc.status === "pending_review" || doc.status === "under_review") && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-green-600"
                                        title="Approve"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setReviewDialog({ open: true, doc, action: "verified" });
                                        }}
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600"
                                        title="Reject"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setReviewDialog({ open: true, doc, action: "rejected" });
                                        }}
                                      >
                                        <XCircle className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

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
              <AuthenticatedFile docId={previewDoc.id} mimeType={previewDoc.mime_type} fileName={previewDoc.file_name} />
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
              {reviewDialog.action === "verified" ? "Approve" : reviewDialog.action === "under_review" ? "Mark Under Review" : "Reject"} Document
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
                : reviewDialog.action === "under_review"
                ? "Mark Under Review"
                : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
