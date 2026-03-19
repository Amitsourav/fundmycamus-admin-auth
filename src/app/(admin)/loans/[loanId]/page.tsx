"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useLoan, useBankOffers, useLoanBanks, useLoanDocuments, type RequiredDocument } from "@/hooks/queries/use-loans";
import { useCounselors } from "@/hooks/queries/use-counselors";
import { useUpdateLoanStatus } from "@/hooks/mutations/use-update-loan-status";
import { useAssignCounselor } from "@/hooks/mutations/use-counselor-mutations";
import { useMatchBankOffers } from "@/hooks/mutations/use-bank-mutations";
import { useAddLoanBank, useUpdateLoanBankStatus } from "@/hooks/mutations/use-loan-bank-mutations";
import { useReviewDocument } from "@/hooks/mutations/use-review-document";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VALID_LOAN_TRANSITIONS, LoanStatus } from "@/lib/constants";
import { formatCurrency, formatDate, formatStatus } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowLeft, Plus, Eye, Download, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import type { LoanBank } from "@/types/bank";
import type { Document } from "@/types/document";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

const LOAN_STATUS_VALUES = Object.values(LoanStatus);
const BANK_STATUS_VALUES = [
  "applied",
  "docs_received",
  "under_review",
  "loan_login",
  "sanction",
  "processing_fee",
  "disbursed",
  "rejected",
];

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
      .then((blob) => { if (!revoked) setBlobUrl(URL.createObjectURL(blob)); })
      .catch(() => {});
    return () => { revoked = true; if (blobUrl) URL.revokeObjectURL(blobUrl); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId]);
  if (!blobUrl) return <Skeleton className="h-[60vh] w-full" />;
  if (mimeType?.startsWith("image/")) return <img src={blobUrl} alt={fileName} className="max-w-full" />;
  return <iframe src={blobUrl} className="h-[60vh] w-full" title={fileName} />;
}

export default function LoanDetailPage() {
  const params = useParams();
  const loanId = params.loanId as string;
  const { data: loan, isLoading } = useLoan(loanId);
  const { data: bankOffers } = useBankOffers(loanId);
  const { data: loanBanks } = useLoanBanks(loanId);
  const { data: counselors } = useCounselors();
  const { data: requiredDocs } = useLoanDocuments(loanId);
  const updateStatus = useUpdateLoanStatus();
  const assignCounselor = useAssignCounselor();
  const matchOffers = useMatchBankOffers();
  const addBank = useAddLoanBank();
  const updateBankStatus = useUpdateLoanBankStatus();
  const reviewDocument = useReviewDocument();

  const [statusDialog, setStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [counselorDialog, setCounselorDialog] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState("");
  const [addBankDialog, setAddBankDialog] = useState(false);
  const [newBankName, setNewBankName] = useState("");
  const [newBankRemarks, setNewBankRemarks] = useState("");
  const [editBank, setEditBank] = useState<LoanBank | null>(null);
  const [editBankStatus, setEditBankStatus] = useState("");
  const [editBankRemarks, setEditBankRemarks] = useState("");
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [reviewDialog, setReviewDialog] = useState<{ open: boolean; doc?: Document; action: "verified" | "rejected" }>({ open: false, action: "verified" });
  const [rejectionReason, setRejectionReason] = useState("");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!loan) return <div>Loan not found</div>;

  const validNextStatuses = VALID_LOAN_TRANSITIONS[loan.status] || [];

  async function handleStatusUpdate() {
    try {
      await updateStatus.mutateAsync({ loanId, data: { status: newStatus, notes: statusNotes || undefined } });
      toast.success("Status updated");
      setStatusDialog(false);
      setNewStatus("");
      setStatusNotes("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    }
  }

  async function handleAssignCounselor() {
    try {
      await assignCounselor.mutateAsync({ loan_application_id: loanId, counselor_id: selectedCounselor || undefined });
      toast.success("Counselor assigned");
      setCounselorDialog(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to assign counselor");
    }
  }

  async function handleMatchOffers() {
    try {
      await matchOffers.mutateAsync(loanId);
      toast.success("Bank offers matched");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to match offers");
    }
  }

  async function handleAddBank() {
    if (!newBankName) return;
    try {
      await addBank.mutateAsync({ loanId, bank_name: newBankName, remarks: newBankRemarks || undefined });
      toast.success(`${newBankName} added`);
      setAddBankDialog(false);
      setNewBankName("");
      setNewBankRemarks("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add bank");
    }
  }

  async function handleUpdateBankStatus() {
    if (!editBank) return;
    try {
      await updateBankStatus.mutateAsync({
        loanId,
        bankAppId: editBank.id,
        status: editBankStatus,
        remarks: editBankRemarks || undefined,
      });
      toast.success("Bank status updated");
      setEditBank(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update bank status");
    }
  }

  async function handleReviewDoc() {
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

  const assignedCounselor = counselors?.find((c) => c.id === loan.assigned_counselor_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/loans">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title={`Application ${loan.application_id}`}
          description={loan.full_name}
        >
          <StatusBadge status={loan.status} />
        </PageHeader>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Button onClick={() => setStatusDialog(true)} disabled={validNextStatuses.length === 0}>
          Update Status
        </Button>
        <Button variant="outline" onClick={() => setCounselorDialog(true)}>
          {loan.assigned_counselor_id ? "Reassign Counselor" : "Assign Counselor"}
        </Button>
        <Button variant="outline" onClick={handleMatchOffers} disabled={matchOffers.isPending}>
          {matchOffers.isPending ? "Matching..." : "Match Bank Offers"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Applicant Info</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <Row label="Full Name" value={loan.full_name} />
            <Row label="Email" value={loan.email} />
            <Row label="Phone" value={loan.phone} />
            <Row label="Gender" value={loan.gender} />
            <Row label="WhatsApp" value={loan.is_whatsapp ? "Yes" : "No"} />
            <Row label="Counselor" value={assignedCounselor?.name || "Not assigned"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Course Details</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <Row label="Country" value={loan.target_country} />
            <Row label="College" value={loan.target_college} />
            <Row label="Course" value={`${loan.course_degree} - ${loan.course_name}`} />
            <Row label="Level" value={loan.course_level} />
            <Row label="Start" value={`${loan.course_start_month} ${loan.course_start_year}`} />
            <Row label="Offer Letter" value={loan.has_offer_letter ? "Yes" : "No"} />
            {loan.university_app_status && <Row label="App Status" value={loan.university_app_status} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Financial Details</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <Row label="Loan Amount" value={formatCurrency(loan.loan_amount)} />
            <Row label="Collateral" value={loan.has_collateral ? "Yes" : "No"} />
            <Row label="Co-applicant Income" value={formatCurrency(loan.co_applicant_income)} />
            <Row label="Existing EMIs" value={formatCurrency(loan.existing_emis)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <Row label="Created" value={formatDate(loan.created_at)} />
            {loan.submitted_at && <Row label="Submitted" value={formatDate(loan.submitted_at)} />}
            {loan.last_status_change_at && <Row label="Last Status Change" value={formatDate(loan.last_status_change_at)} />}
            <Row label="Current Status" value={formatStatus(loan.status)} />
            {loan.hear_about_us && <Row label="Source" value={loan.hear_about_us} />}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Remarks</CardTitle></CardHeader>
        <CardContent>
          {loan.notes ? (
            <p className="whitespace-pre-wrap text-sm">{loan.notes}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No remarks yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Task 11 — Banks Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Banks</CardTitle>
          <Button size="sm" onClick={() => setAddBankDialog(true)}>
            <Plus className="mr-1 h-4 w-4" /> Add Bank
          </Button>
        </CardHeader>
        <CardContent>
          {(!loanBanks || loanBanks.length === 0) ? (
            <p className="text-sm text-muted-foreground">No banks assigned yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bank Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loanBanks.map((bank) => (
                  <TableRow key={bank.id}>
                    <TableCell className="font-medium">{bank.bank_name}</TableCell>
                    <TableCell><StatusBadge status={bank.status} /></TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {bank.remarks || "—"}
                    </TableCell>
                    <TableCell>{formatDate(bank.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditBank(bank);
                          setEditBankStatus(bank.status);
                          setEditBankRemarks(bank.remarks || "");
                        }}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Task 7 — Required Documents Section */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {(!requiredDocs || requiredDocs.length === 0) ? (
            <p className="text-sm text-muted-foreground">No document requirements found.</p>
          ) : (
            <div className="space-y-2">
              {requiredDocs.map((rd) => (
                <div key={rd.document_type} className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{formatStatus(rd.document_type)}</span>
                    {rd.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    {rd.uploaded ? (
                      <>
                        <StatusBadge status={rd.status || "uploaded"} />
                        {rd.document_id && (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => {
                              if (rd.document_id) setPreviewDoc({
                                id: rd.document_id,
                                user_id: loan.user_id,
                                document_type: rd.document_type,
                                file_name: rd.file_name || rd.document_type,
                                file_url: "",
                                mime_type: rd.mime_type,
                                status: rd.status || "uploaded",
                                created_at: "",
                                updated_at: "",
                              });
                            }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => downloadFile(rd.document_id!, rd.file_name || rd.document_type)}>
                              <Download className="h-4 w-4" />
                            </Button>
                            {(rd.status === "pending_review" || rd.status === "under_review") && (
                              <>
                                <Button variant="ghost" size="sm" className="text-green-600"
                                  onClick={() => setReviewDialog({ open: true, doc: {
                                    id: rd.document_id!, user_id: loan.user_id, document_type: rd.document_type,
                                    file_name: rd.file_name || rd.document_type, file_url: "", mime_type: rd.mime_type,
                                    status: rd.status || "", created_at: "", updated_at: "",
                                  }, action: "verified" })}>
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600"
                                  onClick={() => setReviewDialog({ open: true, doc: {
                                    id: rd.document_id!, user_id: loan.user_id, document_type: rd.document_type,
                                    file_name: rd.file_name || rd.document_type, file_url: "", mime_type: rd.mime_type,
                                    status: rd.status || "", created_at: "", updated_at: "",
                                  }, action: "rejected" })}>
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <Badge variant="secondary">Not uploaded</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {bankOffers && bankOffers.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Bank Offers</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bank</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Interest Rate</TableHead>
                  <TableHead>Tenure</TableHead>
                  <TableHead>Monthly EMI</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Best</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bankOffers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell>{offer.bank_id}</TableCell>
                    <TableCell>{formatCurrency(offer.loan_amount)}</TableCell>
                    <TableCell>{offer.interest_rate}%</TableCell>
                    <TableCell>{offer.tenure_years} yrs</TableCell>
                    <TableCell>{formatCurrency(offer.monthly_emi)}</TableCell>
                    <TableCell>{formatCurrency(offer.total_cost)}</TableCell>
                    <TableCell><StatusBadge status={offer.status} /></TableCell>
                    <TableCell>{offer.is_best_offer ? "Yes" : ""}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Status Update Dialog */}
      <Dialog open={statusDialog} onOpenChange={setStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Loan Status</DialogTitle>
            <DialogDescription>Current status: {formatStatus(loan.status)}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger><SelectValue placeholder="Select new status" /></SelectTrigger>
              <SelectContent>
                {validNextStatuses.map((status) => (
                  <SelectItem key={status} value={status}>{formatStatus(status)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Remarks</label>
              <Textarea placeholder="Add remarks..." value={statusNotes} onChange={(e) => setStatusNotes(e.target.value)} rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialog(false)}>Cancel</Button>
            <Button onClick={handleStatusUpdate} disabled={!newStatus || updateStatus.isPending}>
              {updateStatus.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Counselor Assignment Dialog */}
      <Dialog open={counselorDialog} onOpenChange={setCounselorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Counselor</DialogTitle>
            <DialogDescription>Leave empty to auto-assign.</DialogDescription>
          </DialogHeader>
          <Select value={selectedCounselor} onValueChange={setSelectedCounselor}>
            <SelectTrigger><SelectValue placeholder="Auto-assign" /></SelectTrigger>
            <SelectContent>
              {counselors?.filter((c) => c.is_active).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} ({c.current_active_cases}/{c.max_active_cases})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCounselorDialog(false)}>Cancel</Button>
            <Button onClick={handleAssignCounselor} disabled={assignCounselor.isPending}>
              {assignCounselor.isPending ? "Assigning..." : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Bank Dialog */}
      <Dialog open={addBankDialog} onOpenChange={setAddBankDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Bank</DialogTitle>
            <DialogDescription>Enter the bank name to assign to this loan application.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Input placeholder="Bank name (e.g. SBI, HDFC, Axis Bank)" value={newBankName} onChange={(e) => setNewBankName(e.target.value)} />
            <Textarea placeholder="Remarks (optional)" value={newBankRemarks} onChange={(e) => setNewBankRemarks(e.target.value)} rows={2} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddBankDialog(false); setNewBankName(""); setNewBankRemarks(""); }}>Cancel</Button>
            <Button onClick={handleAddBank} disabled={!newBankName.trim() || addBank.isPending}>
              {addBank.isPending ? "Adding..." : "Add Bank"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Bank Status Dialog */}
      <Dialog open={!!editBank} onOpenChange={() => setEditBank(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update {editBank?.bank_name}</DialogTitle>
            <DialogDescription>Change status and add remarks for this bank.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Select value={editBankStatus} onValueChange={setEditBankStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {BANK_STATUS_VALUES.map((status) => (
                  <SelectItem key={status} value={status}>{formatStatus(status)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea placeholder="Remarks for this bank..." value={editBankRemarks} onChange={(e) => setEditBankRemarks(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditBank(null)}>Cancel</Button>
            <Button onClick={handleUpdateBankStatus} disabled={updateBankStatus.isPending}>
              {updateBankStatus.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
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

      {/* Document Review Dialog */}
      <Dialog open={reviewDialog.open} onOpenChange={(open) => setReviewDialog({ ...reviewDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{reviewDialog.action === "verified" ? "Approve" : "Reject"} Document</DialogTitle>
            <DialogDescription>{reviewDialog.doc?.file_name}</DialogDescription>
          </DialogHeader>
          {reviewDialog.action === "rejected" && (
            <Textarea placeholder="Rejection reason..." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog({ open: false, action: "verified" })}>Cancel</Button>
            <Button
              variant={reviewDialog.action === "rejected" ? "destructive" : "default"}
              onClick={handleReviewDoc}
              disabled={reviewDocument.isPending || (reviewDialog.action === "rejected" && !rejectionReason)}
            >
              {reviewDocument.isPending ? "Processing..." : reviewDialog.action === "verified" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
