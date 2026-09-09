export function SkeletonLoader() {
  return (
    <div className="flex h-screen flex-col overflow-hidden lg:flex-row">
      <aside className="hidden h-full w-56 shrink-0 flex-col border-r border-slate-200 bg-white p-4 dark:border-slate-800/80 dark:bg-slate-900 lg:flex">
        <div className="mb-4 h-3 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="mb-2 h-7 animate-pulse rounded bg-slate-100 dark:bg-slate-800/60"
          />
        ))}
      </aside>
      <div className="flex min-h-0 flex-1 flex-col bg-slate-50 dark:bg-slate-950">
        <div className="border-b border-slate-200 bg-white px-5 py-3 dark:border-slate-800/80 dark:bg-slate-900">
          <div className="h-4 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-2 h-3 w-64 animate-pulse rounded bg-slate-100 dark:bg-slate-800/60" />
        </div>
        <div className="flex-1 space-y-1.5 overflow-hidden px-4 py-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
