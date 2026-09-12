"use client";

import { useAnimatedModal } from "@/hooks/useAnimatedModal";

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

export function AboutModal({ open, onClose }: AboutModalProps) {
  const { mounted, closing } = useAnimatedModal(open);
  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col overflow-y-auto bg-brand-50 px-4 py-16 text-center dark:bg-brand-900 ${closing ? "animate-modal-fullscreen-out" : "animate-modal-fullscreen"}`}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="fixed right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-brand-200 bg-white text-sm text-brand-500 shadow-sm transition-colors hover:bg-brand-100 hover:text-brand-700 dark:border-brand-700 dark:bg-brand-800 dark:text-brand-300 dark:hover:bg-brand-700"
      >
        ✕
      </button>

      <div className="m-auto flex w-full flex-col items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/full-logo-dog-light.png"
          alt="fetch — Daily RSS"
          className="block h-24 w-auto object-contain dark:hidden sm:h-32"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/full-logo-dog-dark.png"
          alt="fetch — Daily RSS"
          className="hidden h-24 w-auto object-contain dark:block sm:h-32"
        />

        <h1 className="mt-6 text-2xl font-bold text-brand-900 dark:text-white">
          About fetch
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-brand-600 dark:text-brand-300">
          Fetch tracks company news across industries as well as general
          thematic news, bringing updates from multiple RSS sources into a
          single feed. It helps your team monitor what matters without
          digging through countless news sites every day.
        </p>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-brand-600 dark:text-brand-300">
          The name comes from man&rsquo;s best friend. Dogs have long been
          valued for retrieving, delivering, and carrying messages when people
          needed information moved from one place to another. Fetch does the
          same for news. It goes out, finds what matters, and brings it back
          for you.
        </p>
        <p className="mt-3 max-w-md text-sm font-semibold italic text-brand-700 dark:text-brand-200">
          A loyal retriever for the information age.
        </p>
        <p className="mt-3 max-w-md text-xs leading-relaxed text-brand-500 dark:text-brand-400">
          Special thanks to my beta testers (you know who you are) for
          keeping me well fed with suggestions :)
        </p>

        <div className="mt-8 w-full max-w-xs rounded-lg border border-brand-200 bg-white p-5 text-left shadow-sm dark:border-brand-700 dark:bg-brand-800">
          <p className="text-[11px] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-500">
            Contact
          </p>
          <a
            href="mailto:faizsyafie5@gmail.com"
            className="mt-2 flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-blue-600 dark:text-brand-200 dark:hover:text-blue-400"
          >
            <span aria-hidden="true">✉️</span>
            faizsyafie5@gmail.com
          </a>
          <a
            href="https://github.com/faizsyafie"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-blue-600 dark:text-brand-200 dark:hover:text-blue-400"
          >
            <span aria-hidden="true">🐙</span>
            github.com/faizsyafie
          </a>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-8 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
        >
          ← Back to fetch
        </button>
      </div>
    </div>
  );
}
