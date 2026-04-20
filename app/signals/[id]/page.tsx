import { notFound } from "next/navigation";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SignalGenerateForm } from "./generate-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SignalDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const [signal] = await db.select().from(schema.signals).where(eq(schema.signals.id, id));
  if (!signal) notFound();
  const authors = await db.select().from(schema.authors).where(eq(schema.authors.active, true));
  const frameworks = await db.select().from(schema.frameworks);

  return (
    <div className="mx-auto w-full max-w-4xl p-6 md:p-10">
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">{signal.contentType.replaceAll("_", " ")}</Badge>
          {signal.speaker && <span>· {signal.speaker}</span>}
          {signal.sourceMeetingTitle && <span>· {signal.sourceMeetingTitle}</span>}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Signal #{signal.id}</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Raw content</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{signal.rawContent}</p>
        </CardContent>
      </Card>

      {signal.notes && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Notes</CardTitle></CardHeader>
          <CardContent><p className="text-sm">{signal.notes}</p></CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Generate a post</CardTitle>
          <CardDescription>Pick an author and a framework. Claude drafts in their voice.</CardDescription>
        </CardHeader>
        <CardContent>
          <SignalGenerateForm
            signalId={signal.id}
            contentAngles={signal.contentAngles ?? []}
            recommendedAuthorId={signal.recommendedAuthorId}
            authors={authors.map((a) => ({ id: a.id, name: a.name, role: a.role }))}
            frameworks={frameworks.map((f) => ({ id: f.id, name: f.name, description: f.description, bestFor: f.bestFor ?? [] }))}
            contentType={signal.contentType}
          />
        </CardContent>
      </Card>
    </div>
  );
}
