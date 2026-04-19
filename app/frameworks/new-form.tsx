"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createFrameworkAction } from "@/lib/actions";
import { toast } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";

export function NewFrameworkForm() {
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
        name, description, promptTemplate,
        bestFor: bestFor.split(",").map(s => s.trim()).filter(Boolean),
      });
      toast({ title: "Framework added", kind: "success" });
      setName(""); setDescription(""); setPromptTemplate(""); setBestFor("");
      router.refresh();
    } catch (e: any) {
      toast({ title: "Failed", description: e?.message, kind: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">New framework</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Hook · Story · Lesson" /></div>
        <div><Label>Description</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short explanation" /></div>
        <div>
          <Label>Prompt template</Label>
          <Textarea
            value={promptTemplate}
            onChange={(e) => setPromptTemplate(e.target.value)}
            placeholder="Describe the structure Claude should follow..."
            className="min-h-[120px]"
          />
        </div>
        <div>
          <Label>Best for (comma-separated signal types)</Label>
          <Input value={bestFor} onChange={(e) => setBestFor(e.target.value)} placeholder="customer_quote, success_metric" />
        </div>
        <Button onClick={submit} disabled={loading || !name || !description || !promptTemplate} className="w-full">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Add framework
        </Button>
      </CardContent>
    </Card>
  );
}
