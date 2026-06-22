import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Read a project file as UTF-8 text for static contract assertions. */
function readProjectFile(path) {
  return readFileSync(resolve(ROOT, path), "utf8");
}

/** Return a meta content value regardless of attribute ordering. */
function getMetaContent(html, attr, value) {
  const first = new RegExp(`<meta\\s[^>]*${attr}=["']${value}["'][^>]*content=["']([^"']+)["']`, "i");
  const second = new RegExp(`<meta\\s[^>]*content=["']([^"']+)["'][^>]*${attr}=["']${value}["']`, "i");
  const match = html.match(first) || html.match(second);
  return match ? match[1] : null;
}

/** Return a link href value regardless of attribute ordering. */
function getLinkHref(html, rel) {
  const first = new RegExp(`<link\\s[^>]*rel=["']${rel}["'][^>]*href=["']([^"']+)["']`, "i");
  const second = new RegExp(`<link\\s[^>]*href=["']([^"']+)["'][^>]*rel=["']${rel}["']`, "i");
  const match = html.match(first) || html.match(second);
  return match ? match[1] : null;
}

/** Parse the first JSON-LD script in a static HTML document. */
function extractJsonLd(html) {
  const match = html.match(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  return match ? JSON.parse(match[1]) : null;
}

/** Check that an absolute site asset URL maps to a committed public file. */
function publicAssetExists(absoluteUrl) {
  const url = new URL(absoluteUrl);
  return existsSync(resolve(ROOT, "public", url.pathname.replace(/^\//, "")));
}

/** Count regex matches without making missing matches crash assertions. */
function countMatches(html, pattern) {
  return html.match(pattern)?.length ?? 0;
}

/** Return a single HTML tag attribute value regardless of attribute ordering. */
function getTagAttribute(tag, name) {
  const pattern = new RegExp(`\\b${name}=["']([^"']*)["']`, "i");
  return tag.match(pattern)?.[1] ?? "";
}

/** Count tags whose class list contains every required class token. */
function countTagsWithClasses(html, tagName, classNames) {
  const tags = html.match(new RegExp(`<${tagName}\\b[^>]*>`, "gi")) ?? [];
  return tags.filter((tag) => {
    const tokens = new Set(getTagAttribute(tag, "class").split(/\s+/).filter(Boolean));
    return classNames.every((className) => tokens.has(className));
  }).length;
}

/** Count external links hardened for a new browsing context. */
function countBlankLinksWithSafeRel(html) {
  const links = html.match(/<a\b[^>]*>/gi) ?? [];
  return links.filter((link) => {
    const relTokens = new Set(getTagAttribute(link, "rel").split(/\s+/).filter(Boolean));
    return (
      getTagAttribute(link, "target") === "_blank" &&
      relTokens.has("noopener") &&
      relTokens.has("noreferrer")
    );
  }).length;
}

/** Assert that a page exposes an order-insensitive skip-navigation target. */
function expectSkipNavigation(html) {
  expect(html).toMatch(
    /<a(?=[^>]*\bclass=["'][^"']*\bskip-link\b[^"']*["'])(?=[^>]*\bhref=["']#main-content["'])[^>]*>/i,
  );
  expect(html).toMatch(
    /<main(?=[^>]*\bid=["']main-content["'])(?=[^>]*\btabindex=["']-1["'])[^>]*>/i,
  );
}

describe("home page metadata", () => {
  const html = readProjectFile("index.html");
  const jsonLd = extractJsonLd(html);

  it("has canonical, manifest, and author metadata", () => {
    expect(getLinkHref(html, "canonical")).toBe("https://radical.codes/");
    expect(getLinkHref(html, "manifest")).toBe("/site.webmanifest");
    expect(getMetaContent(html, "name", "author")).toBe("Ryan Gonyon");
  });

  it("has complete social image metadata for the current proof image", () => {
    const image = getMetaContent(html, "property", "og:image");
    expect(image).toBe("https://radical.codes/assets/service-site/reviewable-workflow-command-center.png");
    expect(getMetaContent(html, "property", "og:image:width")).toBe("1815");
    expect(getMetaContent(html, "property", "og:image:height")).toBe("866");
    expect(getMetaContent(html, "property", "og:image:alt")).toContain("reviewable workflow");
    expect(getMetaContent(html, "name", "twitter:image")).toBe(image);
    expect(publicAssetExists(image)).toBe(true);
  });

  it("describes Ryan, the site, and the current service catalog in JSON-LD", () => {
    expect(jsonLd["@context"]).toBe("https://schema.org");
    const graph = jsonLd["@graph"];
    expect(graph.map((node) => node["@type"])).toEqual([
      "Person",
      "Brand",
      "WebSite",
      "WebPage",
      "OfferCatalog",
    ]);
    const person = graph.find((node) => node["@type"] === "Person");
    const catalog = graph.find((node) => node["@type"] === "OfferCatalog");
    expect(person.name).toBe("Ryan Gonyon");
    expect(person.sameAs).toContain("https://github.com/Radical-Coder");
    expect(catalog.itemListElement.map((offer) => offer.itemOffered.name)).toEqual([
      "Workflow Audit",
      "AI Workflow Automation Sprint",
      "AI App Rescue / Production Readiness",
      "Internal Ops Dashboard MVP",
    ]);
  });

  it("uses plain pressed buttons for workflow controls instead of incomplete tab roles", () => {
    expect(html).not.toContain('role="tablist"');
    expect(html).not.toContain('role="tab"');
    expect(html).not.toContain("aria-selected");
    expect(html).toContain("aria-pressed");
  });

  it("keeps the mobile menu label synchronized with expanded state", () => {
    expect(html).toContain("data-menu-label");
    expect(html).toContain("Close navigation");
    expect(html).toContain("setMenuOpen");
  });

  it("has a keyboard skip link and optimized below-fold proof images", () => {
    expectSkipNavigation(html);
    expect(countMatches(html, /loading="lazy"/g)).toBeGreaterThanOrEqual(5);
    expect(countMatches(html, /decoding="async"/g)).toBeGreaterThanOrEqual(6);
  });

  it("labels package cells for the stacked mobile pricing layout", () => {
    const packageLabelCount = countMatches(html, /data-label="Package"/g);
    expect(packageLabelCount).toBeGreaterThanOrEqual(4);
    expect(countMatches(html, /data-label="Range"/g)).toBe(packageLabelCount);
    expect(countMatches(html, /data-label="Best for"/g)).toBe(packageLabelCount);
    expect(countMatches(html, /data-label="Included"/g)).toBe(packageLabelCount);
  });
});

describe("AI app rescue page metadata", () => {
  const html = readProjectFile("ai-app-rescue/index.html");
  const jsonLd = extractJsonLd(html);

  it("has canonical, manifest, and author metadata", () => {
    expect(getLinkHref(html, "canonical")).toBe("https://radical.codes/ai-app-rescue/");
    expect(getLinkHref(html, "manifest")).toBe("/site.webmanifest");
    expect(getMetaContent(html, "name", "author")).toBe("Ryan Gonyon");
  });

  it("has complete social image metadata for the rescue dashboard", () => {
    const image = getMetaContent(html, "property", "og:image");
    expect(image).toBe("https://radical.codes/assets/ai-app-rescue/ai-app-rescue-dashboard.png");
    expect(getMetaContent(html, "property", "og:image:width")).toBe("1600");
    expect(getMetaContent(html, "property", "og:image:height")).toBe("1200");
    expect(getMetaContent(html, "name", "twitter:image")).toBe(image);
    expect(publicAssetExists(image)).toBe(true);
  });

  it("describes the AI App Rescue service in JSON-LD", () => {
    const graph = jsonLd["@graph"];
    const service = graph.find((node) => node["@type"] === "Service");
    const page = graph.find((node) => node["@type"] === "WebPage");
    expect(service.name).toBe("AI App Rescue Consultation");
    expect(service.provider["@id"]).toBe("https://radical.codes/#ryan-gonyon");
    expect(page.url).toBe("https://radical.codes/ai-app-rescue/");
  });

  it("has skip navigation, optimized proof images, and hardened external links", () => {
    expectSkipNavigation(html);
    expect(html).not.toContain('style="border-top: 2px solid var(--border);"');
    expect(countTagsWithClasses(html, "section", ["section-container", "bordered-section"])).toBe(6);
    expect(countMatches(html, /loading="lazy"/g)).toBeGreaterThanOrEqual(2);
    expect(countBlankLinksWithSafeRel(html)).toBeGreaterThanOrEqual(5);
  });
});

describe("shared stylesheet contracts", () => {
  const css = readProjectFile("styles.css");

  it("keeps the mobile package table header available to assistive technology", () => {
    const mobileBlockMatch = css.match(/@media \(max-width: 880px\) \{[\s\S]*?@media \(max-width: 560px\)/);
    expect(mobileBlockMatch).not.toBeNull();
    const mobileBlock = mobileBlockMatch?.[0] ?? "";
    expect(mobileBlock).toContain(".package-head");
    expect(mobileBlock).toMatch(/\.package-head\s*\{[\s\S]*clip-path:\s*inset\(100%\)/);
    expect(mobileBlock).not.toMatch(/\.package-head\s*\{[\s\S]*display:\s*none/);
  });

  it("shows a distinct menu icon state when mobile navigation is expanded", () => {
    expect(css).toContain('.menu-button[aria-expanded="true"] span:nth-child(2)');
    expect(css).toContain('.menu-button[aria-expanded="true"] span:nth-child(3)');
    expect(css).toContain('.menu-button[aria-expanded="true"] span:nth-child(4)');
  });
});
