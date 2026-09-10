"use client";

import {
  ACCENT_PRESETS,
  FONT_FAMILY_PRESETS,
  FONT_SCALE_PRESETS,
} from "@/lib/defaults";
import type { AccentColor, Density, FontFamily, FontScale } from "@/lib/types";
import type { Theme } from "@/hooks/useTheme";

interface CustomizePanelProps {
  theme: Theme;
  accent: AccentColor;
  fontFamily: FontFamily;
  fontScale: FontScale;
  density: Density;
  onToggleTheme: () => void;
  onSetAccent: (accent: AccentColor) => void;
  onSetFontFamily: (fontFamily: FontFamily) => void;
  onSetFontScale: (fontScale: FontScale) => void;
  onSetDensity: (density: Density) => void;
  onClose: () => void;
}

export function CustomizePanel({
  theme,
  accent,
  fontFamily,
  fontScale,
  density,
  onToggleTheme,
  onSetAccent,
  onSetFontFamily,
  onSetFontScale,
  onSetDensity,
  onClose,
}: CustomizePanelProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border border-brand-200 bg-white shadow-2xl dark:border-brand-700 dark:bg-brand-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-brand-200 px-4 py-3 dark:border-brand-800">
          <h2 className="text-sm font-bold text-brand-900 dark:text-white">
            Settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings panel"
            className="rounded px-1.5 py-0.5 text-sm text-brand-400 hover:bg-brand-100 hover:text-brand-700 dark:hover:bg-brand-800 dark:hover:text-brand-200"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5 px-4 py-4">
          <section>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-600">
              Theme
            </p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { key: "light" as Theme, label: "☀️ Light" },
                  { key: "dark" as Theme, label: "🌙 Dark" },
                ] as const
              ).map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (key !== theme) onToggleTheme();
                  }}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    theme === key
                      ? "border-brand-900 bg-brand-100 text-brand-900 dark:border-white dark:bg-brand-800 dark:text-white"
                      : "border-brand-200 text-brand-600 hover:bg-brand-50 dark:border-brand-700 dark:text-brand-300 dark:hover:bg-brand-800"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-600">
              Accent color
            </p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(ACCENT_PRESETS) as AccentColor[]).map((key) => {
                const preset = ACCENT_PRESETS[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onSetAccent(key)}
                    title={preset.label}
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${preset.swatch} transition-transform ${
                      accent === key
                        ? "ring-2 ring-offset-2 ring-brand-900 dark:ring-white dark:ring-offset-brand-900"
                        : "hover:scale-110"
                    }`}
                  >
                    {accent === key && (
                      <span className="text-xs text-white">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-600">
              Row spacing
            </p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { key: "comfortable" as Density, label: "Comfortable", rows: 2, bar: "h-3" },
                  { key: "compact" as Density, label: "Compact", rows: 4, bar: "h-1.5" },
                ] as const
              ).map(({ key, label, rows, bar }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSetDensity(key)}
                  className={`flex w-[124px] flex-col gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors ${
                    density === key
                      ? "border-brand-900 bg-brand-100 text-brand-900 dark:border-white dark:bg-brand-800 dark:text-white"
                      : "border-brand-200 text-brand-600 hover:bg-brand-50 dark:border-brand-700 dark:text-brand-300 dark:hover:bg-brand-800"
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    {Array.from({ length: rows }).map((_, i) => (
                      <span
                        key={i}
                        className={`${bar} w-full rounded-sm bg-current opacity-30`}
                      />
                    ))}
                  </div>
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-brand-400 dark:text-brand-600">
              Compact packs more companies on screen with smaller rows;
              Comfortable gives each one more room to breathe.
            </p>
          </section>

          <section>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-600">
              Font
            </p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(FONT_FAMILY_PRESETS) as FontFamily[]).map(
                (key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onSetFontFamily(key)}
                    style={{ fontFamily: FONT_FAMILY_PRESETS[key].stack }}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      fontFamily === key
                        ? "border-brand-900 bg-brand-100 text-brand-900 dark:border-white dark:bg-brand-800 dark:text-white"
                        : "border-brand-200 text-brand-600 hover:bg-brand-50 dark:border-brand-700 dark:text-brand-300 dark:hover:bg-brand-800"
                    }`}
                  >
                    {FONT_FAMILY_PRESETS[key].label}
                  </button>
                )
              )}
            </div>
          </section>

          <section>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-600">
              Font size
            </p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(FONT_SCALE_PRESETS) as FontScale[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSetFontScale(key)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    fontScale === key
                      ? "border-brand-900 bg-brand-100 text-brand-900 dark:border-white dark:bg-brand-800 dark:text-white"
                      : "border-brand-200 text-brand-600 hover:bg-brand-50 dark:border-brand-700 dark:text-brand-300 dark:hover:bg-brand-800"
                  }`}
                >
                  {FONT_SCALE_PRESETS[key].label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-brand-400 dark:text-brand-600">
              Font size is applied as an overall page zoom, so it may render
              slightly differently across browsers.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
