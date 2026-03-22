"use client";

import { useState } from "react";
import { useReferrals, usePayouts } from "@/hooks/queries/use-referrals";
import { useProcessReferral, useProcessPayout } from "@/hooks/mutations/use-referral-mutations";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { PAYOUT_STATUS_OPTIONS } from "@/lib/constants";
import { formatCurrency, formatDate, formatStatus } from "@/lib/utils";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import type { Referral, ReferralPayout } from "@/types/referral";

export default function ReferralsPage() {
  const { data: referrals, isLoading: referralsLoading } = useReferrals();
  const [payoutStatusFilter, setPayoutStatusFilter] = useState<string>("");
  const { data: payouts, isLoading: payoutsLoading } = usePayouts(payoutStatusFilter || undefined);

  const processReferral = useProcessReferral();
  const processPayout = useProcessPayout();

  const [processDialog, setProcessDialog] = useState<{
    open: boolean;
    referral?: Referral;
    action: string;
  }>({ open: false, action: "" });

  const [payoutDialog, setPayoutDialog] = useState<{
    open: boolean;
    payout?: ReferralPayout;
  }>({ open: false });
  const [bankDetails, setBankDetails] = useState({
    account_number: "",
    ifsc_code: "",
    account_holder_name: "",
  });

  const referralColumns: ColumnDef<Referral>[] = [
    {
      accessorKey: "referral_code",
      header: "Code",
      cell: ({ row }) => <span className="font-mono">{row.original.referral_code}</span>,
    },
    {
      accessorKey: "referrer_id",
      header: "Referrer",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.referrer_id.slice(0, 8)}...</span>,
    },
    {
      accessorKey: "referee_id",
      header: "Referee",
      cell: ({ row }) =>
        row.original.referee_id ? (
          <span className="font-mono text-xs">{row.original.referee_id.slice(0, 8)}...</span>
        ) : "—",
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
      cell: ({ row }) => {
        const nextActions: Record<string, string> = {
          signed_up: "applied",
          applied: "sanctioned",
          sanctioned: "disbursed",
        };
        const nextAction = nextActions[row.original.status];
        if (!nextAction) return null;
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setProcessDialog({
                open: true,
                referral: row.original,
                action: nextAction,
              })
            }
          >
            Process: {formatStatus(nextAction)}
          </Button>
        );
      },
    },
  ];

  const payoutColumns: ColumnDef<ReferralPayout>[] = [
    {
      accessorKey: "user_id",
      header: "User",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.user_id.slice(0, 8)}...</span>,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => formatCurrency(row.original.amount),
    },
    {
      accessorKey: "milestone_bonus",
      header: "Bonus",
      cell: ({ row }) => formatCurrency(row.original.milestone_bonus),
    },
    {
      accessorKey: "payout_type",
      header: "Type",
      cell: ({ row }) => formatStatus(row.original.payout_type),
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
      cell: ({ row }) => {
        if (row.original.status !== "pending") return null;
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPayoutDialog({ open: true, payout: row.original })}
          >
            Process
          </Button>
        );
      },
    },
  ];

  async function handleProcessReferral() {
    if (!processDialog.referral) return;
    try {
      await processReferral.mutateAsync({
        action: processDialog.action,
        referee_user_id: processDialog.referral.referee_id!,
        referral_code: processDialog.referral.referral_code,
        loan_application_id: processDialog.referral.loan_application_id || undefined,
      });
      toast.success("Referral processed");
      setProcessDialog({ open: false, action: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to process referral");
    }
  }

  async function handleProcessPayout() {
    if (!payoutDialog.payout) return;
    try {
      await processPayout.mutateAsync({
        payout_id: payoutDialog.payout.id,
        bank_account_details: bankDetails.account_number
          ? bankDetails
          : undefined,
      });
      toast.success("Payout processed");
      setPayoutDialog({ open: false });
      setBankDetails({ account_number: "", ifsc_code: "", account_holder_name: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to process payout");
    }
  }

  const isLoading = referralsLoading || payoutsLoading;
  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Referrals & Payouts" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Referrals & Payouts" />

      <Tabs defaultValue="referrals">
        <TabsList>
          <TabsTrigger value="referrals">Referrals ({referrals?.length || 0})</TabsTrigger>
          <TabsTrigger value="payouts">Payouts ({payouts?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="referrals" className="space-y-4">
          <DataTable columns={referralColumns} data={referrals || []} />
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          <Select
            value={payoutStatusFilter}
            onValueChange={(v) => setPayoutStatusFilter(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {PAYOUT_STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {formatStatus(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DataTable columns={payoutColumns} data={payouts || []} />
        </TabsContent>
      </Tabs>

      {/* Process Referral Dialog */}
      <Dialog
        open={processDialog.open}
        onOpenChange={(open) => setProcessDialog({ ...processDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Referral</DialogTitle>
            <DialogDescription>
              Move referral {processDialog.referral?.referral_code} to &quot;{formatStatus(processDialog.action)}&quot;?
            </DialogDescription>
          </DialogHeader>
          {processDialog.action === "sanctioned" && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
              This will trigger a payout of <strong>&#8377;1,000</strong> to the referrer.
            </div>
          )}
          {processDialog.action === "disbursed" && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 space-y-1">
              <p>This will trigger payouts:</p>
              <p>&#8226; <strong>&#8377;1,000</strong> to the referrer</p>
              <p>&#8226; <strong>&#8377;1,000</strong> to the friend (referee)</p>
              <p className="text-xs text-green-600">Every 10th disbursement adds a &#8377;5,000 bonus.</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessDialog({ open: false, action: "" })}>
              Cancel
            </Button>
            <Button onClick={handleProcessReferral} disabled={processReferral.isPending}>
              {processReferral.isPending ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Payout Dialog */}
      <Dialog
        open={payoutDialog.open}
        onOpenChange={(open) => setPayoutDialog({ ...payoutDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payout</DialogTitle>
            <DialogDescription>
              Amount: {payoutDialog.payout && formatCurrency(payoutDialog.payout.amount)}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Account Number</Label>
              <Input
                value={bankDetails.account_number}
                onChange={(e) => setBankDetails({ ...bankDetails, account_number: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>IFSC Code</Label>
              <Input
                value={bankDetails.ifsc_code}
                onChange={(e) => setBankDetails({ ...bankDetails, ifsc_code: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Account Holder Name</Label>
              <Input
                value={bankDetails.account_holder_name}
                onChange={(e) => setBankDetails({ ...bankDetails, account_holder_name: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayoutDialog({ open: false })}>
              Cancel
            </Button>
            <Button onClick={handleProcessPayout} disabled={processPayout.isPending}>
              {processPayout.isPending ? "Processing..." : "Process Payout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
