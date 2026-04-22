"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createFrameworkAction } from "@/lib/actions";
import { toast } from "@/components/ui/toaster";
import { ArrowLeft, Layers, Loader2, Plus } from "lucide-react";

export default function NewFrameworkPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [promptTemplate, setPromptTemplate] = useState("");
  const [bestFor, setBestFor] = useState("");

  async function submit() {
    if (!name || !description || !promptTemplate) return;
    setLoading(true);
    try {
      await createFrameworkAction({
        name,
        description,
        promptTemplate,
        bestFor: bestFor.split(",").map((s) => s.trim()).filter(Boolean),
      });
      toast({ title: "Framework created", kind: "success" });
      router.push("/frameworks");
    } catch (e: any) {
      toast({ title: "Failed", description: e?.message, kind: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-6 md:p-10">
      <div className="mb-6">
        <Link href="/frameworks">
          <Button variant="ghost" size="sm" className="pl-1">
            <ArrowLeft className="h-4 w-4" />
            Back to frameworks
          </Button>
        </Link>
      </div>

      <header className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Layers className="h-4 w-4 text-purple-500" />
          <span className="text-xs font-semibold text-purple-500 uppercase tracking-widest">Frameworks</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">New framework</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Define a post structure. The prompt template tells Claude exactly how to apply it.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Framework details</CardTitle>
          <CardDescription>
            Give it a clear name and a prompt template that describes the structure Claude should follow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Hook · Story · Lesson"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="One sentence explaining when to use this"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prompt">Prompt template</Label>
            <Textarea
              id="prompt"
              value={promptTemplate}
              onChange={(e) => setPromptTemplate(e.target.value)}
              placeholder="Describe the structure Claude should follow. E.g.:
1. Open with a single-sentence hook that makes a bold claim.
2. Tell the specific story that proves the claim (3–5 lines).
3. End with one actionable lesson the reader can apply today."
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bestFor">
              Best for <span className="text-muted-foreground font-normal">(comma-separated signal types, optional)</span>
            </Label>
            <Input
              id="bestFor"
              value={bestFor}
              onChange={(e) => setBestFor(e.target.value)}
              placeholder="e.g. customer_quote, success_metric, post"
            />
            <p className="text-[11px] text-muted-foreground">
              Used to auto-select and auto-star this framework when its signal type matches.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Link href="/frameworks">
              <Button variant="outline" disabled={loading}>Cancel</Button>
            </Link>
            <Button
              onClick={submit}
              disabled={loading || !name || !description || !promptTemplate}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create framework
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
