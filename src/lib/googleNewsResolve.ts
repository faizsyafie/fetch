// Resolves a Google News wrapper URL (news.google.com/rss/articles/<id> or
// news.google.com/articles/<id>) to its real publisher URL.
//
// This used to try reverse-engineering that resolution as a server-callable
// RPC (Google's internal `batchexecute` endpoint). Captured real browser
// network traffic proved that dead: the real destination URL already
// appears in the *request* payload of the RPC calls Google's JS makes, not
// in any response — meaning the decode happens entirely inside their
// obfuscated client-side bundle, with no network round trip to replicate at
// all. There's no protocol to fix here.
//
// So this runs a real (headless) Chromium instance instead: it's the only
// thing that can execute that JS and observe where it actually navigates.
// Server-only (Node-only playwright-core dependency) — see googleNewsUrl.ts
// for the plain URL-shape check that's safe to import from client code.
import { chromium as playwrightChromium, type Browser } from "playwright-core";
import type { GoogleNewsResolveResult } from "@/lib/googleNewsUrl";

const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const NAV_TIMEOUT_MS = 15_000;
const REDIRECT_WAIT_TIMEOUT_MS = 15_000;

// Set CHROMIUM_EXECUTABLE_PATH for local dev (this sandbox has a real
// Chromium preinstalled at /opt/pw-browsers/chromium) — left unset in
// production, where @sparticuz/chromium supplies a binary + launch args
// built specifically for Vercel/Lambda's restricted serverless environment.
// Imported lazily so a local dev run relying on the env var override never
// needs the (large) package installed to actually resolve, and so the
// package's own binary-extraction cost is only paid when it's genuinely
// needed.
async function launchBrowser(): Promise<Browser> {
  const overridePath = process.env.CHROMIUM_EXECUTABLE_PATH;
  if (overridePath) {
    return playwrightChromium.launch({ executablePath: overridePath, headless: true });
  }
  const sparticuzChromium = (await import("@sparticuz/chromium")).default;
  return playwrightChromium.launch({
    executablePath: await sparticuzChromium.executablePath(),
    args: sparticuzChromium.args,
    headless: true,
  });
}

/** Resolves a Google News wrapper URL to the real publisher URL by actually
 *  loading it in a headless browser and watching where it navigates. */
export async function resolveGoogleNewsUrl(wrapperUrl: string): Promise<GoogleNewsResolveResult> {
  let browser: Browser | null = null;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage({ userAgent: BROWSER_USER_AGENT });

    await page.goto(wrapperUrl, {
      waitUntil: "domcontentloaded",
      timeout: NAV_TIMEOUT_MS,
    });

    // The wrapper page's own JS decodes the article id and navigates away
    // client-side — wait for the URL to actually leave news.google.com
    // rather than for full network idle, since the destination page's own
    // ads/analytics can keep the network busy indefinitely after the real
    // navigation has already happened.
    await page.waitForURL(
      (url) => url.hostname !== "news.google.com",
      { timeout: REDIRECT_WAIT_TIMEOUT_MS }
    );

    const finalUrl = page.url();
    if (!/^https?:\/\//.test(finalUrl) || finalUrl === wrapperUrl) {
      return { ok: false, reason: `didn't navigate away from the wrapper (ended at ${finalUrl})` };
    }
    return { ok: true, url: finalUrl };
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "TimeoutError";
    const detail = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      reason: timedOut ? "headless browser navigation timed out" : `headless browser failed: ${detail}`,
    };
  } finally {
    await browser?.close().catch(() => {});
  }
}
