"use client";

import { useState } from "react";
import { ACCENT_PRESETS } from "@/lib/defaults";
import type { AccentColor } from "@/lib/types";
import type { ModeGuideStep } from "@/lib/modeGuide";
import { useAnimatedModal } from "@/hooks/useAnimatedModal";

interface HelpModalProps {
  open: boolean;
  steps: ModeGuideStep[];
  accent: AccentColor;
  onSelectMode?: (mode: ModeGuideStep["mode"]) => void;
  onClose: () => void;
}

// Doubles as two different experiences depending on how many steps it's
// given: multiple (the Home page's tour) gets prev/next + dots and a
// "Go there" shortcut per step; a single step (any other page's own ❓)
// just shows that page's own longer explanation with no navigation chrome.
export function HelpModal({ open, steps, accent, onSelectMode, onClose }: HelpModalProps) {
  const accentPreset = ACCENT_PRESETS[accent];
  const { mounted, closing } = useAnimatedModal(open);
  const [index, setIndex] = useState(0);

  // Reset to the first step each time it's freshly reopened — this modal
  // stays mounted (invisible) between opens now, see useAnimatedModal.
  const [openTrackedFor, setOpenTrackedFor] = useState(open);
  if (open !== openTrackedFor) {
    setOpenTrackedFor(open);
    if (open) setIndex(0);
  }

  if (!mounted) return null;

  const isMulti = steps.length > 1;
  const step = steps[Math.min(index, steps.length - 1)];
  const isLast = index >= steps.length - 1;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-brand-950/50 p-4 ${closing ? "animate-modal-backdrop-out" : "animate-modal-backdrop"}`}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-lg border border-brand-200 bg-white shadow-2xl dark:border-brand-700 dark:bg-brand-900 ${closing ? "animate-modal-panel-out" : "animate-modal-panel"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-brand-200 px-4 py-3 dark:border-brand-800">
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-brand-900 dark:text-white">
            <span aria-hidden="true">{step.emoji}</span>
            {step.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded px-1.5 py-0.5 text-sm text-brand-400 hover:bg-brand-100 hover:text-brand-700 dark:hover:bg-brand-800 dark:hover:text-brand-200"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 px-4 py-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-600">
            {step.tagline}
          </p>
          {step.body.map((paragraph, i) => (
            <p key={i} className="text-sm leading-relaxed text-brand-600 dark:text-brand-300">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-brand-200 px-4 py-3 dark:border-brand-800">
          {isMulti ? (
            <>
              <div className="flex items-center gap-1">
                {steps.map((s, i) => (
                  <button
                    key={s.mode}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Go to step ${i + 1}: ${s.title}`}
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${
                      i === index ? accentPreset.solid : "bg-brand-200 dark:bg-brand-700"
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                {onSelectMode && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectMode(step.mode);
                      onClose();
                    }}
                    className="rounded-lg border border-brand-200 px-2.5 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-100 dark:border-brand-700 dark:text-brand-300 dark:hover:bg-brand-800"
                  >
                    Go there
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => (isLast ? onClose() : setIndex((i) => i + 1))}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors ${accentPreset.solid} ${accentPreset.solidHover}`}
                >
                  {isLast ? "Got it 🐾" : "Next"}
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className={`ml-auto rounded-lg px-4 py-1.5 text-sm font-semibold text-white ${accentPreset.solid} ${accentPreset.solidHover}`}
            >
              Got it
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
