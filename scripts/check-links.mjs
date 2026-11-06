const BASE = (process.env.CHECK_LINKS_BASE ?? "http://localhost:3000").replace(/\/$/, "");
const SKIP_PREFIXES = ["/admin", "/api", "/order/", "/_next"];
const SKIP_FILES = /\.(?:png|jpe?g|webp|avif|svg|ico|css|js|mjs|xml|txt|json|woff2?)$/i;
const MAX_PAGES = Number(process.env.CHECK_LINKS_MAX ?? 250);

function shouldSkip(url) {
  if (SKIP_FILES.test(url.pathname)) return true;
  return SKIP_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
}

function internalUrl(raw, from) {
  try {
    const url = new URL(raw, from);
    if (!/^https?:$/.test(url.protocol)) return null;
    if (url.origin !== new URL(BASE).origin) return null;
    url.hash = "";
    return shouldSkip(url) ? null : url;
  } catch {
    return null;
  }
}

async function getText(url) {
  const response = await fetch(url, { redirect: "follow" });
  return { response, body: response.ok ? await response.text() : "" };
}

async function main() {
  let sitemap;
  try {
    sitemap = await getText(`${BASE}/sitemap.xml`);
  } catch (error) {
    console.error(`Could not reach ${BASE}. Start the site with "npm run dev" first.`);
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
    return;
  }

  if (!sitemap.response.ok) {
    console.error(`Sitemap returned ${sitemap.response.status}.`);
    process.exitCode = 1;
    return;
  }

  const seeds = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => internalUrl(match[1], BASE))
    .filter(Boolean);

  if (seeds.length === 0) {
    console.error("No URLs found in sitemap.");
    process.exitCode = 1;
    return;
  }

  const queue = [...seeds];
  const seen = new Map();
  const failures = [];

  while (queue.length > 0 && seen.size < MAX_PAGES) {
    const batch = queue.splice(0, 8);
    await Promise.all(
      batch.map(async (url) => {
        // Filter links generate endless query permutations; one check per path is enough.
        const key = url.pathname;
        if (seen.has(key)) return;
        seen.set(key, true);

        try {
          const { response, body } = await getText(url);
          const status = response.status;

          if (status >= 400) {
            failures.push(`${status} ${key}`);
            return;
          }

          if (status >= 300) {
            failures.push(`${status} (redirect) ${key}`);
            return;
          }

          if (!/html/i.test(response.headers.get("content-type") ?? "")) return;

          for (const match of body.matchAll(/href="([^"]+)"/g)) {
            const next = internalUrl(match[1].replace(/&amp;/g, "&"), url);
            if (!next) continue;
            if (!seen.has(next.pathname)) queue.push(next);
          }
        } catch (error) {
          failures.push(`error ${key}: ${error instanceof Error ? error.message : error}`);
        }
      }),
    );
  }

  console.log(`Checked ${seen.size} internal URLs starting from ${seeds.length} sitemap entries.`);

  if (queue.length > 0) {
    console.log(`Stopped at the ${MAX_PAGES} page limit; ${queue.length} links were not checked.`);
  }

  if (failures.length > 0) {
    console.error("\nBroken internal links:");
    for (const failure of failures) console.error(`  ${failure}`);
    process.exitCode = 1;
    return;
  }

  console.log("No broken internal links found.");
}

await main();
