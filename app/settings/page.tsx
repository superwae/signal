import { Suspense } from "react";
import { notFound } from "next/navigation";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/session";
import { FathomCard } from "@/app/authors/[id]/fathom-card";
import { LinkedInCard } from "@/app/authors/[id]/linkedin-card";
import { GoogleDriveCard } from "@/app/authors/[id]/google-drive-card";
import { LinkedinUrlEditor } from "@/app/authors/[id]/linkedin-url-editor";
import { Settings } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SettingsPage() {
  const session = await getCurrentUser();
  if (!session) notFound();

  if (!session.authorId) {
    return (
      <div className="mx-auto w-full max-w-2xl p-6 md:p-10">
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Settings className="h-4 w-4 text-cyan-500" />
            <span className="text-xs font-semibold text-cyan-500 uppercase tracking-widest">Settings</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">My Settings</h1>
        </header>
        <p className="text-sm text-muted-foreground">
          Your account is not linked to an author profile. To connect integrations, go to{" "}
          <a href="/authors" className="underline text-foreground">Authors</a> and manage connections from there.
        </p>
      </div>
    );
  }

  const [author] = await db
    .select()
    .from(schema.authors)
    .where(eq(schema.authors.id, session.authorId));

  if (!author) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl p-6 md:p-10">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="h-4 w-4 text-cyan-500" />
          <span className="text-xs font-semibold text-cyan-500 uppercase tracking-widest">Settings</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{author.name}</h1>
        {author.bio && <p className="mt-1 text-sm text-muted-foreground">{author.bio}</p>}
        <div className="mt-2">
          <LinkedinUrlEditor authorId={author.id} initialUrl={author.linkedinUrl ?? null} />
        </div>
      </header>

      <div className="space-y-4">
        <Suspense>
          <FathomCard
            authorId={author.id}
            fathomUserEmail={author.fathomUserEmail}
            fathomConnectedAt={author.fathomConnectedAt}
            fathomLastSyncedAt={author.fathomLastSyncedAt}
            isConnected={!!author.fathomAccessToken}
          />
        </Suspense>
        <Suspense>
          <LinkedInCard
            authorId={author.id}
            linkedinMemberName={author.linkedinMemberName}
            linkedinConnectedAt={author.linkedinConnectedAt}
            linkedinLastSyncedAt={author.linkedinLastSyncedAt}
            isConnected={!!author.linkedinAccessToken}
            linkedinUrl={author.linkedinUrl ?? null}
          />
        </Suspense>
        <Suspense>
          <GoogleDriveCard
            authorId={author.id}
            googleUserEmail={author.googleUserEmail ?? null}
            googleConnectedAt={author.googleConnectedAt ?? null}
            googleLastSyncedAt={author.googleLastSyncedAt ?? null}
            isConnected={!!author.googleAccessToken}
          />
        </Suspense>
      </div>
    </div>
  );
}
