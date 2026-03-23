"use client";

import { useState, useEffect, useRef } from "react";
import { useConversations, useMessages } from "@/hooks/queries/use-chat";
import { useSendMessage, useMarkAsRead } from "@/hooks/mutations/use-chat-mutations";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Send, MessageCircle, User } from "lucide-react";
import type { Conversation, ChatMessage } from "@/types/chat";

function formatTime(date: string) {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatMessageTime(date: string) {
  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ConversationList({
  conversations,
  selectedUserId,
  onSelect,
}: {
  conversations: Conversation[];
  selectedUserId: string;
  onSelect: (userId: string) => void;
}) {
  return (
    <div className="flex flex-col">
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <MessageCircle className="h-8 w-8 mb-2" />
          <p className="text-sm">No conversations yet</p>
        </div>
      ) : (
        conversations.map((conv) => (
          <button
            key={conv.user_id}
            onClick={() => onSelect(conv.user_id)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent border-b",
              selectedUserId === conv.user_id && "bg-accent"
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              {conv.avatar_url ? (
                <img src={conv.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <User className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium truncate">{conv.full_name || conv.email}</span>
                <span className="text-xs text-muted-foreground shrink-0 ml-2">
                  {formatTime(conv.last_message_at)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground truncate">{conv.email}</span>
                {conv.unread_count > 0 && (
                  <span className="ml-2 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                    {conv.unread_count}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))
      )}
    </div>
  );
}

function MessageThread({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const { user } = useAuth();
  const { data: messages, isLoading } = useMessages(userId);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Mark as read when opening conversation
  useEffect(() => {
    if (userId) {
      markAsRead.mutate({ user_id: userId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    try {
      await sendMessage.mutateAsync({ user_id: userId, message: text });
    } catch {
      setInput(text);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <User className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">{userName}</p>
          <p className="text-xs text-muted-foreground">Student</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-3">
          {(!messages || messages.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <MessageCircle className="h-8 w-8 mb-2" />
              <p className="text-sm">No messages yet. Start the conversation.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isStaff = msg.sender_role === "admin" || msg.sender_role === "counselor";
              return (
                <div
                  key={msg.id}
                  className={cn("flex", isStaff ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2.5",
                      isStaff
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    )}
                  >
                    {!isStaff && (
                      <p className="text-[10px] font-medium mb-0.5 opacity-70">
                        {msg.sender_role === "user" ? "Student" : msg.sender_role}
                      </p>
                    )}
                    {isStaff && msg.sender_role === "counselor" && (
                      <p className="text-[10px] font-medium mb-0.5 opacity-70">Counselor</p>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                    <p
                      className={cn(
                        "text-[10px] mt-1",
                        isStaff ? "text-primary-foreground/60" : "text-muted-foreground"
                      )}
                    >
                      {formatMessageTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 border-t p-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          autoComplete="off"
        />
        <Button type="submit" size="icon" disabled={!input.trim() || sendMessage.isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

export default function ChatPage() {
  const { data: conversations, isLoading } = useConversations();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [search, setSearch] = useState("");

  const selectedConv = conversations?.find((c) => c.user_id === selectedUserId);

  const filtered = conversations?.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.full_name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  });

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-7rem)] rounded-lg border">
        <div className="w-80 border-r p-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="h-8 w-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] rounded-lg border overflow-hidden">
      {/* Left panel — conversations */}
      <div className="w-80 flex flex-col border-r bg-background shrink-0">
        <div className="p-3 border-b">
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9"
          />
        </div>
        <ScrollArea className="flex-1">
          <ConversationList
            conversations={filtered || []}
            selectedUserId={selectedUserId}
            onSelect={setSelectedUserId}
          />
        </ScrollArea>
      </div>

      {/* Right panel — messages */}
      <div className="flex flex-1 flex-col bg-background">
        {selectedUserId && selectedConv ? (
          <MessageThread
            userId={selectedUserId}
            userName={selectedConv.full_name || selectedConv.email}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground">
            <MessageCircle className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-lg font-medium">Select a conversation</p>
            <p className="text-sm">Choose a student to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
