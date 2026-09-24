"use client";

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  refreshing: boolean;
  triggerDistance: number;
}

// Rendered as the first child of the pull-to-refresh container, collapsing
// to 0 height when idle so it takes no space until actually being pulled.
export function PullToRefreshIndicator({
  pullDistance,
  refreshing,
  triggerDistance,
}: PullToRefreshIndicatorProps) {
  const height = refreshing ? triggerDistance : pullDistance;
  if (height === 0) return null;

  const readyToRelease = pullDistance >= triggerDistance;
  const rotation = Math.min((pullDistance / triggerDistance) * 180, 180);

  return (
    <div
      aria-hidden="true"
      className="flex items-center justify-center overflow-hidden text-brand-400 dark:text-brand-500"
      style={{ height, transition: refreshing ? "height 150ms ease-out" : "none" }}
    >
      {refreshing ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-300 border-t-blue-500 dark:border-brand-700 dark:border-t-blue-400" />
      ) : (
        <span
          className="text-base"
          style={{
            transform: `rotate(${rotation}deg)`,
            opacity: Math.min(pullDistance / 24, 1),
          }}
        >
          {readyToRelease ? "↑" : "↓"}
        </span>
      )}
    </div>
  );
}
