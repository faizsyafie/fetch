"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearBackgroundImage,
  loadBackgroundImage,
  saveBackgroundImage,
} from "@/lib/backgroundImageStore";
import { getDominantColor } from "@/lib/dominantColor";

const BG_IMAGE_EVENT = "credit-news-analyst-bg-image-change";
// Uploaded photos are downscaled to this longest-edge size before storing —
// there's no reason to keep a 12MB phone photo at full resolution for a CSS
// background. Re-encoded as JPEG at 0.85 quality; if it's still over this
// after that, the photo is rejected rather than silently blowing past
// IndexedDB's practical size comfort zone.
const MAX_DIMENSION = 1920;
const MAX_STORED_BYTES = 3 * 1024 * 1024;

export function useBackgroundImage() {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const urlRef = useRef<string | null>(null);

  const reload = useCallback(() => {
    loadBackgroundImage()
      .then((blob) => {
        if (urlRef.current) {
          URL.revokeObjectURL(urlRef.current);
          urlRef.current = null;
        }
        if (blob) {
          const next = URL.createObjectURL(blob);
          urlRef.current = next;
          setUrl(next);
        } else {
          setUrl(null);
        }
      })
      .catch(() => setUrl(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
    window.addEventListener(BG_IMAGE_EVENT, reload);
    return () => {
      window.removeEventListener(BG_IMAGE_EVENT, reload);
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [reload]);

  // Resizes + re-encodes the upload and extracts its dominant color from
  // the same decoded canvas in one pass, then persists the resized blob.
  const setImage = useCallback(async (file: File) => {
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

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Failed to process the image."))),
        "image/jpeg",
        0.85
      );
    });
    if (blob.size > MAX_STORED_BYTES) {
      throw new Error("That image is too large even after resizing — try a smaller photo.");
    }

    await saveBackgroundImage(blob);
    window.dispatchEvent(new Event(BG_IMAGE_EVENT));
    return { dominantColor };
  }, []);

  const clearImage = useCallback(async () => {
    await clearBackgroundImage();
    window.dispatchEvent(new Event(BG_IMAGE_EVENT));
  }, []);

  return { url, loading, setImage, clearImage };
}
