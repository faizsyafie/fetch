"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

/**
 * One step of the guided tour.
 *
 * `selector` is a CSS selector for the element to spotlight (elements are
 * tagged with `data-tour="..."` attributes throughout the app). Pass `null`
 * for a centered, full-dim "welcome"/"outro" style slide with no target.
 */
export interface TourStep {
  id: string;
  selector: string | null;
  title: string;
  description: string;
  /** Preferred side for the tooltip; the engine flips it if there's no room. */
  placement?: "top" | "bottom" | "left" | "right";
}

interface SpotlightTourProps {
  steps: TourStep[];
  /** Called on Skip tour, Finish, the ✕ button, or Esc — treat all as "done". */
  onClose: () => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

type Placement = "top" | "bottom" | "left" | "right";

interface TooltipPosition {
  top: number;
  left: number;
  placement: Placement;
  /** Distance from the tooltip's top-left corner to the arrow, along the facing edge. */
  arrowOffset: number;
}

const SPOTLIGHT_PADDING = 8; // breathing room between the target and the spotlight ring
const TOOLTIP_GAP = 16; // gap between the spotlight and the tooltip card
const VIEWPORT_MARGIN = 12; // never let the tooltip touch the screen edge
const MOBILE_BREAKPOINT = 640;

function measure(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

export function SpotlightTour({ steps, onClose }: SpotlightTourProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition | null>(null);
  const [mounted, setMounted] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;

  const finish = useCallback(() => onClose(), [onClose]);
  const goNext = useCallback(() => {
    setStepIndex((i) => (i < steps.length - 1 ? i + 1 : i));
  }, [steps.length]);
  const goPrev = useCallback(() => {
    setStepIndex((i) => (i > 0 ? i - 1 : i));
  }, []);

  // Fade the whole tour in on first mount.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Locate this step's target, scroll it into view, and track its position
  // for the duration of the scroll animation so the spotlight follows along.
  useEffect(() => {
    const el = step.selector ? document.querySelector(step.selector) : null;
    if (!el) {
      // Centered intro/outro step (or a defensive fallback if a selector
      // ever fails to match) — no DOM element to track a position from.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTargetRect(null);
      return;
    }

    el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });

    let raf = 0;
    const track = () => {
      setTargetRect(measure(el));
      raf = requestAnimationFrame(track);
    };
    raf = requestAnimationFrame(track);
    const stopTracking = setTimeout(() => cancelAnimationFrame(raf), 600);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(stopTracking);
    };
  }, [step]);

  // Keep the spotlight glued to its target if the window resizes or anything
  // scrolls (capture:true also catches scroll on nested scroll containers,
  // e.g. the sidebar's own scroll area, since scroll events don't bubble).
  useEffect(() => {
    function recompute() {
      if (!step.selector) return;
      const el = document.querySelector(step.selector);
      if (el) setTargetRect(measure(el));
    }
    window.addEventListener("resize", recompute);
    window.addEventListener("scroll", recompute, true);
    return () => {
      window.removeEventListener("resize", recompute);
      window.removeEventListener("scroll", recompute, true);
    };
  }, [step]);

  // Work out where the tooltip card should sit: try the step's preferred
  // side first, fall back to whichever side actually has room, then clamp
  // inside the viewport so it never runs off-screen.
  useLayoutEffect(() => {
    const tooltip = tooltipRef.current;
    if (!tooltip) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = tooltip.offsetWidth;
    const h = tooltip.offsetHeight;

    if (!targetRect) {
      setTooltipPos({
        top: Math.max((vh - h) / 2, VIEWPORT_MARGIN),
        left: Math.max((vw - w) / 2, VIEWPORT_MARGIN),
        placement: "bottom",
        arrowOffset: 0,
      });
      return;
    }

    const spotlight = {
      top: targetRect.top - SPOTLIGHT_PADDING,
      left: targetRect.left - SPOTLIGHT_PADDING,
      width: targetRect.width + SPOTLIGHT_PADDING * 2,
      height: targetRect.height + SPOTLIGHT_PADDING * 2,
    };

    const space = {
      bottom: vh - (spotlight.top + spotlight.height),
      top: spotlight.top,
      right: vw - (spotlight.left + spotlight.width),
      left: spotlight.left,
    };

    const isMobile = vw < MOBILE_BREAKPOINT;
    // Side placements rarely fit on narrow screens, so don't consider them there.
    const candidates: Placement[] = isMobile
      ? ["bottom", "top"]
      : [step.placement ?? "bottom", "bottom", "top", "right", "left"];

    const placement =
      candidates.find((p) => {
        const needed = p === "left" || p === "right" ? w : h;
        return space[p] >= needed + TOOLTIP_GAP;
      }) ?? "bottom";

    let top = 0;
    let left = 0;
    if (placement === "bottom") {
      top = spotlight.top + spotlight.height + TOOLTIP_GAP;
      left = spotlight.left + spotlight.width / 2 - w / 2;
    } else if (placement === "top") {
      top = spotlight.top - h - TOOLTIP_GAP;
      left = spotlight.left + spotlight.width / 2 - w / 2;
    } else if (placement === "right") {
      top = spotlight.top + spotlight.height / 2 - h / 2;
      left = spotlight.left + spotlight.width + TOOLTIP_GAP;
    } else {
      top = spotlight.top + spotlight.height / 2 - h / 2;
      left = spotlight.left - w - TOOLTIP_GAP;
    }

    const clampedLeft = Math.min(Math.max(left, VIEWPORT_MARGIN), vw - w - VIEWPORT_MARGIN);
    const clampedTop = Math.min(Math.max(top, VIEWPORT_MARGIN), vh - h - VIEWPORT_MARGIN);

    // Point the arrow at the target's center, clamped so it stays on the card.
    const arrowOffset =
      placement === "top" || placement === "bottom"
        ? Math.min(Math.max(spotlight.left + spotlight.width / 2 - clampedLeft, 20), w - 20)
        : Math.min(Math.max(spotlight.top + spotlight.height / 2 - clampedTop, 20), h - 20);

    setTooltipPos({ top: clampedTop, left: clampedLeft, placement, arrowOffset });
  }, [targetRect, step]);

  // Esc to skip, arrow keys to navigate, Tab trapped inside the tooltip card.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        finish();
        return;
      }
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        if (isLast) finish();
        else goNext();
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!isFirst) goPrev();
        return;
      }
      if (e.key === "Tab") {
        const container = tooltipRef.current;
        if (!container) return;
        const focusable = container.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [finish, goNext, goPrev, isFirst, isLast]);

  // Lock page scroll for the duration of the tour. Programmatic scrolling
  // (scrollIntoView above) still works fine with overflow hidden — only the
  // user's own wheel/touch scrolling is blocked, which is what we want.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Move focus into the card on every step change, so screen readers
  // announce the new title/description via the dialog's aria attributes.
  useEffect(() => {
    tooltipRef.current?.focus();
  }, [stepIndex]);

  const spotlight: Rect | null = targetRect
    ? {
        top: targetRect.top - SPOTLIGHT_PADDING,
        left: targetRect.left - SPOTLIGHT_PADDING,
        width: targetRect.width + SPOTLIGHT_PADDING * 2,
        height: targetRect.height + SPOTLIGHT_PADDING * 2,
      }
    : null;

  return (
    <div
      className={`fixed inset-0 z-[999] transition-opacity duration-300 ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
      role="presentation"
    >
      {spotlight ? (
        <>
          {/* Four dark strips frame the spotlight rect exactly, leaving a
              real "hole" with nothing overlaying it — clicks pass straight
              through to the highlighted element, everything else is blocked. */}
          <DimStrip
            style={{ top: 0, left: 0, right: 0, height: Math.max(spotlight.top, 0) }}
          />
          <DimStrip
            style={{ top: spotlight.top + spotlight.height, left: 0, right: 0, bottom: 0 }}
          />
          <DimStrip
            style={{
              top: spotlight.top,
              left: 0,
              width: Math.max(spotlight.left, 0),
              height: spotlight.height,
            }}
          />
          <DimStrip
            style={{
              top: spotlight.top,
              left: spotlight.left + spotlight.width,
              right: 0,
              height: spotlight.height,
            }}
          />
          {/* Glowing ring drawn over the hole for visual polish only. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute rounded-xl transition-all duration-300 ease-out"
            style={{
              top: spotlight.top,
              left: spotlight.left,
              width: spotlight.width,
              height: spotlight.height,
              boxShadow:
                "0 0 0 2px rgba(59,130,246,0.9), 0 0 0 6px rgba(59,130,246,0.25), 0 0 32px rgba(59,130,246,0.35)",
            }}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-black/60 transition-opacity duration-300" />
      )}

      <div
        ref={tooltipRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-step-title"
        aria-describedby="tour-step-description"
        tabIndex={-1}
        className="absolute w-[calc(100vw-24px)] max-w-sm rounded-xl border border-brand-200 bg-white p-4 shadow-2xl outline-none transition-[top,left] duration-300 ease-out dark:border-brand-700 dark:bg-brand-900"
        style={{
          top: tooltipPos?.top ?? 0,
          left: tooltipPos?.left ?? 0,
          visibility: tooltipPos ? "visible" : "hidden",
        }}
      >
        {tooltipPos && spotlight && (
          <TooltipArrow placement={tooltipPos.placement} offset={tooltipPos.arrowOffset} />
        )}

        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-500">
            Step {stepIndex + 1} of {steps.length}
          </span>
          <button
            type="button"
            onClick={finish}
            aria-label="Close tour"
            className="rounded px-1.5 py-0.5 text-sm text-brand-400 hover:bg-brand-100 hover:text-brand-700 dark:hover:bg-brand-800 dark:hover:text-brand-200"
          >
            ✕
          </button>
        </div>

        <h2
          id="tour-step-title"
          className="mt-2 text-base font-bold text-brand-900 dark:text-white"
        >
          {step.title}
        </h2>
        <p
          id="tour-step-description"
          className="mt-1.5 text-sm leading-snug text-brand-600 dark:text-brand-300"
        >
          {step.description}
        </p>

        <div className="mt-4 flex items-center gap-1" aria-hidden="true">
          {steps.map((s, i) => (
            <span
              key={s.id}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === stepIndex ? "w-4 bg-blue-500" : "w-1.5 bg-brand-200 dark:bg-brand-700"
              }`}
            />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={finish}
            className="text-xs font-medium text-brand-400 hover:text-brand-600 dark:hover:text-brand-300"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={goPrev}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-100 dark:text-brand-300 dark:hover:bg-brand-800"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={isLast ? finish : goNext}
              className="rounded-md bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
            >
              {isLast ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DimStrip({ style }: { style: CSSProperties }) {
  return (
    <div
      aria-hidden="true"
      className="absolute bg-black/60 transition-all duration-300 ease-out"
      style={style}
    />
  );
}

function TooltipArrow({ placement, offset }: { placement: Placement; offset: number }) {
  const base =
    "absolute h-3 w-3 rotate-45 border border-brand-200 bg-white dark:border-brand-700 dark:bg-brand-900";
  switch (placement) {
    case "bottom":
      return (
        <div
          aria-hidden="true"
          className={base}
          style={{ top: -6, left: offset - 6, borderRight: "none", borderBottom: "none" }}
        />
      );
    case "top":
      return (
        <div
          aria-hidden="true"
          className={base}
          style={{ bottom: -6, left: offset - 6, borderLeft: "none", borderTop: "none" }}
        />
      );
    case "right":
      return (
        <div
          aria-hidden="true"
          className={base}
          style={{ left: -6, top: offset - 6, borderTop: "none", borderRight: "none" }}
        />
      );
    case "left":
      return (
        <div
          aria-hidden="true"
          className={base}
          style={{ right: -6, top: offset - 6, borderBottom: "none", borderLeft: "none" }}
        />
      );
  }
}
