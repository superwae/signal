import Link from "next/link";
import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SignalsPage() {
  const signals = await db.select().from(schema.signals).orderBy(desc(schema.signals.createdAt));
  return (
    <div className="mx-auto w-full max-w-6xl p-6 md:p-10">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Signals</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every moment from a meeting that could turn into a post.
          </p>
        </div>
        <Link href="/signals/new">
          <Button>
            <Plus className="h-4 w-4" />
            New signals from transcript
          </Button>
        </Link>
      </header>

      {signals.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">No signals yet.</p>
          <div className="mt-4">
            <Link href="/signals/new"><Button size="sm">Paste a transcript</Button></Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {signals.map((s) => (
            <Link
              key={s.id}
              href={`/signals/${s.id}`}
              className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{s.rawContent}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <Badge variant="secondary">{s.contentType.replaceAll("_", " ")}</Badge>
                    <Badge variant={s.status === "unused" ? "warning" : s.status === "used" ? "success" : "secondary"}>
                      {s.status}
                    </Badge>
                    {s.speaker && <span>· {s.speaker}</span>}
                    <span>· {timeAgo(s.createdAt)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
