import { NextResponse, type NextRequest } from "next/server";

function hashToken(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return `h_${(h >>> 0).toString(36)}`;
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json().catch(() => ({}));
  const allowed = (process.env.ALLOWED_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  const expected = process.env.AUTH_SECRET;

  if (!expected) {
    return NextResponse.json({ error: "AUTH_SECRET not set on the server." }, { status: 500 });
  }
  if (allowed.length && !allowed.includes(String(email ?? "").toLowerCase())) {
    return NextResponse.json({ error: "This email is not on the allowlist." }, { status: 403 });
  }
  if (password !== expected) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("signal_auth", hashToken(expected), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
