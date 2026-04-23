import { NextResponse, type NextRequest } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const authorId = Number(body.authorId);
  if (!authorId) {
    return NextResponse.json({ error: "authorId required" }, { status: 400 });
  }

  const session = await getCurrentUser();
  if (!session?.isAdmin && session?.authorId !== authorId) {
    return NextResponse.json({ error: "Not authorised" }, { status: 403 });
  }

  await db
    .update(schema.authors)
    .set({
      fathomAccessToken: null,
      fathomRefreshToken: null,
      fathomTokenExpiresAt: null,
      fathomUserId: null,
      fathomUserEmail: null,
      fathomConnectedAt: null,
      fathomLastSyncedAt: null,
    })
    .where(eq(schema.authors.id, authorId));

  return NextResponse.json({ ok: true });
}
