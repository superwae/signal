import Link from "next/link";
import { db, schema } from "@/lib/db";
import { desc, eq, or } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReviewPage({ searchParams }: { searchParams: { tab?: string } }) {
  const tab = searchParams?.tab ?? "in_review";
  const status =
    tab === "drafts" ? "draft"
    : tab === "approved" ? "approved"
    : tab === "rejected" ? "rejected"
    : tab === "published" ? "published"
    : "in_review";

  const posts = await db
    .select()
    .from(schema.posts)
    .where(eq(schema.posts.status, status))
    .orderBy(desc(schema.posts.updatedAt))
    .catch(() => []);

  const tabs = [
    { key: "in_review", label: "In review" },
    { key: "drafts", label: "Drafts" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
    { key: "published", label: "Published" },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl p-6 md:p-10">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Review queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          What&apos;s waiting on you, what&apos;s shipped, what got sent back.
        </p>
      </header>

      <div className="mb-6 flex flex-wrap gap-1 border-b border-border">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/review?tab=${t.key}`}
            className={
              "rounded-t-md border-b-2 px-4 py-2 text-sm transition-colors " +
              (tab === t.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground")
            }
          >
            {t.label}
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">Nothing here yet.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/posts/${p.id}`}
              className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <p className="line-clamp-3 text-sm">{p.content}</p>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                <StatusBadge status={p.status} />
                <span>·</span>
                <span>Hook {p.hookStrengthScore ?? 0}/100</span>
                <span>·</span>
                <span>Specificity {p.specificityScore ?? 0}/100</span>
                <span>·</span>
                <span>Updated {timeAgo(p.updatedAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, any> = {
    draft: "secondary", in_review: "warning", approved: "success",
    rejected: "destructive", published: "default",
  };
  return <Badge variant={map[status] ?? "secondary"}>{status.replace("_", " ")}</Badge>;
}
