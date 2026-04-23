"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Check, Loader2 } from "lucide-react";
import { submitForReviewAction } from "@/lib/actions";
import { toast } from "@/components/ui/toaster";

export function SendToReviewButton({ postId }: { postId: number }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    setSending(true);
    try {
      await submitForReviewAction(postId);
      setSent(true);
      toast({ title: "Sent to review ✓", kind: "success" });
    } catch (err: any) {
      toast({ title: "Failed to send", description: err.message, kind: "error" });
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
        <Check className="h-3 w-3" /> Sent
      </span>
    );
  }

  return (
    <Button size="sm" variant="outline" className="h-7 text-xs shrink-0" onClick={handleClick} disabled={sending}>
      {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
      {sending ? "Sending…" : "Send to user"}
    </Button>
  );
}
