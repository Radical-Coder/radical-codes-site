import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function readProjectFile(path) {
  return readFileSync(resolve(ROOT, path), "utf8");
}

function getMetaContent(html, attr, value) {
  const first = new RegExp(`<meta\\s[^>]*${attr}=["']${value}["'][^>]*content=["']([^"']+)["']`, "i");
  const second = new RegExp(`<meta\\s[^>]*content=["']([^"']+)["'][^>]*${attr}=["']${value}["']`, "i");
  const match = html.match(first) || html.match(second);
  return match ? match[1] : null;
}

function getLinkHref(html, rel) {
  const first = new RegExp(`<link\\s[^>]*rel=["']${rel}["'][^>]*href=["']([^"']+)["']`, "i");
  const second = new RegExp(`<link\\s[^>]*href=["']([^"']+)["'][^>]*rel=["']${rel}["']`, "i");
  const match = html.match(first) || html.match(second);
  return match ? match[1] : null;
}

function extractJsonLd(html) {
  const match = html.match(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  return match ? JSON.parse(match[1]) : null;
}

function publicAssetExists(absoluteUrl) {
  const url = new URL(absoluteUrl);
  return existsSync(resolve(ROOT, "public", url.pathname.replace(/^\//, "")));
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
});
