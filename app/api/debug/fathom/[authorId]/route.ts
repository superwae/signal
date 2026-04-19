import { NextResponse, type NextRequest } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

// Temporary debug endpoint — remove after diagnosing
export async function GET(
  _req: NextRequest,
  { params }: { params: { authorId: string } }
) {
  const authorId = Number(params.authorId);
  const [author] = await db
    .select()
    .from(schema.authors)
    .where(eq(schema.authors.id, authorId));

  if (!author) return NextResponse.json({ error: "author not found" }, { status: 404 });

  return NextResponse.json({
    authorId: author.id,
    hasAccessToken: !!author.fathomAccessToken,
    hasRefreshToken: !!author.fathomRefreshToken,
    fathomUserEmail: author.fathomUserEmail,
    fathomUserId: author.fathomUserId,
    fathomConnectedAt: author.fathomConnectedAt,
    fathomLastSyncedAt: author.fathomLastSyncedAt,
  });
}
