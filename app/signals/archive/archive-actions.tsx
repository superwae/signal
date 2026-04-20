"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteSignalPermanentlyAction, restoreSignalAction } from "@/lib/actions";
import { toast } from "@/components/ui/toaster";
import { RotateCcw, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function ArchiveActions({ signalId }: { signalId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"restore" | "delete" | null>(null);

  async function restore() {
    setLoading("restore");
    try {
      await restoreSignalAction(signalId);
      toast({ title: "Signal restored", kind: "success" });
      router.refresh();
    } catch (e: any) {
      toast({ title: "Failed to restore", description: e.message, kind: "error" });
    } finally {
      setLoading(null);
    }
  }

  async function deletePermanently() {
    setLoading("delete");
    try {
      await deleteSignalPermanentlyAction(signalId);
      toast({ title: "Permanently deleted", kind: "success" });
      router.refresh();
    } catch (e: any) {
      toast({ title: "Failed to delete", description: e.message, kind: "error" });
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={restore} disabled={!!loading}>
        {loading === "restore" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
        Restore
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="text-muted-foreground hover:text-destructive"
        onClick={deletePermanently}
        disabled={!!loading}
      >
        {loading === "delete" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        Delete permanently
      </Button>
    </>
  );
}
