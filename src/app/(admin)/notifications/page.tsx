"use client";

import { useState } from "react";
import { useUsers } from "@/hooks/queries/use-users";
import { useSendNotification } from "@/hooks/mutations/use-notification-mutations";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NOTIFICATION_TYPE_OPTIONS } from "@/lib/constants";
import { formatStatus } from "@/lib/utils";
import { toast } from "sonner";
import { Send } from "lucide-react";

export default function NotificationsPage() {
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [type, setType] = useState("general");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [link, setLink] = useState("");

  const { data: usersData } = useUsers({
    search: search || undefined,
    page_size: 10,
  });
  const sendNotification = useSendNotification();

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedUserId || !title || !message) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await sendNotification.mutateAsync({
        user_id: selectedUserId,
        type,
        title,
        message,
        email: sendEmail || undefined,
        link: link || undefined,
      });
      toast.success("Notification sent");
      setTitle("");
      setMessage("");
      setLink("");
      setSendEmail(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send notification");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Send Notification" description="Send a notification to a specific user" />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>New Notification</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="grid gap-4">
            <div className="grid gap-2">
              <Label>Search User *</Label>
              <Input
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && usersData?.items && usersData.items.length > 0 && (
                <div className="max-h-40 overflow-auto rounded-md border">
                  {usersData.items.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-accent ${
                        selectedUserId === user.id ? "bg-accent" : ""
                      }`}
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setSearch(user.full_name || user.email);
                      }}
                    >
                      <div className="font-medium">{user.full_name || "No name"}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Type *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTIFICATION_TYPE_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {formatStatus(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notification title"
              />
            </div>

            <div className="grid gap-2">
              <Label>Message *</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Notification message"
                rows={4}
              />
            </div>

            <div className="grid gap-2">
              <Label>Link (optional)</Label>
              <Input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="e.g. /dashboard"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={sendEmail} onCheckedChange={setSendEmail} />
              <Label>Also send via email</Label>
            </div>

            <Button
              type="submit"
              disabled={!selectedUserId || !title || !message || sendNotification.isPending}
            >
              <Send className="mr-2 h-4 w-4" />
              {sendNotification.isPending ? "Sending..." : "Send Notification"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
