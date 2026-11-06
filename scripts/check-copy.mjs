import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const TARGETS = ["src", "supabase", "docs", "scripts"];
const EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".mdx",
  ".sql",
  ".css",
  ".html",
  ".txt",
  ".yml",
  ".yaml",
  ".xml",
  ".svg",
]);
const IGNORED = new Set(["node_modules", ".next", ".git", ".review"]);

const findings = [];

function walk(directory) {
  let entries;
  try {
    entries = readdirSync(directory, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (IGNORED.has(entry.name)) continue;
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      walk(path);
      continue;
    }

    const extension = entry.name.slice(entry.name.lastIndexOf("."));
    if (!EXTENSIONS.has(extension)) continue;

    const content = readFileSync(path, "utf8");
    const lines = content.split(/\r?\n/);

    lines.forEach((line, index) => {
      if (extension === ".sql" && line.trimStart().startsWith("--")) return;
      if (!line.includes("\u2014")) return;
      findings.push(`${relative(ROOT, path)}:${index + 1}: ${line.trim().slice(0, 160)}`);
    });
  }
}

for (const target of TARGETS) {
  const path = join(ROOT, target);
  try {
    if (statSync(path).isDirectory()) walk(path);
  } catch {
    // Optional target such as docs/ does not exist yet.
  }
}

if (findings.length > 0) {
  console.error(`\ncheck:copy found ${findings.length} em dash(es):\n`);
  for (const finding of findings) console.error(`  ${finding}`);
  console.error("\nReplace them with commas, full stops or the word and.\n");
  process.exit(1);
}

console.log("check:copy clean. No em dashes found.");
