import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(__dirname, '../public');

describe('robots.txt', () => {
  const filePath = resolve(ROOT, 'robots.txt');
  let content;

  it('file exists', () => {
    expect(existsSync(filePath)).toBe(true);
    content = readFileSync(filePath, 'utf-8');
  });

  it('allows all user agents', () => {
    content = readFileSync(filePath, 'utf-8');
    expect(content).toContain('User-agent: *');
  });

  it('has Allow: / directive', () => {
    content = readFileSync(filePath, 'utf-8');
    expect(content).toContain('Allow: /');
  });

  it('sitemap directive points to https://radical.codes/sitemap.xml', () => {
    content = readFileSync(filePath, 'utf-8');
    expect(content).toContain('Sitemap: https://radical.codes/sitemap.xml');
  });

  it('does not disallow any paths', () => {
    content = readFileSync(filePath, 'utf-8');
    expect(content).not.toMatch(/Disallow:\s*\//);
  });
});

describe('site.webmanifest', () => {
  const filePath = resolve(ROOT, 'site.webmanifest');
  let manifest;

  it('file exists and is valid JSON', () => {
    expect(existsSync(filePath)).toBe(true);
    const raw = readFileSync(filePath, 'utf-8');
    expect(() => { manifest = JSON.parse(raw); }).not.toThrow();
  });

  it('name is "radical.codes"', () => {
    manifest = JSON.parse(readFileSync(filePath, 'utf-8'));
    expect(manifest.name).toBe('radical.codes');
  });

  it('short_name is "radical.codes"', () => {
    manifest = JSON.parse(readFileSync(filePath, 'utf-8'));
    expect(manifest.short_name).toBe('radical.codes');
  });

  it('start_url is "/"', () => {
    manifest = JSON.parse(readFileSync(filePath, 'utf-8'));
    expect(manifest.start_url).toBe('/');
  });

  it('display is "minimal-ui"', () => {
    manifest = JSON.parse(readFileSync(filePath, 'utf-8'));
    expect(manifest.display).toBe('minimal-ui');
  });

  it('background_color is "#f8f8f4"', () => {
    manifest = JSON.parse(readFileSync(filePath, 'utf-8'));
    expect(manifest.background_color).toBe('#f8f8f4');
  });

  it('theme_color is "#000000"', () => {
    manifest = JSON.parse(readFileSync(filePath, 'utf-8'));
    expect(manifest.theme_color).toBe('#000000');
  });

  it('description is present and non-empty', () => {
    manifest = JSON.parse(readFileSync(filePath, 'utf-8'));
    expect(typeof manifest.description).toBe('string');
    expect(manifest.description.length).toBeGreaterThan(0);
  });

  it('has all required PWA fields', () => {
    manifest = JSON.parse(readFileSync(filePath, 'utf-8'));
    const required = ['name', 'short_name', 'start_url', 'display'];
    required.forEach(field => {
      expect(manifest).toHaveProperty(field);
    });
  });
});

describe('sitemap.xml', () => {
  const filePath = resolve(ROOT, 'sitemap.xml');
  let content;

  it('file exists', () => {
    expect(existsSync(filePath)).toBe(true);
    content = readFileSync(filePath, 'utf-8');
  });

  it('starts with XML declaration', () => {
    content = readFileSync(filePath, 'utf-8');
    expect(content.trimStart()).toMatch(/^<\?xml/);
  });

  it('uses the sitemaps.org 0.9 namespace', () => {
    content = readFileSync(filePath, 'utf-8');
    expect(content).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  });

  it('contains the canonical URL https://radical.codes/', () => {
    content = readFileSync(filePath, 'utf-8');
    expect(content).toContain('<loc>https://radical.codes/</loc>');
  });

  it('has a lastmod date', () => {
    content = readFileSync(filePath, 'utf-8');
    expect(content).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
  });

  it('lastmod date is 2026-06-16', () => {
    content = readFileSync(filePath, 'utf-8');
    expect(content).toContain('<lastmod>2026-06-16</lastmod>');
  });

  it('changefreq is "weekly"', () => {
    content = readFileSync(filePath, 'utf-8');
    expect(content).toContain('<changefreq>weekly</changefreq>');
  });

  it('priority is "1.0"', () => {
    content = readFileSync(filePath, 'utf-8');
    expect(content).toContain('<priority>1.0</priority>');
  });

  it('URL is contained in a <url> element within <urlset>', () => {
    content = readFileSync(filePath, 'utf-8');
    expect(content).toContain('<urlset');
    expect(content).toContain('<url>');
    expect(content).toContain('</url>');
    expect(content).toContain('</urlset>');
  });

  it('contains exactly one <url> entry', () => {
    content = readFileSync(filePath, 'utf-8');
    const matches = content.match(/<url>/g);
    expect(matches).toHaveLength(1);
  });
});

describe('og-image.svg', () => {
  const filePath = resolve(ROOT, 'og-image.svg');
  let content;

  it('file exists', () => {
    expect(existsSync(filePath)).toBe(true);
    content = readFileSync(filePath, 'utf-8');
  });

  it('is a valid SVG element', () => {
    content = readFileSync(filePath, 'utf-8');
    expect(content.trimStart()).toMatch(/^<svg/);
  });

  it('width is 1200', () => {
    content = readFileSync(filePath, 'utf-8');
    expect(content).toContain('width="1200"');
  });

  it('height is 630', () => {
    content = readFileSync(filePath, 'utf-8');
    expect(content).toContain('height="630"');
  });

  it('has role="img" for accessibility', () => {
    content = readFileSync(filePath, 'utf-8');
    expect(content).toContain('role="img"');
  });

  it('has aria-labelledby="title desc"', () => {
    content = readFileSync(filePath, 'utf-8');
    expect(content).toContain('aria-labelledby="title desc"');
  });

  it('has <title> element for accessibility', () => {
    content = readFileSync(filePath, 'utf-8');
    expect(content).toContain('<title');
    expect(content).toContain('Ryan Gonyon');
  });

  it('has <desc> element for accessibility', () => {
    content = readFileSync(filePath, 'utf-8');
    expect(content).toContain('<desc');
  });

  it('uses https://www.w3.org/2000/svg namespace', () => {
    content = readFileSync(filePath, 'utf-8');
    expect(content).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it('headline text "Make fragile" is present', () => {
    content = readFileSync(filePath, 'utf-8');
    expect(content).toContain('Make fragile');
  });

  it('headline text "software dependable." is present', () => {
    content = readFileSync(filePath, 'utf-8');
    expect(content).toContain('software dependable.');
  });

  it('brand URL "radical.codes" appears in the image', () => {
    content = readFileSync(filePath, 'utf-8');
    expect(content).toContain('radical.codes');
  });

  it('viewBox matches width and height (0 0 1200 630)', () => {
    content = readFileSync(filePath, 'utf-8');
    expect(content).toContain('viewBox="0 0 1200 630"');
  });
});

describe('og-image.png', () => {
  const filePath = resolve(ROOT, 'og-image.png');

  it('file exists', () => {
    expect(existsSync(filePath)).toBe(true);
  });

  it('file is non-empty', () => {
    const stats = readFileSync(filePath);
    expect(stats.length).toBeGreaterThan(0);
  });

  it('has PNG magic bytes (\\x89PNG)', () => {
    const buf = readFileSync(filePath);
    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    expect(buf[0]).toBe(0x89);
    expect(buf[1]).toBe(0x50); // 'P'
    expect(buf[2]).toBe(0x4e); // 'N'
    expect(buf[3]).toBe(0x47); // 'G'
  });
});
