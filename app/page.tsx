import Link from "next/link";
import { db, schema } from "@/lib/db";
import { desc, sql, eq } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";
import { ArrowUpRight, Radio, FileEdit, ClipboardList, Send, Users } from "lucide-react";

export const dynamic = "force-dynamic";

async function loadStats() {
  try {
    const [signalsByStatus, postsByStatus, authorsCount, recent] = await Promise.all([
      db.select({ status: schema.signals.status, count: sql<number>`count(*)::int` })
        .from(schema.signals).groupBy(schema.signals.status),
      db.select({ status: schema.posts.status, count: sql<number>`count(*)::int` })
        .from(schema.posts).groupBy(schema.posts.status),
      db.select({ count: sql<number>`count(*)::int` })
        .from(schema.authors).where(eq(schema.authors.active, true)),
      db.select({
        id: schema.posts.id,
        content: schema.posts.content,
        status: schema.posts.status,
        updatedAt: schema.posts.updatedAt,
        authorId: schema.posts.authorId,
        hookStrengthScore: schema.posts.hookStrengthScore,
      }).from(schema.posts).orderBy(desc(schema.posts.updatedAt)).limit(6),
    ]);
    const byStatus = (rows: { status: string; count: number }[]) =>
      Object.fromEntries(rows.map((r) => [r.status, r.count])) as Record<string, number>;
    return {
      unused: byStatus(signalsByStatus).unused ?? 0,
      drafting: byStatus(signalsByStatus).drafting ?? 0,
      inReview: byStatus(postsByStatus).in_review ?? 0,
      approved: byStatus(postsByStatus).approved ?? 0,
      published: byStatus(postsByStatus).published ?? 0,
      drafts: byStatus(postsByStatus).draft ?? 0,
      authors: authorsCount[0]?.count ?? 0,
      recent,
      dbOk: true as const,
    };
  } catch (e: any) {
    return { dbOk: false as const, error: e?.message ?? "Database not connected yet." };
  }
}

export default async function DashboardPage() {
  const stats = await loadStats();

  return (
    <div className="mx-auto w-full max-w-6xl p-6 md:p-10">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Turn meeting signals into LinkedIn posts that sound like you.
          </p>
        </div>
        <Link href="/signals/new">
          <Button>
            <Radio className="h-4 w-4" />
            Capture signals
          </Button>
        </Link>
      </header>

      {!stats.dbOk ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-amber-800 dark:text-amber-300">Database not connected</CardTitle>
            <CardDescription>
              Set <code className="rounded bg-background px-1 py-0.5 text-xs">DATABASE_URL</code> and run{" "}
              <code className="rounded bg-background px-1 py-0.5 text-xs">npm run db:push</code> to finish setup.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Error: {stats.error}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <Stat icon={<Radio className="h-4 w-4" />} label="Unused signals" value={stats.unused} href="/signals" />
            <Stat icon={<FileEdit className="h-4 w-4" />} label="Drafts" value={stats.drafts} href="/review?tab=drafts" />
            <Stat icon={<ClipboardList className="h-4 w-4" />} label="In review" value={stats.inReview} href="/review" />
            <Stat icon={<Send className="h-4 w-4" />} label="Published" value={stats.published} href="/analytics" />
            <Stat icon={<Users className="h-4 w-4" />} label="Authors" value={stats.authors} href="/authors" />
          </div>

          <div className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium text-muted-foreground">Recent posts</h2>
              <Link href="/review" className="text-xs text-muted-foreground hover:text-foreground">
                See all →
              </Link>
            </div>
            {stats.recent.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-3">
                {stats.recent.map((p) => (
                  <Link
                    key={p.id}
                    href={`/posts/${p.id}`}
                    className="group flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm">{p.content.slice(0, 220)}</p>
                      <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <StatusBadge status={p.status} />
                        <span>·</span>
                        <span>Updated {timeAgo(p.updatedAt)}</span>
                        {p.hookStrengthScore != null && (
                          <>
                            <span>·</span>
                            <span>Hook {p.hookStrengthScore}/100</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: number; href: string }) {
  return (
    <Link href={href} className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
      <div className="flex items-center justify-between text-muted-foreground">
        <div className="flex items-center gap-2 text-xs">
          {icon}
          {label}
        </div>
        <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: any; label: string }> = {
    draft: { variant: "secondary", label: "Draft" },
    in_review: { variant: "warning", label: "In review" },
    approved: { variant: "success", label: "Approved" },
    rejected: { variant: "destructive", label: "Rejected" },
    published: { variant: "default", label: "Published" },
  };
  const m = map[status] ?? { variant: "secondary", label: status };
  return <Badge variant={m.variant}>{m.label}</Badge>;
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border p-10 text-center">
      <p className="text-sm text-muted-foreground">No posts yet. Start by capturing a signal from a meeting.</p>
      <div className="mt-4">
        <Link href="/signals/new">
          <Button size="sm">Paste a transcript</Button>
        </Link>
      </div>
    </div>
  );
}
