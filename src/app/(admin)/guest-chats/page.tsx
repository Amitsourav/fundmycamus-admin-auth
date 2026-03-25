"use client";

import { useState } from "react";
import { useGuestChats, useGuestConversation } from "@/hooks/queries/use-guest-chats";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatDate, formatDateTime } from "@/lib/utils";
import { MessageCircle, Phone, User, Bot, ArrowLeft, Eye } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { GuestChat } from "@/types/guest-chat";

function formatTimeAgo(date: string) {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

function formatMessageTime(date: string) {
  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ConversationView({ guestId, onBack }: { guestId: string; onBack: () => void }) {
  const { data, isLoading } = useGuestConversation(guestId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>Conversation not found</p>
      </div>
    );
  }

  const { guest, messages } = data;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-lg font-semibold">{guest.name}</h2>
          <p className="text-sm text-muted-foreground">Guest conversation</p>
        </div>
      </div>

      {/* Guest info card */}
      <div className="rounded-lg border p-4 flex items-center gap-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div className="grid grid-cols-3 gap-6 flex-1">
          <div>
            <p className="text-xs text-muted-foreground">Name</p>
            <p className="text-sm font-medium">{guest.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="text-sm font-medium flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {guest.phone}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Started</p>
            <p className="text-sm font-medium">{formatDateTime(guest.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Chat messages */}
      <div className="rounded-lg border">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-medium">
            {messages.length} message{messages.length !== 1 ? "s" : ""}
          </p>
        </div>
        <ScrollArea className="h-[500px] p-4">
          <div className="space-y-3">
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  className={cn("flex", isUser ? "justify-end" : "justify-start")}
                >
                  {!isUser && (
                    <div className="mr-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Bot className="h-3 w-3" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2.5",
                      isUser
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {msg.message}
                    </p>
                    <div
                      className={cn(
                        "flex items-center gap-2 mt-1",
                        isUser ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.matched_faq && (
                        <Badge variant="outline" className="text-[10px] h-4 px-1">
                          {msg.matched_faq}
                        </Badge>
                      )}
                      <span
                        className={cn(
                          "text-[10px]",
                          isUser
                            ? "text-primary-foreground/60"
                            : "text-muted-foreground"
                        )}
                      >
                        {formatMessageTime(msg.created_at)}
                      </span>
                    </div>
                  </div>
                  {isUser && (
                    <div className="ml-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-3 w-3 text-primary" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

export default function GuestChatsPage() {
  const { data: guests, isLoading } = useGuestChats();
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);

  const columns: ColumnDef<GuestChat>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <span className="flex items-center gap-1 text-sm">
          <Phone className="h-3 w-3 text-muted-foreground" />
          {row.original.phone}
        </span>
      ),
    },
    {
      accessorKey: "message_count",
      header: "Messages",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.message_count}</Badge>
      ),
    },
    {
      accessorKey: "last_message_at",
      header: "Last Active",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatTimeAgo(row.original.last_message_at)}
        </span>
      ),
    },
    {
      accessorKey: "source_page",
      header: "Source",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
          {row.original.source_page || "—"}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedGuestId(row.original.id)}
        >
          <Eye className="mr-1 h-4 w-4" />
          View
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Guest Chat Leads" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (selectedGuestId) {
    return (
      <div className="space-y-6">
        <ConversationView
          guestId={selectedGuestId}
          onBack={() => setSelectedGuestId(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guest Chat Leads"
        description={`${guests?.length || 0} guest visitors who chatted without signing up`}
      />

      {(!guests || guests.length === 0) ? (
        <div className="flex flex-col items-center justify-center rounded-lg border py-16 text-muted-foreground">
          <MessageCircle className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-lg font-medium">No guest chats yet</p>
          <p className="text-sm">Guest conversations will appear here</p>
        </div>
      ) : (
        <DataTable columns={columns} data={guests} />
      )}
    </div>
  );
}
