import { NextResponse, type NextRequest } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { authorId } = await req.json();
  if (!authorId) return NextResponse.json({ error: "authorId required" }, { status: 400 });

  await db
    .update(schema.authors)
    .set({
      linkedinAccessToken: null,
      linkedinRefreshToken: null,
      linkedinTokenExpiresAt: null,
      linkedinMemberId: null,
      linkedinMemberName: null,
      linkedinConnectedAt: null,
      linkedinLastSyncedAt: null,
    })
    .where(eq(schema.authors.id, Number(authorId)));

  return NextResponse.json({ ok: true });
}
