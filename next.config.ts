import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // playwright-core (used to resolve Google News links — see
  // googleNewsResolve.ts) loads a handful of its own JSON data files
  // (browsers.json among them) via dynamic path construction at runtime,
  // not a static require()/import Next's file tracer can see statically —
  // so Vercel's deployed function was missing them entirely and crashing
  // on first use with "Cannot find module '.../playwright-core/browsers.json'".
  // Force the whole package into the trace for the two routes that use it,
  // rather than chasing individual missing files one deploy at a time.
  outputFileTracingIncludes: {
    "/api/resolve-news-link": ["./node_modules/playwright-core/**/*"],
    "/api/article-content": ["./node_modules/playwright-core/**/*"],
  },
};

export default nextConfig;
