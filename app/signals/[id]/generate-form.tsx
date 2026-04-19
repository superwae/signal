"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { generatePostAction } from "@/lib/actions";
import { toast } from "@/components/ui/toaster";
import { Loader2, Sparkles } from "lucide-react";

type Author = { id: number; name: string; role: string | null };
type Framework = { id: number; name: string; description: string; bestFor: string[] };

export function SignalGenerateForm({
  signalId,
  contentAngles,
  recommendedAuthorId,
  authors,
  frameworks,
  contentType,
}: {
  signalId: number;
  contentAngles: string[];
  recommendedAuthorId: number | null;
  authors: Author[];
  frameworks: Framework[];
  contentType: string;
}) {
  const router = useRouter();
  const [authorId, setAuthorId] = useState<number | null>(recommendedAuthorId ?? authors[0]?.id ?? null);
  const [angle, setAngle] = useState<string>(contentAngles[0] ?? "");
  const [customAngle, setCustomAngle] = useState("");

  const recommendedFramework = useMemo(() => {
    return frameworks.find((f) => f.bestFor?.includes(contentType)) ?? frameworks[0];
  }, [frameworks, contentType]);

  const [frameworkId, setFrameworkId] = useState<number | null>(recommendedFramework?.id ?? null);
  const [loading, setLoading] = useState(false);

  async function onGenerate() {
    if (!authorId || !frameworkId) {
      toast({ title: "Pick an author and a framework first.", kind: "error" });
      return;
    }
    const finalAngle = (customAngle.trim() || angle || "").trim();
    if (!finalAngle) {
      toast({ title: "Pick or write a content angle.", kind: "error" });
      return;
    }
    setLoading(true);
    try {
      const post = await generatePostAction({
        signalId,
        authorId,
        frameworkId,
        contentAngle: finalAngle,
      });
      router.push(`/posts/${post.id}`);
    } catch (e: any) {
      toast({ title: "Generation failed", description: e?.message, kind: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Label>Author</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {authors.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setAuthorId(a.id)}
              className={
                "rounded-md border px-3 py-2 text-left text-sm transition-colors " +
                (authorId === a.id
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border hover:border-primary/40")
              }
            >
              <div className="font-medium">{a.name}</div>
              {a.role && <div className="text-[11px] text-muted-foreground">{a.role}</div>}
              {recommendedAuthorId === a.id && (
                <Badge variant="default" className="mt-1">Recommended</Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Framework</Label>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          {frameworks.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFrameworkId(f.id)}
              className={
                "rounded-md border p-3 text-left transition-colors " +
                (frameworkId === f.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/40")
              }
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{f.name}</div>
                {recommendedFramework?.id === f.id && <Badge variant="default">Recommended</Badge>}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{f.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Content angle</Label>
        {contentAngles.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {contentAngles.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => { setAngle(a); setCustomAngle(""); }}
                className={
                  "rounded-full border px-3 py-1 text-xs transition-colors " +
                  (angle === a && !customAngle
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border hover:border-primary/40")
                }
              >
                {a}
              </button>
            ))}
          </div>
        )}
        <Textarea
          value={customAngle}
          onChange={(e) => setCustomAngle(e.target.value)}
          placeholder="Or write your own angle..."
          className="mt-2"
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={onGenerate} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Generate post
        </Button>
      </div>
    </div>
  );
}
