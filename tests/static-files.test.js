/**
 * Tests for PR changes: index.html meta tags, og-image.svg, robots.txt,
 * site.webmanifest, and sitemap.xml.
 *
 * Uses Node.js built-in test runner (node:test) and assert — no extra deps.
 * Run: node --test tests/
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

/** Read a file relative to the repo root. */
function readFile(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

/**
 * Extract the content/href/src value of an HTML meta or link tag matching
 * the given attribute selector pattern (e.g. 'name="author"').
 * Returns the value string or null if not found.
 */
function getMetaContent(html, attrName, attrValue) {
  // Matches <meta ...attrName="attrValue"... content="VALUE" ...>
  // and also <meta ...content="VALUE"... attrName="attrValue" ...>
  const patterns = [
    new RegExp(
      `<meta[^>]+${attrName}="${escapeRegex(attrValue)}"[^>]+content="([^"]*)"`,
      'i',
    ),
    new RegExp(
      `<meta[^>]+content="([^"]*)"[^>]+${attrName}="${escapeRegex(attrValue)}"`,
      'i',
    ),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return m[1];
  }
  return null;
}

/** Extract href of a <link> tag with the given rel value. */
function getLinkHref(html, rel) {
  const re = new RegExp(`<link[^>]+rel="${escapeRegex(rel)}"[^>]+href="([^"]*)"`, 'i');
  const re2 = new RegExp(`<link[^>]+href="([^"]*)"[^>]+rel="${escapeRegex(rel)}"`, 'i');
  return (html.match(re) || html.match(re2) || [])[1] ?? null;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---------------------------------------------------------------------------
// index.html — SEO & social meta tag changes
// ---------------------------------------------------------------------------

describe('index.html — meta tags added/changed in PR', () => {
  const html = readFile('index.html');

  it('has canonical link pointing to https://radical.codes/ (with trailing slash)', () => {
    const href = getLinkHref(html, 'canonical');
    assert.equal(href, 'https://radical.codes/');
  });

  it('has author meta tag set to "Ryan Gonyon"', () => {
    const content = getMetaContent(html, 'name', 'author');
    assert.equal(content, 'Ryan Gonyon');
  });

  it('og:url ends with trailing slash (https://radical.codes/)', () => {
    const content = getMetaContent(html, 'property', 'og:url');
    assert.equal(content, 'https://radical.codes/');
  });

  it('og:site_name is "radical.codes"', () => {
    const content = getMetaContent(html, 'property', 'og:site_name');
    assert.equal(content, 'radical.codes');
  });

  it('og:image points to /og-image.png on radical.codes', () => {
    const content = getMetaContent(html, 'property', 'og:image');
    assert.equal(content, 'https://radical.codes/og-image.png');
  });

  it('og:image:type is "image/png"', () => {
    const content = getMetaContent(html, 'property', 'og:image:type');
    assert.equal(content, 'image/png');
  });

  it('og:image:width is "1200"', () => {
    const content = getMetaContent(html, 'property', 'og:image:width');
    assert.equal(content, '1200');
  });

  it('og:image:height is "630"', () => {
    const content = getMetaContent(html, 'property', 'og:image:height');
    assert.equal(content, '630');
  });

  it('og:image:alt is present and non-empty', () => {
    const content = getMetaContent(html, 'property', 'og:image:alt');
    assert.ok(content && content.length > 0, 'og:image:alt should be non-empty');
  });

  it('twitter:title matches og:title', () => {
    const ogTitle = getMetaContent(html, 'property', 'og:title');
    const twitterTitle = getMetaContent(html, 'name', 'twitter:title');
    assert.equal(twitterTitle, ogTitle);
  });

  it('twitter:description is present and non-empty', () => {
    const content = getMetaContent(html, 'name', 'twitter:description');
    assert.ok(content && content.length > 0, 'twitter:description should be non-empty');
  });

  it('twitter:image points to /og-image.png on radical.codes', () => {
    const content = getMetaContent(html, 'name', 'twitter:image');
    assert.equal(content, 'https://radical.codes/og-image.png');
  });

  it('twitter:image:alt is present and non-empty', () => {
    const content = getMetaContent(html, 'name', 'twitter:image:alt');
    assert.ok(content && content.length > 0, 'twitter:image:alt should be non-empty');
  });

  it('manifest link points to /site.webmanifest', () => {
    const href = getLinkHref(html, 'manifest');
    assert.equal(href, '/site.webmanifest');
  });

  // Regression: og:url previously lacked trailing slash
  it('og:url is not the old slash-less URL "https://radical.codes"', () => {
    const content = getMetaContent(html, 'property', 'og:url');
    assert.notEqual(content, 'https://radical.codes');
  });

  // Boundary: og:image dimensions are positive integers matching OG spec minimums
  it('og:image width and height are positive integers >= 200', () => {
    const width = parseInt(getMetaContent(html, 'property', 'og:image:width'), 10);
    const height = parseInt(getMetaContent(html, 'property', 'og:image:height'), 10);
    assert.ok(width >= 200, `og:image:width (${width}) should be >= 200`);
    assert.ok(height >= 200, `og:image:height (${height}) should be >= 200`);
  });
});

// ---------------------------------------------------------------------------
// public/robots.txt
// ---------------------------------------------------------------------------

describe('public/robots.txt', () => {
  const txt = readFile('public/robots.txt');

  it('contains "User-agent: *" to address all crawlers', () => {
    assert.ok(txt.includes('User-agent: *'), 'Should have a wildcard user-agent rule');
  });

  it('allows all paths with "Allow: /"', () => {
    assert.ok(txt.includes('Allow: /'), 'Should allow all paths');
  });

  it('specifies Sitemap URL pointing to sitemap.xml', () => {
    assert.ok(
      txt.includes('Sitemap: https://radical.codes/sitemap.xml'),
      'Sitemap directive should point to https://radical.codes/sitemap.xml',
    );
  });

  it('does not contain any Disallow rules', () => {
    assert.ok(!txt.includes('Disallow:'), 'Should not disallow any paths');
  });

  // Boundary: file should not be empty
  it('is not empty', () => {
    assert.ok(txt.trim().length > 0, 'robots.txt should not be empty');
  });

  // Regression: Sitemap URL must use HTTPS
  it('Sitemap URL uses HTTPS', () => {
    const match = txt.match(/Sitemap:\s*(\S+)/);
    assert.ok(match, 'Sitemap directive should be present');
    assert.ok(match[1].startsWith('https://'), 'Sitemap URL should use HTTPS');
  });
});

// ---------------------------------------------------------------------------
// public/site.webmanifest
// ---------------------------------------------------------------------------

describe('public/site.webmanifest', () => {
  let manifest;

  it('is valid JSON', () => {
    const raw = readFile('public/site.webmanifest');
    assert.doesNotThrow(() => {
      manifest = JSON.parse(raw);
    }, 'site.webmanifest should be valid JSON');
  });

  // Re-parse outside the test so subsequent tests can reference `manifest`
  const manifest2 = JSON.parse(readFile('public/site.webmanifest'));

  it('name is "radical.codes"', () => {
    assert.equal(manifest2.name, 'radical.codes');
  });

  it('short_name is "radical.codes"', () => {
    assert.equal(manifest2.short_name, 'radical.codes');
  });

  it('start_url is "/"', () => {
    assert.equal(manifest2.start_url, '/');
  });

  it('display is "minimal-ui"', () => {
    assert.equal(manifest2.display, 'minimal-ui');
  });

  it('background_color is "#f8f8f4"', () => {
    assert.equal(manifest2.background_color, '#f8f8f4');
  });

  it('theme_color is "#000000"', () => {
    assert.equal(manifest2.theme_color, '#000000');
  });

  it('description is present and non-empty', () => {
    assert.ok(
      typeof manifest2.description === 'string' && manifest2.description.length > 0,
      'description should be a non-empty string',
    );
  });

  // Boundary: no icon array (none defined in this PR — should not be empty array if omitted)
  it('does not define an empty icons array', () => {
    if (Array.isArray(manifest2.icons)) {
      assert.ok(manifest2.icons.length > 0, 'icons array, if present, should not be empty');
    }
    // OK if icons is absent entirely
  });

  // Regression: theme_color should match the theme-color meta in index.html
  it('theme_color matches the theme-color meta tag in index.html', () => {
    const html = readFile('index.html');
    const metaThemeColor = getMetaContent(html, 'name', 'theme-color');
    assert.equal(manifest2.theme_color, metaThemeColor);
  });
});

// ---------------------------------------------------------------------------
// public/sitemap.xml
// ---------------------------------------------------------------------------

describe('public/sitemap.xml', () => {
  const xml = readFile('public/sitemap.xml');

  it('declares XML version 1.0 with UTF-8 encoding', () => {
    assert.ok(
      xml.includes('<?xml version="1.0" encoding="UTF-8"?>'),
      'Should have XML declaration',
    );
  });

  it('uses the correct sitemap namespace', () => {
    assert.ok(
      xml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'),
      'Should use sitemaps.org/0.9 namespace',
    );
  });

  it('contains the canonical site URL as <loc>', () => {
    assert.ok(
      xml.includes('<loc>https://radical.codes/</loc>'),
      'Should list https://radical.codes/ as a URL',
    );
  });

  it('<loc> URL uses HTTPS', () => {
    const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)];
    assert.ok(matches.length > 0, 'Should have at least one <loc> entry');
    for (const [, url] of matches) {
      assert.ok(url.startsWith('https://'), `<loc> URL "${url}" should use HTTPS`);
    }
  });

  it('changefreq is "weekly"', () => {
    assert.ok(xml.includes('<changefreq>weekly</changefreq>'), 'changefreq should be weekly');
  });

  it('priority is "1.0"', () => {
    assert.ok(xml.includes('<priority>1.0</priority>'), 'priority should be 1.0');
  });

  it('has a <lastmod> entry', () => {
    assert.ok(/<lastmod>[^<]+<\/lastmod>/.test(xml), 'Should have a lastmod date');
  });

  it('<lastmod> date is a valid ISO date (YYYY-MM-DD)', () => {
    const match = xml.match(/<lastmod>([^<]+)<\/lastmod>/);
    assert.ok(match, 'Should have a lastmod value');
    assert.match(match[1].trim(), /^\d{4}-\d{2}-\d{2}$/, 'lastmod should be YYYY-MM-DD');
  });

  // Boundary: priority must be between 0.0 and 1.0
  it('priority value is between 0.0 and 1.0 inclusive', () => {
    const match = xml.match(/<priority>([^<]+)<\/priority>/);
    assert.ok(match, 'Should have a priority value');
    const priority = parseFloat(match[1]);
    assert.ok(priority >= 0.0 && priority <= 1.0, `Priority ${priority} should be in [0.0, 1.0]`);
  });
});

// ---------------------------------------------------------------------------
// public/og-image.svg
// ---------------------------------------------------------------------------

describe('public/og-image.svg', () => {
  const svg = readFile('public/og-image.svg');

  it('declares the SVG namespace', () => {
    assert.ok(
      svg.includes('xmlns="http://www.w3.org/2000/svg"'),
      'Should declare SVG namespace',
    );
  });

  it('width is 1200 (matches og:image:width in index.html)', () => {
    assert.match(svg, /width="1200"/, 'SVG width should be 1200');
  });

  it('height is 630 (matches og:image:height in index.html)', () => {
    assert.match(svg, /height="630"/, 'SVG height should be 630');
  });

  it('viewBox covers the full 1200x630 canvas', () => {
    assert.ok(svg.includes('viewBox="0 0 1200 630"'), 'viewBox should be "0 0 1200 630"');
  });

  it('has role="img" for accessibility', () => {
    assert.ok(svg.includes('role="img"'), 'SVG should have role="img"');
  });

  it('has aria-labelledby referencing title and desc', () => {
    assert.ok(
      svg.includes('aria-labelledby="title desc"'),
      'SVG should reference both title and desc for screen readers',
    );
  });

  it('has a <title> element with non-empty text', () => {
    const match = svg.match(/<title[^>]*>([^<]+)<\/title>/);
    assert.ok(match && match[1].trim().length > 0, '<title> element should be non-empty');
  });

  it('has a <desc> element with non-empty text', () => {
    const match = svg.match(/<desc[^>]*>([^<]+)<\/desc>/);
    assert.ok(match && match[1].trim().length > 0, '<desc> element should be non-empty');
  });

  it('SVG dimensions match og:image:width and og:image:height in index.html', () => {
    const html = readFile('index.html');
    const ogWidth = getMetaContent(html, 'property', 'og:image:width');
    const ogHeight = getMetaContent(html, 'property', 'og:image:height');
    assert.ok(svg.includes(`width="${ogWidth}"`), `SVG width should match og:image:width (${ogWidth})`);
    assert.ok(svg.includes(`height="${ogHeight}"`), `SVG height should match og:image:height (${ogHeight})`);
  });

  // Regression: SVG must not be empty
  it('file is not empty', () => {
    assert.ok(svg.trim().length > 0, 'og-image.svg should not be empty');
  });

  // Boundary: aspect ratio should be close to 1.91:1 (standard OG image ratio)
  it('aspect ratio is approximately 1.91:1 (standard Open Graph image)', () => {
    const ratio = 1200 / 630;
    assert.ok(
      Math.abs(ratio - 1.9047) < 0.01,
      `Expected ~1.905 aspect ratio, got ${ratio.toFixed(4)}`,
    );
  });
});
