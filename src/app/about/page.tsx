import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | fetch",
  description: "About fetch and how to get in touch.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-50 px-4 py-16 text-center dark:bg-brand-900">
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
        fetch tracks company news across industries and a general World /
        Malaysia / Economy / Tech news board, pulling from RSS feeds so your team
        can keep an eye on what matters without digging through a dozen
        sites.
      </p>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-brand-600 dark:text-brand-300">
        Why a dog? Because that&apos;s what &quot;fetch&quot; is all about —
        a loyal companion that goes and retrieves what you need, then brings
        it straight back to you.
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

      <Link
        href="/"
        className="mt-8 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
      >
        ← Back to fetch
      </Link>
    </div>
  );
}
