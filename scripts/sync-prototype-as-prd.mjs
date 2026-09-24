import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(scriptDir, "..");
const config = JSON.parse(readFileSync(join(appRoot, "prototype-framework.json"), "utf8"));
const dependencyRoot = resolve(appRoot, "node_modules", config.dependency);

if (!existsSync(dependencyRoot)) {
  throw new Error(`Framework dependency is not installed: ${config.dependency}. Run "pnpm install" first.`);
}

const protectedPaths = new Set(config.protectedProjectPaths);

for (const relativePath of config.frameworkPaths) {
  if ([...protectedPaths].some(path => relativePath === path || relativePath.startsWith(`${path}/`))) {
    throw new Error(`Invalid framework configuration: ${relativePath} overlaps a protected project path.`);
  }

  const source = join(dependencyRoot, relativePath);
  const target = join(appRoot, relativePath);

  if (!existsSync(source)) {
    throw new Error(`Framework file is missing from ${config.dependency}: ${relativePath}`);
  }

  rmSync(target, { recursive: true, force: true });
  mkdirSync(dirname(target), { recursive: true });
  cpSync(source, target, { recursive: true });
}

console.log(`Synced Prototype as PRD from ${config.dependency}.`);
console.log(`Source: ${relative(appRoot, dependencyRoot)}`);
console.log(`Updated ${config.frameworkPaths.length} framework paths.`);
console.log("Project-specific paths were not touched.");
