"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  clearBackgroundImage,
  loadBackgroundImage,
  saveBackgroundImage,
} from "@/lib/backgroundImageStore";
import { getDominantColor } from "@/lib/dominantColor";
import { logDebug } from "@/lib/debugLog";

const BG_IMAGE_EVENT = "credit-news-analyst-bg-image-change";
// The photo renders heavily blurred behind the app (see
// BackgroundImageLayer) so a modest resolution looks identical to a full-res
// one once blurred, while keeping the stored data URL comfortably inside
// localStorage's quota alongside everything else the app keeps there.
const MAX_DIMENSION = 1280;
const MAX_STORED_CHARS = 900 * 1024;

function subscribe(callback: () => void) {
  window.addEventListener(BG_IMAGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(BG_IMAGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getServerSnapshot(): string | null {
  return null;
}

export function useBackgroundImage() {
  const url = useSyncExternalStore(subscribe, loadBackgroundImage, getServerSnapshot);

  // Resizes the upload, extracts its dominant color from the same decoded
  // canvas, then re-encodes it as a JPEG data URL — stepping quality down
  // if needed rather than rejecting outright, since most photos fit well
  // before quality gets bad enough to matter under the blur this renders
  // with.
  const setImage = useCallback(async (file: File) => {
    try {
      if (!file.type.startsWith("image/")) {
        throw new Error("Please choose an image file.");
      }
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
      const w = Math.max(1, Math.round(bitmap.width * scale));
      const h = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Your browser doesn't support image processing.");
      ctx.drawImage(bitmap, 0, 0, w, h);
      bitmap.close();

      const dominantColor = getDominantColor(ctx.getImageData(0, 0, w, h));

      let quality = 0.8;
      let dataUrl = canvas.toDataURL("image/jpeg", quality);
      while (dataUrl.length > MAX_STORED_CHARS && quality > 0.4) {
        quality -= 0.15;
        dataUrl = canvas.toDataURL("image/jpeg", quality);
      }
      if (dataUrl.length > MAX_STORED_CHARS) {
        throw new Error(
          `That image is too large even after compressing (${Math.round(dataUrl.length / 1024)}KB) — try a smaller photo.`
        );
      }

      saveBackgroundImage(dataUrl);
      window.dispatchEvent(new Event(BG_IMAGE_EVENT));
      return { dominantColor };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logDebug(`Background image upload failed: ${message}`);
      throw err instanceof Error ? err : new Error(message);
    }
  }, []);

  const clearImage = useCallback(() => {
    clearBackgroundImage();
    window.dispatchEvent(new Event(BG_IMAGE_EVENT));
  }, []);

  return { url, setImage, clearImage };
}
