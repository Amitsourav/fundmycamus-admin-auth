import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    // Loan statuses
    draft: "bg-gray-100 text-gray-700",
    applied: "bg-blue-100 text-blue-700",
    docs_pending: "bg-yellow-100 text-yellow-700",
    docs_verified: "bg-emerald-100 text-emerald-700",
    under_review: "bg-purple-100 text-purple-700",
    approved: "bg-green-100 text-green-700",
    documentation: "bg-indigo-100 text-indigo-700",
    disbursed: "bg-green-200 text-green-800",
    rejected: "bg-red-100 text-red-700",
    withdrawn: "bg-gray-200 text-gray-600",
    // Document statuses
    pending_review: "bg-yellow-100 text-yellow-700",
    verified: "bg-green-100 text-green-700",
    expired: "bg-gray-200 text-gray-600",
    // Contact statuses
    new: "bg-blue-100 text-blue-700",
    contacted: "bg-yellow-100 text-yellow-700",
    resolved: "bg-green-100 text-green-700",
    spam: "bg-red-100 text-red-700",
    // Payout statuses
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    reversed: "bg-gray-200 text-gray-600",
    // Referral statuses
    signed_up: "bg-blue-100 text-blue-700",
    sanctioned: "bg-purple-100 text-purple-700",
    paid: "bg-green-200 text-green-800",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
}

export function formatStatus(status: string): string {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
