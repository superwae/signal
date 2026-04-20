"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";

export function LinkedInCard({
  authorId,
  linkedinMemberName,
  linkedinConnectedAt,
  linkedinLastSyncedAt,
  isConnected,
}: {
  authorId: number;
  linkedinMemberName: string | null;
  linkedinConnectedAt: Date | null;
  linkedinLastSyncedAt: Date | null;
  isConnected: boolean;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const li = searchParams.get("linkedin");
    if (li === "connected") {
      setToast("LinkedIn connected successfully!");
    } else if (li === "error") {
      const reason = searchParams.get("reason") ?? "unknown error";
      setToast(`LinkedIn connection failed: ${reason}`);
    }
  }, [searchParams]);

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await fetch(`/api/linkedin/sync/${authorId}`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setToast(`Synced ${data.synced ?? 0} of ${data.total ?? 0} posts from LinkedIn`);
        router.refresh();
      } else {
        setToast(data.error ?? "Sync failed");
      }
    } catch {
      setToast("Sync request failed");
    } finally {
      setSyncing(false);
    }
  }

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      await fetch("/api/linkedin/oauth/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId }),
      });
      router.refresh();
    } catch {
      setToast("Disconnect failed");
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <>
      {toast && (
        <div className="mb-4 rounded-md border bg-muted px-4 py-3 text-sm">
          {toast}
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-muted-foreground hover:text-foreground"
          >
            &times;
          </button>
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">LinkedIn integration</CardTitle>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                Connected
                {linkedinMemberName && (
                  <> as <span className="font-medium">{linkedinMemberName}</span></>
                )}
              </div>
              {linkedinLastSyncedAt && (
                <p className="text-xs text-muted-foreground">
                  Last sync: {timeAgo(linkedinLastSyncedAt)}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Syncs analytics for published posts that have a LinkedIn URL attached.
              </p>
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
                Connect this author&apos;s LinkedIn account to automatically pull post analytics (likes, comments, impressions).
              </p>
              <p className="text-xs text-muted-foreground">
                Requires LinkedIn app with <strong>r_member_social</strong> scope approved.{" "}
                <a
                  href="/LINKEDIN_SETUP.md"
                  className="underline underline-offset-2"
                  target="_blank"
                >
                  Setup guide
                </a>
              </p>
              <Button
                size="sm"
                onClick={() => {
                  window.location.href = `/api/linkedin/oauth/initiate?authorId=${authorId}`;
                }}
              >
                Connect LinkedIn
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
