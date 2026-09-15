// Approximates a photo's single most-common color so it can seed the same
// brand-* ramp generator custom theming already uses (see colorRamp.ts) —
// the "extract a palette from an image" trick behind things like Spotify's
// album-art-tinted player.
//
// Pixels are quantized into coarse RGB buckets (raw 0-255 values would
// almost never repeat exactly) and the winning bucket is chosen by
// frequency, nudged toward more saturated buckets so a photo dominated by
// sky/wall/skin tones doesn't just reduce to a muddy gray.
export function getDominantColor(imageData: ImageData): string {
  const { data, width, height } = imageData;
  const BUCKET = 24;
  const counts = new Map<string, { count: number; r: number; g: number; b: number }>();

  const totalPixels = width * height;
  // Sampling a subset keeps this fast even for a full-resolution photo —
  // stride is in pixels-of-4-bytes, so this walks every Nth pixel.
  const pixelStride = Math.max(1, Math.floor(totalPixels / 20000));
  const stride = pixelStride * 4;

  for (let i = 0; i < data.length; i += stride) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 200) continue;
    const key = `${Math.round(r / BUCKET)}-${Math.round(g / BUCKET)}-${Math.round(b / BUCKET)}`;
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, { count: 1, r, g, b });
    }
  }

  let best: { count: number; r: number; g: number; b: number } | null = null;
  let bestScore = -1;
  for (const bucket of counts.values()) {
    const max = Math.max(bucket.r, bucket.g, bucket.b);
    const min = Math.min(bucket.r, bucket.g, bucket.b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    const score = bucket.count * (1 + saturation);
    if (score > bestScore) {
      bestScore = score;
      best = bucket;
    }
  }

  if (!best) return "#7e7160";
  const toHex = (c: number) => c.toString(16).padStart(2, "0");
  return `#${toHex(best.r)}${toHex(best.g)}${toHex(best.b)}`;
}
