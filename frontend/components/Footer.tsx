import React from "react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/70 dark:border-slate-800 bg-white/50 dark:bg-slate-950/30 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">About</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              A platform that helps researchers easily create conference-ready LaTeX documents.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Links</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <a
                  className="text-blue-700 dark:text-cyan-300 hover:underline underline-offset-4"
                  href="https://github.com/DeepLumiere/IdeaOverflow"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  className="text-blue-700 dark:text-cyan-300 hover:underline underline-offset-4"
                  href="mailto:contact@ideaoverflow.local"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Build</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Next.js App Router • TypeScript • Tailwind • Local persistence
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200/70 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} IdeaOverflow. Built for HackaMined 2026.
        </div>
      </div>
    </footer>
  );
}
