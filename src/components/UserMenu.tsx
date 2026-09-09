"use client";

import { useEffect, useRef, useState } from "react";

interface UserMenuProps {
  name: string;
  onLogOut: () => void;
}

export function UserMenu({ name, onLogOut }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={name}
        className="flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 py-1.5 pl-1.5 pr-2.5 text-xs font-medium text-brand-600 transition hover:bg-brand-100 dark:border-brand-700 dark:bg-brand-800 dark:text-brand-300 dark:hover:bg-brand-700"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-700 text-[10px] font-bold text-brand-50 dark:bg-brand-200 dark:text-brand-900">
          {initial}
        </span>
        <span className="max-w-[8rem] truncate">{name}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-lg border border-brand-200 bg-white shadow-lg dark:border-brand-700 dark:bg-brand-900">
          <div className="border-b border-brand-200 px-3 py-2 dark:border-brand-800">
            <p className="truncate text-xs font-semibold text-brand-900 dark:text-white">
              {name}
            </p>
            <p className="text-[10px] text-brand-400 dark:text-brand-600">
              Shared profile
            </p>
          </div>
          <a
            href="/about"
            className="block w-full px-3 py-2 text-left text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-800"
          >
            ℹ️ About
          </a>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onLogOut();
            }}
            className="w-full border-t border-brand-200 px-3 py-2 text-left text-xs font-medium text-red-600 transition-colors hover:bg-brand-50 dark:border-brand-800 dark:text-red-400 dark:hover:bg-brand-800"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
