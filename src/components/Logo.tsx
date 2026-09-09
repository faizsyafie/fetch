interface LogoProps {
  compact?: boolean;
}

// Text wordmark matching the "fetch" brand mark's Poppins lettering and
// "Daily RSS" tag. The illustrated bird mark itself isn't included yet —
// swap in an <img> here once the source asset is available as a file.
export function Logo({ compact = false }: LogoProps) {
  if (compact) {
    return (
      <span className="text-xl font-extrabold lowercase tracking-tight text-brand-900 dark:text-brand-50">
        f
      </span>
    );
  }

  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-xl font-extrabold lowercase leading-none tracking-tight text-brand-900 dark:text-brand-50">
        fetch
      </span>
      <span className="text-[10px] font-medium text-brand-400 dark:text-brand-500">
        Daily RSS
      </span>
    </div>
  );
}
