/**
 * Seed default frameworks and a couple of example authors.
 * Run with: npx tsx scripts/seed.ts
 */
import { db, schema } from "../lib/db";

async function main() {
  const existing = await db.select().from(schema.frameworks);
  if (existing.length === 0) {
    await db.insert(schema.frameworks).values([
      {
        name: "Hook · Story · Lesson",
        description: "Strong opening, one specific story, one takeaway. The default.",
        promptTemplate:
          "Structure: (1) One-line hook that creates curiosity or tension. (2) A 3-5 line story with a specific moment, number, or quote. (3) One line that names the lesson — no moralizing. (4) One line that invites a response.",
        bestFor: ["customer_quote", "buying_signal", "technical_insight", "lesson"],
      },
      {
        name: "Before · After · Bridge",
        description: "A specific change: what it was, what it is, what moved it.",
        promptTemplate:
          "Structure: (1) Describe the 'before' state in concrete terms — a number, a pain, a moment. (2) The 'after' state — equally concrete. (3) The 'bridge' — the one specific thing that changed it. No abstractions. No 'the rest is history.'",
        bestFor: ["success_metric", "before_after"],
      },
      {
        name: "Counter-take",
        description: "A short, confident take that goes against common wisdom.",
        promptTemplate:
          "Structure: (1) State the common wisdom most people repeat. (2) Say why it's wrong — use a specific example or number. (3) Offer a better rule. Keep it under 140 words. Sharp, not preachy.",
        bestFor: ["technical_insight", "objection"],
      },
      {
        name: "Data drop",
        description: "Lead with a single striking number, then unpack it.",
        promptTemplate:
          "Structure: (1) The number — on its own line. (2) What it means — one line. (3) Why it matters — 2-3 lines with a concrete example. (4) What it implies. No throat-clearing.",
        bestFor: ["success_metric"],
      },
      {
        name: "Quote carousel",
        description: "A real quote from a customer or meeting, framed honestly.",
        promptTemplate:
          "Structure: (1) Set the scene in one line — who, when, context. (2) The quote itself, indented. (3) Your 2-sentence reflection on why it stuck with you. Do NOT add a CTA. Let the quote carry it.",
        bestFor: ["customer_quote", "paying_quote"],
      },
    ]);
    console.log("Seeded frameworks.");
  } else {
    console.log(`Skipped frameworks seed (${existing.length} already exist).`);
  }

  const authors = await db.select().from(schema.authors);
  if (authors.length === 0) {
    await db.insert(schema.authors).values([
      {
        name: "Wael Salameh",
        role: "Founder",
        bio: "Engineer turned founder. Writes like a technical person explaining things over coffee.",
        styleNotes: "Short lines. Specific numbers. No hashtags. No 'excited to share'.",
      },
    ]);
    console.log("Seeded default author.");
  } else {
    console.log(`Skipped authors seed (${authors.length} already exist).`);
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
