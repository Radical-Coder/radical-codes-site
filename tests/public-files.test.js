import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = resolve(ROOT, "public");

/** Read a public file as UTF-8 text for static discovery-file assertions. */
function readPublicFile(path) {
  return readFileSync(resolve(PUBLIC, path), "utf8");
}

describe("public discovery files", () => {
  it("serves robots.txt with a sitemap directive", () => {
    const path = resolve(PUBLIC, "robots.txt");
    expect(existsSync(path)).toBe(true);
    const content = readPublicFile("robots.txt");
    expect(content).toContain("User-agent: *");
    expect(content).toContain("Allow: /");
    expect(content).toContain("Sitemap: https://radical.codes/sitemap.xml");
  });

  it("lists the public site routes in the sitemap", () => {
    const path = resolve(PUBLIC, "sitemap.xml");
    expect(existsSync(path)).toBe(true);
    const content = readPublicFile("sitemap.xml");
    expect(content).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(content).toContain("<loc>https://radical.codes/</loc>");
    expect(content).toContain("<loc>https://radical.codes/ai-app-rescue/</loc>");
    expect(content).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
  });

  it("serves a dark-theme web manifest", () => {
    const path = resolve(PUBLIC, "site.webmanifest");
    expect(existsSync(path)).toBe(true);
    const manifest = JSON.parse(readPublicFile("site.webmanifest"));
    expect(manifest.name).toBe("radical.codes");
    expect(manifest.short_name).toBe("radical.codes");
    expect(manifest.start_url).toBe("/");
    expect(manifest.display).toBe("standalone");
    expect(manifest.theme_color).toBe("#080a0e");
    expect(manifest.background_color).toBe("#080a0e");
  });
});
