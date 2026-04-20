import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { isNotNull, and, eq } from "drizzle-orm";
import { getValidLinkedinToken, fetchLinkedinPostMetrics } from "@/lib/linkedin";

export const dynamic = "force-dynamic";

export async function GET() {
  const authors = await db
    .select()
    .from(schema.authors)
    .where(isNotNull(schema.authors.linkedinAccessToken));

  let totalSynced = 0;
  const errors: string[] = [];

  for (const author of authors) {
    let token: string;
    try {
      token = await getValidLinkedinToken(author.id);
    } catch (e: any) {
      errors.push(`author ${author.id}: ${e.message}`);
      continue;
    }

    const posts = await db
      .select()
      .from(schema.posts)
      .where(
        and(
          eq(schema.posts.authorId, author.id),
          eq(schema.posts.status, "published"),
          isNotNull(schema.posts.linkedinPostUrn)
        )
      );

    for (const post of posts) {
      const metrics = await fetchLinkedinPostMetrics(token, post.linkedinPostUrn!).catch(() => null);
      if (!metrics) continue;

      const [existing] = await db
        .select()
        .from(schema.analytics)
        .where(
          and(
            eq(schema.analytics.postId, post.id),
            eq(schema.analytics.source, "linkedin")
          )
        );

      if (existing) {
        await db
          .update(schema.analytics)
          .set({
            impressions: metrics.impressions,
            likes: metrics.likes,
            comments: metrics.comments,
            shares: metrics.shares,
            capturedAt: new Date(),
          })
          .where(eq(schema.analytics.id, existing.id));
      } else {
        await db.insert(schema.analytics).values({
          postId: post.id,
          impressions: metrics.impressions,
          likes: metrics.likes,
          comments: metrics.comments,
          shares: metrics.shares,
          clicks: 0,
          source: "linkedin",
        });
      }

      totalSynced++;
    }

    await db
      .update(schema.authors)
      .set({ linkedinLastSyncedAt: new Date() })
      .where(eq(schema.authors.id, author.id));
  }

  return NextResponse.json({ ok: true, synced: totalSynced, errors });
}
