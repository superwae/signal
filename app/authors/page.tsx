import Link from "next/link";
import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AuthorsPage() {
  const authors = await db.select().from(schema.authors).orderBy(desc(schema.authors.createdAt)).catch(() => []);
  return (
    <div className="mx-auto w-full max-w-5xl p-6 md:p-10">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Authors</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            People we write in the voice of. Voice profiles learn from edits automatically.
          </p>
        </div>
        <Link href="/authors/new"><Button><Plus className="h-4 w-4" /> New author</Button></Link>
      </header>

      {authors.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">No authors yet. Add one to start generating posts.</p>
          <div className="mt-4"><Link href="/authors/new"><Button size="sm">Add author</Button></Link></div>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {authors.map((a) => (
            <Link key={a.id} href={`/authors/${a.id}`}>
              <Card className="transition-colors hover:border-primary/40">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{a.name}</CardTitle>
                      {a.role && <CardDescription>{a.role}</CardDescription>}
                    </div>
                    {!a.active && <Badge variant="secondary">Inactive</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {a.voiceProfile ? a.voiceProfile.slice(0, 220) : (a.bio ?? "No voice profile yet — it'll build up from edits.")}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
