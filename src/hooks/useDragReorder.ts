"use client";

import { useEffect, useRef, useState } from "react";

// px of pointer movement before a press-and-hold on the handle escalates
// into an actual drag — below this, it's treated as a plain tap (so tapping
// the handle, or a nested rename/delete button in the same row, still
// works normally instead of every touch immediately starting a drag).
const DRAG_THRESHOLD = 8;

interface DragReorderState {
  draggingId: string | null;
  dragOverId: string | null;
}

/**
 * Pointer-events-based drag-to-reorder, usable for both vertical lists and
 * horizontal rows of items (the hit-test below is just "which registered
 * item's bounding box contains the pointer", which works the same either
 * way) — replaces native HTML5 drag-and-drop, which has no touch support in
 * any mobile browser. `ids` should be the current, live-ordered id list;
 * `onReorder` receives the full reordered id list on drop, same contract
 * the native-DnD version used.
 */
export function useDragReorder(ids: string[], onReorder: (ordered: string[]) => void) {
  const [state, setState] = useState<DragReorderState>({
    draggingId: null,
    dragOverId: null,
  });
  const itemRefs = useRef(new Map<string, HTMLElement>());
  const idsRef = useRef(ids);
  const onReorderRef = useRef(onReorder);
  // Kept in sync via an effect rather than a plain assignment during render
  // — the pointer event handlers below run entirely outside React's render
  // cycle (window listeners added on pointerdown), so they always want the
  // latest ids/onReorder without needing to be re-created every render.
  useEffect(() => {
    idsRef.current = ids;
    onReorderRef.current = onReorder;
  });

  function registerItem(id: string) {
    return (el: HTMLElement | null) => {
      if (el) itemRefs.current.set(id, el);
      else itemRefs.current.delete(id);
    };
  }

  function findOverId(clientX: number, clientY: number): string | null {
    for (const [id, el] of itemRefs.current) {
      const rect = el.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
        return id;
      }
    }
    return null;
  }

  function handlePointerDown(id: string) {
    return (e: React.PointerEvent) => {
      if (e.button !== 0) return; // primary button/contact only
      const startX = e.clientX;
      const startY = e.clientY;
      const target = e.currentTarget;
      const pointerId = e.pointerId;
      let dragging = false;

      function handleMove(moveEvent: PointerEvent) {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        if (!dragging) {
          if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
          dragging = true;
          try {
            target.setPointerCapture(pointerId);
          } catch {
            // Capture can fail if the pointer already ended — harmless,
            // window-level listeners below still track the gesture fine.
          }
          setState((s) => ({ ...s, draggingId: id }));
        }
        moveEvent.preventDefault();
        const overId = findOverId(moveEvent.clientX, moveEvent.clientY);
        setState((s) => (s.dragOverId === overId ? s : { ...s, dragOverId: overId }));
      }

      function handleUp() {
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleUp);
        window.removeEventListener("pointercancel", handleUp);
        if (dragging) {
          // Read the drop target out via a plain variable rather than
          // calling onReorder from inside the setState updater — updaters
          // must stay pure, and onReorder ultimately calls another
          // component's setState synchronously, which triggered React's
          // "Cannot update a component while rendering a different
          // component" warning (same fix as usePullToRefresh).
          let droppedOverId: string | null = null;
          setState((s) => {
            droppedOverId = s.dragOverId;
            return { draggingId: null, dragOverId: null };
          });
          if (droppedOverId && droppedOverId !== id) {
            const currentIds = idsRef.current;
            const withoutDragged = currentIds.filter((x) => x !== id);
            const targetIndexInFiltered = withoutDragged.indexOf(droppedOverId);
            // Dropping "onto" an item that's already adjacent in the
            // direction of travel would otherwise be a no-op (e.g. dragging
            // item 0 onto item 1 and inserting *before* item 1 just puts it
            // back where it started) — when the dragged item started above
            // the target, insert after it instead, so a drop always actually
            // moves something.
            const draggedFromAbove = currentIds.indexOf(id) < currentIds.indexOf(droppedOverId);
            const insertIndex = draggedFromAbove ? targetIndexInFiltered + 1 : targetIndexInFiltered;
            const reordered = [
              ...withoutDragged.slice(0, insertIndex),
              id,
              ...withoutDragged.slice(insertIndex),
            ];
            onReorderRef.current(reordered);
          }
        }
      }

      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleUp);
      window.addEventListener("pointercancel", handleUp);
    };
  }

  return {
    draggingId: state.draggingId,
    dragOverId: state.dragOverId,
    registerItem,
    /** Spread onto the drag handle element. touchAction "none" stops the
     *  browser's native scroll/pan gesture from competing with the drag for
     *  the touch that started on the handle; the callout/user-select
     *  suppressions stop a press held just under the drag threshold from
     *  popping iOS's text-selection/copy callout instead of starting a
     *  drag. */
    dragHandleProps: (id: string) => ({
      onPointerDown: handlePointerDown(id),
      style: {
        touchAction: "none" as const,
        WebkitTouchCallout: "none" as const,
        WebkitUserSelect: "none" as const,
        userSelect: "none" as const,
      },
    }),
  };
}
