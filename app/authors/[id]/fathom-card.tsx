"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";
import { toast } from "@/components/ui/toaster";

export function FathomCard({
  authorId,
  fathomUserEmail,
  fathomConnectedAt,
  fathomLastSyncedAt,
  isConnected,
}: {
  authorId: number;
  fathomUserEmail: string | null;
  fathomConnectedAt: Date | null;
  fathomLastSyncedAt: Date | null;
  isConnected: boolean;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    const fathom = searchParams.get("fathom");
    if (fathom === "connected") {
      toast({ title: "Fathom connected successfully!", kind: "success" });
    } else if (fathom === "error") {
      const reason = searchParams.get("reason") ?? "unknown error";
      toast({ title: "Fathom connection failed", description: reason, kind: "error" });
    }
  }, [searchParams]);

  const connected = isConnected;

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await fetch(`/api/fathom/sync/${authorId}`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast({ title: `Synced ${data.synced ?? 0} signals from ${data.newMeetings ?? 0} new meetings`, kind: "success" });
        router.refresh();
      } else {
        toast({ title: "Sync failed", description: data.error, kind: "error" });
      }
    } catch {
      toast({ title: "Sync request failed", kind: "error" });
    } finally {
      setSyncing(false);
    }
  }

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      await fetch("/api/fathom/oauth/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId }),
      });
      router.refresh();
    } catch {
      toast({ title: "Disconnect failed", kind: "error" });
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Fathom integration</CardTitle>
      </CardHeader>
      <CardContent>
        {connected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                Connected
                {fathomUserEmail && (
                  <> as <span className="font-medium">{fathomUserEmail}</span></>
                )}
              </div>
              {fathomLastSyncedAt && (
                <p className="text-xs text-muted-foreground">
                  Last sync: {timeAgo(fathomLastSyncedAt)}
                </p>
              )}
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSync} disabled={syncing}>
                  {syncing ? "Syncing..." : "Sync now"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                >
                  {disconnecting ? "..." : "Disconnect"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Link this author&apos;s Fathom account so their meetings auto-import.
              </p>
              <Button
                size="sm"
                onClick={() => {
                  window.location.href = `/api/fathom/oauth/initiate?authorId=${authorId}`;
                }}
              >
                Connect Fathom
              </Button>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
