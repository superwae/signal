"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAuthorAction } from "@/lib/actions";
import { toast } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";

export default function NewAuthorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", bio: "", linkedinUrl: "", styleNotes: "" });

  async function submit() {
    if (!form.name) return;
    setLoading(true);
    try {
      const a = await createAuthorAction(form);
      toast({ title: "Author created", kind: "success" });
      router.push(`/authors/${a.id}`);
    } catch (e: any) {
      toast({ title: "Failed", description: e?.message, kind: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-6 md:p-10">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">New author</h1>
      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="Name *">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Role">
            <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="CTO, Head of Sales, ..." />
          </Field>
          <Field label="LinkedIn URL">
            <Input value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} />
          </Field>
          <Field label="Bio">
            <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="A sentence or two about what they do." />
          </Field>
          <Field label="Style notes (optional)">
            <Textarea
              value={form.styleNotes}
              onChange={(e) => setForm({ ...form, styleNotes: e.target.value })}
              placeholder="e.g. 'hates emojis', 'uses hashtags', 'short lines'..."
            />
          </Field>
          <div className="flex justify-end">
            <Button onClick={submit} disabled={loading || !form.name}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
