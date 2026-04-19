"use client";
import { useEffect, useState } from "react";

type Toast = { id: number; title: string; description?: string; kind?: "info" | "success" | "error" };
let externalPush: ((t: Omit<Toast, "id">) => void) | null = null;

export function toast(t: Omit<Toast, "id">) {
  externalPush?.(t);
}

export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(() => {
    externalPush = (t) => {
      const id = Date.now() + Math.random();
      setItems((prev) => [...prev, { ...t, id }]);
      setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== id)), 3500);
    };
    return () => {
      externalPush = null;
    };
  }, []);
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          className={
            "min-w-[260px] rounded-lg border bg-card px-4 py-3 shadow-lg " +
            (t.kind === "error" ? "border-destructive/30" : t.kind === "success" ? "border-emerald-500/30" : "border-border")
          }
        >
          <div className="text-sm font-medium">{t.title}</div>
          {t.description && <div className="mt-0.5 text-xs text-muted-foreground">{t.description}</div>}
        </div>
      ))}
    </div>
  );
}
