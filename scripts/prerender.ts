// Post-build step: snapshots the rendered app with Playwright and injects the HTML into dist/index.html
// so crawlers see roster, schedule and staff text. Fails soft: on any error dist/ is left untouched.
import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { chromium } from "playwright";

const DIST = new URL("../dist/", import.meta.url).pathname;
const TYPES: Record<string, string> = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
};
const MARKER = "<!-- prerender -->";

async function main() {
  const indexPath = join(DIST, "index.html");
  const original = await readFile(indexPath, "utf8");
  if (original.includes(MARKER)) return console.log("prerender: already done");

  const server = createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent((req.url ?? "/").split("?")[0]);
      const file = normalize(join(DIST, pathname.endsWith("/") ? "index.html" : pathname));
      if (!file.startsWith(DIST)) throw new Error("outside dist");
      res.setHeader("Content-Type", TYPES[extname(file)] ?? "application/octet-stream");
      res.end(await readFile(file));
    } catch {
      res.statusCode = 404;
      res.end("Not found");
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as { port: number };

  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage();
    // Block analytics/network noise; the app falls back to bundled data if data/team.json is missing.
    await page.route(/googletagmanager|google-analytics/, (route) => route.abort());
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
    await page.waitForSelector(".tab-panel *");

    const panels: string[] = [];
    const tabs = page.locator('[role="tab"]');
    const count = await tabs.count();
    for (let i = 0; i < count; i++) {
      await tabs.nth(i).click();
      await page.waitForTimeout(150);
      panels.push(await page.locator(".tab-panel").innerHTML());
    }
    // Restore the default tab and capture the full initial DOM.
    await tabs.nth(0).click();
    await page.waitForTimeout(150);
    const root = await page.locator("#root").innerHTML();

    // Skip form-bearing panels (recruiting) in the hidden copy; keep text content only.
    const extra = panels.slice(1).filter((html) => !/<form/i.test(html)).join("\n");
    const html = original
      .replace('<div id="root"></div>', `<div id="root">${root}</div>\n    ${MARKER}<div class="sr-only" aria-hidden="true" data-prerender>${extra}</div>`);
    if (html === original) throw new Error("could not locate #root in dist/index.html");
    await writeFile(indexPath, html);
    console.log(`prerender: injected ${root.length + extra.length} bytes of HTML`);
  } finally {
    await browser?.close();
    server.close();
  }
}

main().catch((error) => {
  console.warn("prerender: skipped —", error instanceof Error ? error.message : error);
});
