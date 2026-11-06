import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const failures = [];
const notes = [];

function pass(message) {
  console.log(`PASS  ${message}`);
}

function fail(message) {
  failures.push(message);
  console.error(`FAIL  ${message}`);
}

function skip(message) {
  notes.push(message);
  console.log(`SKIP  ${message}`);
}

function isTracked(path) {
  try {
    execFileSync("git", ["ls-files", "--error-unmatch", path], {
      cwd: ROOT,
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

function isIgnored(path) {
  try {
    execFileSync("git", ["check-ignore", "-q", path], { cwd: ROOT, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function walkFiles(directory, extensions, results = []) {
  let entries;
  try {
    entries = readdirSync(directory, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      walkFiles(path, extensions, results);
      continue;
    }
    if (extensions.has(entry.name.slice(entry.name.lastIndexOf(".")))) results.push(path);
  }

  return results;
}

function checkEnvFiles() {
  if (isTracked(".env.local")) fail(".env.local is tracked by git.");
  else pass(".env.local is not tracked by git.");

  if (!isIgnored(".env.local")) fail(".env.local is not covered by .gitignore.");
  else pass(".env.local is git-ignored.");

  try {
    const example = readFileSync(join(ROOT, ".env.example"), "utf8");
    const serviceKey = /^SUPABASE_SERVICE_ROLE_KEY=(.*)$/m.exec(example)?.[1]?.trim() ?? "";
    const anonKey = /^NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)$/m.exec(example)?.[1]?.trim() ?? "";
    const resendKey = /^RESEND_API_KEY=(.*)$/m.exec(example)?.[1]?.trim() ?? "";

    if (!serviceKey || serviceKey.startsWith("your-")) pass(".env.example has no real service role key.");
    else fail(".env.example appears to contain a real service role key.");

    if (!anonKey || anonKey.startsWith("your-")) pass(".env.example has no real anon key.");
    else fail(".env.example appears to contain a real anon key.");

    if (!resendKey) pass(".env.example has no real Resend key.");
    else fail(".env.example appears to contain a real Resend key.");
  } catch {
    skip(".env.example not found.");
  }
}

function checkClientBundle() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key || key.length < 20) {
    skip("SUPABASE_SERVICE_ROLE_KEY is not set; bundle secret scan skipped.");
    return;
  }

  const files = walkFiles(
    join(ROOT, ".next", "static"),
    new Set([".js", ".mjs", ".css", ".map", ".json"]),
  ).concat(walkFiles(join(ROOT, "public"), new Set([".js", ".mjs", ".map", ".json"])));

  if (files.length === 0) {
    skip(".next/static is empty; run a production build before this check.");
    return;
  }

  const leaked = files.filter((file) => readFileSync(file, "utf8").includes(key));
  if (leaked.length > 0) {
    // Print paths only, never the key or surrounding content.
    fail(`Service role key found in client files: ${leaked.map((file) => relative(ROOT, file)).join(", ")}`);
    return;
  }

  pass(`Service role key not present in ${files.length} client files.`);
}

async function request(url, key, path) {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  let rows = null;
  try {
    const body = await response.json();
    if (Array.isArray(body)) rows = body;
  } catch {
    // Non-JSON responses (401/403) are handled by status.
  }
  return { status: response.status, rows };
}

async function checkRls() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) {
    skip("Supabase public env is not set; RLS probe skipped.");
    return;
  }

  const privateTables = [
    "orders",
    "order_items",
    "order_events",
    "profiles",
    "contact_messages",
    "subscribers",
    "discount_codes",
    "discount_redemptions",
    "admin_settings",
    "customer_summaries",
  ];

  for (const table of privateTables) {
    try {
      const { status, rows } = await request(url, key, `${table}?select=*&limit=1`);
      if (status === 200 && rows && rows.length > 0) {
        fail(`Anon can read rows from ${table}.`);
      } else if (status >= 500) {
        fail(`${table} returned ${status} to anon; check the table and policies.`);
      } else {
        pass(`Anon cannot read ${table} (status ${status}, ${rows?.length ?? 0} rows).`);
      }
    } catch (error) {
      fail(`Could not probe ${table}: ${error instanceof Error ? error.message : error}`);
    }
  }

  for (const table of ["products", "collections", "settings"]) {
    try {
      const { status } = await request(url, key, `${table}?select=id&limit=1`);
      if (status === 200) pass(`Anon can read public ${table}.`);
      else fail(`Public ${table} returned ${status} to anon.`);
    } catch (error) {
      fail(`Could not probe public ${table}: ${error instanceof Error ? error.message : error}`);
    }
  }
}

console.log("Security checks\n");
checkEnvFiles();
checkClientBundle();
await checkRls();

if (notes.length > 0) {
  console.log("\nSkipped:");
  for (const note of notes) console.log(`  ${note}`);
}

if (failures.length > 0) {
  console.error(`\n${failures.length} security check(s) failed.`);
  process.exit(1);
}

console.log("\nAll security checks passed.");
