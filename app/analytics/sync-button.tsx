"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";

export function LinkedInSyncButton({ authorIds }: { authorIds: number[] }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  async function syncAll() {
    setLoading(true);
    setResult(null);
    let total = 0;
    try {
      for (const id of authorIds) {
        const res = await fetch(`/api/linkedin/sync/${id}`, { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          total += data.synced ?? 0;
        }
      }
      setResult(`Synced ${total} post${total === 1 ? "" : "s"} from LinkedIn`);
      router.refresh();
    } catch {
      setResult("Sync failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {result && <span className="text-xs text-muted-foreground">{result}</span>}
      <Button size="sm" variant="outline" onClick={syncAll} disabled={loading || authorIds.length === 0}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        Sync LinkedIn
      </Button>
    </div>
  );
}
