import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const baseline = "e0ef2ed996bab08110fae9c45b6938eb53aaab24";
const files = execFileSync("git", ["ls-tree", "-r", "--name-only", baseline, "src/ui"], {
  encoding: "utf8",
})
  .trim()
  .split("\n");
function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}
const actual = walk("src/ui").sort();
if (JSON.stringify(actual) !== JSON.stringify([...files].sort())) {
  throw new Error("UI tree paths differ (including deleted or renamed files)");
}
for (const file of files) {
  let expected = execFileSync("git", ["show", `${baseline}:${file}`]);
  if (file === "src/ui/markdown/input-group.md") {
    expected = Buffer.from(expected.toString().replace(/sk_live_[A-Za-z0-9]+/g, "example-api-key"));
  }
  if (!readFileSync(file).equals(expected)) throw new Error(`UI mirror drift: ${file}`);
}
console.log(`${files.length} files match ${baseline}, with only the approved example substitution`);
