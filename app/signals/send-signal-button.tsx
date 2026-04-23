"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Check, Send } from "lucide-react";
import { submitSignalDraftsForReviewAction } from "@/lib/actions";

export function SendSignalButton({ signalId }: { signalId: number }) {
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      await submitSignalDraftsForReviewAction(signalId);
      setSent(true);
    });
  }

  if (sent) {
    return (
      <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
        <Check className="h-3 w-3" /> Sent
      </span>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="shrink-0 h-7 gap-1 text-[11px] px-2.5"
      disabled={pending}
      onClick={handleClick}
    >
      <Send className="h-3 w-3" />
      {pending ? "Sending…" : "Send to user"}
    </Button>
  );
}
