import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8"));

describe("package.json", () => {
  it("keeps the static site scripts explicit", () => {
    expect(pkg.scripts.build).toBe("vite build");
    expect(pkg.scripts.dev).toContain("--host 0.0.0.0");
    expect(pkg.scripts.check).toBe("npm run build && npm audit --audit-level=high");
    expect(pkg.scripts.test).toBe("vitest run");
  });

  it("keeps build tooling out of runtime dependencies", () => {
    expect(pkg.dependencies).toBeUndefined();
    expect(pkg.devDependencies.vite).toMatch(/^\^8\./);
    expect(pkg.devDependencies.vitest).toBeTruthy();
  });

  it("declares the Node range required by the Vite toolchain", () => {
    expect(pkg.engines.node).toBe("^20.19.0 || >=22.12.0");
  });
});
