import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewFrameworkForm } from "./new-form";

export const dynamic = "force-dynamic";

export default async function FrameworksPage() {
  const frameworks = await db.select().from(schema.frameworks).orderBy(desc(schema.frameworks.createdAt)).catch(() => []);
  return (
    <div className="mx-auto w-full max-w-5xl p-6 md:p-10">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Frameworks</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Post structures the generator can use. Add your own — the prompt template tells Claude how to apply it.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-3">
          {frameworks.length === 0 && (
            <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
              No frameworks yet. Create one on the right (or seed defaults via the seed script).
            </div>
          )}
          {frameworks.map((f) => (
            <Card key={f.id}>
              <CardHeader>
                <CardTitle className="text-base">{f.name}</CardTitle>
                <CardDescription>{f.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-2 flex flex-wrap gap-1">
                  {(f.bestFor ?? []).map((b) => <Badge key={b} variant="secondary">{b.replaceAll("_", " ")}</Badge>)}
                </div>
                <pre className="whitespace-pre-wrap rounded-md bg-secondary/50 p-3 text-xs text-muted-foreground">{f.promptTemplate}</pre>
              </CardContent>
            </Card>
          ))}
        </div>

        <aside>
          <NewFrameworkForm />
        </aside>
      </div>
    </div>
  );
}
