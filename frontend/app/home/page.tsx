"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { UploadBox } from "@/components/UploadBox";
import { ConferenceCard } from "@/components/ConferenceCard";
import { useAuth } from "@/context/AuthContext";
import { useEditor } from "@/context/EditorContext";
import type { ConferenceId } from "@/types/editor";

const conferences: Array<{
  id: ConferenceId;
  name: string;
  description: string;
}> = [
  { id: "IEEE", name: "IEEE Conference", description: "Two-column layout with a crisp, technical tone." },
  { id: "ACM", name: "ACM Conference", description: "Clean single-column layout focused on readability." },
  { id: "Springer", name: "Springer Conference", description: "Proceedings style with structured headings and spacing." },
];

export default function HomePage() {
  const router = useRouter();
  const { loading, isAuthenticated, user } = useAuth();
  const { uploadedFile, selectedConference, setSelectedConference } = useEditor();

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace("/login");
  }, [isAuthenticated, loading, router]);

  const onSelectConference = (conf: ConferenceId) => {
    setSelectedConference(conf);
    router.push(`/editor?conf=${encodeURIComponent(conf)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-300">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Build conference papers, fast
            </h1>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl">
              Upload a manuscript (optional), choose a template, then compose structured sections with a live preview.
            </p>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Signed in as <span className="font-medium text-slate-700 dark:text-slate-200">{user?.email}</span>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section>
              <div className="flex items-end justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">File upload</h2>
                {uploadedFile && (
                  <div className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/40 px-2 py-1 rounded-lg">
                    Selected: {uploadedFile.name}
                  </div>
                )}
              </div>
              <div className="mt-4">
                <UploadBox />
              </div>
            </section>

            <section>
              <div className="flex items-end justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Select a conference</h2>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Current: <span className="font-medium">{selectedConference}</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {conferences.map((c) => (
                  <ConferenceCard
                    key={c.id}
                    name={c.name}
                    description={c.description}
                    selected={selectedConference === c.id}
                    onSelect={() => onSelectConference(c.id)}
                  />
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

