import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(currentDir, "..");
const frameworkRoot = resolve(appRoot, "..", "Prototype as PRD");

const frameworkPaths = [
  "index.html",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "postcss.config.js",
  "tailwind.config.js",
  "tsconfig.json",
  "vite.config.ts",
  "src/components",
  "src/hooks",
  "src/layout",
  "src/types",
  "src/utils",
  "src/index.css",
  "src/main.tsx",
  "src/pages/VersionsPage.tsx",
  "src/pages/examples",
  "src/mockData/orders.ts"
];

if (!existsSync(frameworkRoot)) {
  throw new Error(`Prototype as PRD framework directory was not found: ${frameworkRoot}`);
}

for (const relativePath of frameworkPaths) {
  const source = join(frameworkRoot, relativePath);
  const target = join(appRoot, relativePath);
  if (!existsSync(source)) continue;

  rmSync(target, { recursive: true, force: true });
  mkdirSync(dirname(target), { recursive: true });
  cpSync(source, target, { recursive: true });
}

console.log("Prototype-as-PRD framework files synced.");
console.log("Project-specific files are intentionally preserved:");
console.log("- src/pages/admin");
console.log("- src/mockData/adminPrototype.ts");
console.log("- src/mockData/pageTree.ts");
console.log("- src/mockData/prdNotes.ts");
console.log("- src/mockData/versions.ts");
console.log("- src/App.tsx");
