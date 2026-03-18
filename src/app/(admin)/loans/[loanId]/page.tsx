"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useLoan, useBankOffers } from "@/hooks/queries/use-loans";
import { useCounselors } from "@/hooks/queries/use-counselors";
import { useUpdateLoanStatus } from "@/hooks/mutations/use-update-loan-status";
import { useAssignCounselor } from "@/hooks/mutations/use-counselor-mutations";
import { useMatchBankOffers } from "@/hooks/mutations/use-bank-mutations";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VALID_LOAN_TRANSITIONS } from "@/lib/constants";
import { formatCurrency, formatDate, formatStatus } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoanDetailPage() {
  const params = useParams();
  const loanId = params.loanId as string;
  const { data: loan, isLoading } = useLoan(loanId);
  const { data: bankOffers } = useBankOffers(loanId);
  const { data: counselors } = useCounselors();
  const updateStatus = useUpdateLoanStatus();
  const assignCounselor = useAssignCounselor();
  const matchOffers = useMatchBankOffers();

  const [statusDialog, setStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [counselorDialog, setCounselorDialog] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState("");

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
      await updateStatus.mutateAsync({
        loanId,
        data: { status: newStatus, notes: statusNotes || undefined },
      });
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
      await assignCounselor.mutateAsync({
        loan_application_id: loanId,
        counselor_id: selectedCounselor || undefined,
      });
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

      <div className="flex gap-3">
        <Button
          onClick={() => setStatusDialog(true)}
          disabled={validNextStatuses.length === 0}
        >
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
          <CardHeader>
            <CardTitle>Applicant Info</CardTitle>
          </CardHeader>
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
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <Row label="Country" value={loan.target_country} />
            <Row label="College" value={loan.target_college} />
            <Row label="Course" value={`${loan.course_degree} - ${loan.course_name}`} />
            <Row label="Level" value={loan.course_level} />
            <Row label="Start" value={`${loan.course_start_month} ${loan.course_start_year}`} />
            <Row label="Offer Letter" value={loan.has_offer_letter ? "Yes" : "No"} />
            {loan.university_app_status && (
              <Row label="App Status" value={loan.university_app_status} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <Row label="Loan Amount" value={formatCurrency(loan.loan_amount)} />
            <Row label="Bank" value={loan.bank_name || "Not assigned"} />
            <Row label="Collateral" value={loan.has_collateral ? "Yes" : "No"} />
            <Row label="Co-applicant Income" value={formatCurrency(loan.co_applicant_income)} />
            <Row label="Existing EMIs" value={formatCurrency(loan.existing_emis)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <Row label="Created" value={formatDate(loan.created_at)} />
            {loan.submitted_at && <Row label="Submitted" value={formatDate(loan.submitted_at)} />}
            {loan.last_status_change_at && (
              <Row label="Last Status Change" value={formatDate(loan.last_status_change_at)} />
            )}
            <Row label="Current Status" value={formatStatus(loan.status)} />
            {loan.hear_about_us && <Row label="Source" value={loan.hear_about_us} />}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Remarks</CardTitle>
        </CardHeader>
        <CardContent>
          {loan.notes ? (
            <p className="whitespace-pre-wrap text-sm">{loan.notes}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No remarks yet. Add remarks when updating the loan status.</p>
          )}
        </CardContent>
      </Card>

      {bankOffers && bankOffers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bank Offers</CardTitle>
          </CardHeader>
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
            <DialogDescription>
              Current status: {formatStatus(loan.status)}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {validNextStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {formatStatus(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Remarks</label>
              <Textarea
                placeholder="Add remarks about this status change..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialog(false)}>
              Cancel
            </Button>
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
            <DialogDescription>
              Leave empty to auto-assign based on availability.
            </DialogDescription>
          </DialogHeader>
          <Select value={selectedCounselor} onValueChange={setSelectedCounselor}>
            <SelectTrigger>
              <SelectValue placeholder="Auto-assign" />
            </SelectTrigger>
            <SelectContent>
              {counselors
                ?.filter((c) => c.is_active)
                .map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.current_active_cases}/{c.max_active_cases})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCounselorDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignCounselor} disabled={assignCounselor.isPending}>
              {assignCounselor.isPending ? "Assigning..." : "Assign"}
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
