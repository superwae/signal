import Link from "next/link";
import { db, schema } from "@/lib/db";
import { sql, eq, desc } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const rows = await db
    .select({
      postId: schema.posts.id,
      content: schema.posts.content,
      authorId: schema.posts.authorId,
      publishedAt: schema.posts.publishedAt,
      impressions: sql<number>`coalesce(sum(${schema.analytics.impressions}), 0)::int`,
      likes: sql<number>`coalesce(sum(${schema.analytics.likes}), 0)::int`,
      comments: sql<number>`coalesce(sum(${schema.analytics.comments}), 0)::int`,
      shares: sql<number>`coalesce(sum(${schema.analytics.shares}), 0)::int`,
    })
    .from(schema.posts)
    .leftJoin(schema.analytics, eq(schema.analytics.postId, schema.posts.id))
    .where(eq(schema.posts.status, "published"))
    .groupBy(schema.posts.id)
    .orderBy(desc(sql`coalesce(sum(${schema.analytics.likes}), 0)`))
    .catch(() => []);

  const authorRows = await db
    .select({
      authorId: schema.posts.authorId,
      totalLikes: sql<number>`coalesce(sum(${schema.analytics.likes}), 0)::int`,
      totalImpressions: sql<number>`coalesce(sum(${schema.analytics.impressions}), 0)::int`,
      postCount: sql<number>`count(distinct ${schema.posts.id})::int`,
    })
    .from(schema.posts)
    .leftJoin(schema.analytics, eq(schema.analytics.postId, schema.posts.id))
    .where(eq(schema.posts.status, "published"))
    .groupBy(schema.posts.authorId)
    .catch(() => []);

  const authorMap = new Map<number, { name: string; role: string | null }>();
  if (authorRows.length) {
    const authors = await db.select().from(schema.authors);
    authors.forEach((a) => authorMap.set(a.id, { name: a.name, role: a.role }));
  }

  const totals = rows.reduce(
    (acc, r) => ({
      posts: acc.posts + 1,
      impressions: acc.impressions + (r.impressions ?? 0),
      likes: acc.likes + (r.likes ?? 0),
      comments: acc.comments + (r.comments ?? 0),
    }),
    { posts: 0, impressions: 0, likes: 0, comments: 0 }
  );

  return (
    <div className="mx-auto w-full max-w-6xl p-6 md:p-10">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Post performance feeds back into generation — top-performing hooks get reused automatically.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Published posts" value={totals.posts} />
        <Stat label="Impressions" value={totals.impressions.toLocaleString()} />
        <Stat label="Likes" value={totals.likes.toLocaleString()} />
        <Stat label="Comments" value={totals.comments.toLocaleString()} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">Top posts by likes</h2>
          <div className="grid gap-3">
            {rows.length === 0 && <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">No published posts yet.</div>}
            {rows.map((r) => (
              <Link key={r.postId} href={`/posts/${r.postId}`} className="rounded-lg border bg-card p-4 transition-colors hover:border-primary/40">
                <p className="line-clamp-2 text-sm">{r.content}</p>
                <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
                  {r.authorId && authorMap.get(r.authorId) && <span>{authorMap.get(r.authorId)?.name}</span>}
                  {r.publishedAt && <span>Published {timeAgo(r.publishedAt)}</span>}
                  <span>·</span>
                  <span>{r.impressions.toLocaleString()} impressions</span>
                  <span>{r.likes.toLocaleString()} likes</span>
                  <span>{r.comments.toLocaleString()} comments</span>
                  <span>{r.shares.toLocaleString()} shares</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <aside>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">By author</CardTitle>
              <CardDescription>Total impressions across published posts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {authorRows.length === 0 && <p className="text-xs text-muted-foreground">No data yet.</p>}
              {authorRows.map((a) => {
                const author = a.authorId ? authorMap.get(a.authorId) : null;
                return (
                  <div key={a.authorId ?? 0}>
                    <div className="flex justify-between text-sm">
                      <span>{author?.name ?? "Unknown"}</span>
                      <span className="text-muted-foreground">{a.totalImpressions.toLocaleString()}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {a.postCount} post{a.postCount === 1 ? "" : "s"} · {a.totalLikes.toLocaleString()} likes
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}
