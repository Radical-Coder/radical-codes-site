import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const html = readFileSync(resolve(__dirname, '../index.html'), 'utf-8');

// Helper to extract a meta tag's content attribute by name or property
function getMetaContent(attr, value) {
  const re = new RegExp(`<meta\\s[^>]*${attr}=["']${value}["'][^>]*content=["']([^"']+)["']`, 'i');
  const re2 = new RegExp(`<meta\\s[^>]*content=["']([^"']+)["'][^>]*${attr}=["']${value}["']`, 'i');
  const m = html.match(re) || html.match(re2);
  return m ? m[1] : null;
}

function getLinkHref(rel) {
  const re = new RegExp(`<link\\s[^>]*rel=["']${rel}["'][^>]*href=["']([^"']+)["']`, 'i');
  const re2 = new RegExp(`<link\\s[^>]*href=["']([^"']+)["'][^>]*rel=["']${rel}["']`, 'i');
  const m = html.match(re) || html.match(re2);
  return m ? m[1] : null;
}

function extractJsonLd() {
  const re = /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/i;
  const m = html.match(re);
  if (!m) return null;
  return JSON.parse(m[1]);
}

describe('index.html – canonical and author meta tags', () => {
  it('has canonical link pointing to https://radical.codes/', () => {
    expect(getLinkHref('canonical')).toBe('https://radical.codes/');
  });

  it('has author meta tag with value "Ryan Gonyon"', () => {
    expect(getMetaContent('name', 'author')).toBe('Ryan Gonyon');
  });
});

describe('index.html – Open Graph meta tags', () => {
  it('og:url ends with trailing slash', () => {
    expect(getMetaContent('property', 'og:url')).toBe('https://radical.codes/');
  });

  it('og:site_name is "radical.codes"', () => {
    expect(getMetaContent('property', 'og:site_name')).toBe('radical.codes');
  });

  it('og:image points to og-image.png', () => {
    expect(getMetaContent('property', 'og:image')).toBe('https://radical.codes/og-image.png');
  });

  it('og:image:type is "image/png"', () => {
    expect(getMetaContent('property', 'og:image:type')).toBe('image/png');
  });

  it('og:image:width is "1200"', () => {
    expect(getMetaContent('property', 'og:image:width')).toBe('1200');
  });

  it('og:image:height is "630"', () => {
    expect(getMetaContent('property', 'og:image:height')).toBe('630');
  });

  it('og:image:alt is present and non-empty', () => {
    const val = getMetaContent('property', 'og:image:alt');
    expect(val).toBeTruthy();
    expect(val.length).toBeGreaterThan(0);
  });
});

describe('index.html – Twitter Card meta tags', () => {
  it('twitter:card is "summary_large_image"', () => {
    expect(getMetaContent('name', 'twitter:card')).toBe('summary_large_image');
  });

  it('twitter:title is present and non-empty', () => {
    const val = getMetaContent('name', 'twitter:title');
    expect(val).toBeTruthy();
  });

  it('twitter:description is present and non-empty', () => {
    const val = getMetaContent('name', 'twitter:description');
    expect(val).toBeTruthy();
  });

  it('twitter:image points to og-image.png', () => {
    expect(getMetaContent('name', 'twitter:image')).toBe('https://radical.codes/og-image.png');
  });

  it('twitter:image:alt is present and non-empty', () => {
    const val = getMetaContent('name', 'twitter:image:alt');
    expect(val).toBeTruthy();
    expect(val.length).toBeGreaterThan(0);
  });
});

describe('index.html – Web manifest link', () => {
  it('has a <link rel="manifest"> pointing to /site.webmanifest', () => {
    expect(getLinkHref('manifest')).toBe('/site.webmanifest');
  });
});

describe('index.html – JSON-LD structured data', () => {
  let jsonLd;

  beforeAll(() => {
    jsonLd = extractJsonLd();
  });

  it('JSON-LD script is present and parseable', () => {
    expect(jsonLd).not.toBeNull();
  });

  it('uses @context https://schema.org', () => {
    expect(jsonLd['@context']).toBe('https://schema.org');
  });

  it('@graph contains 4 entries', () => {
    expect(Array.isArray(jsonLd['@graph'])).toBe(true);
    expect(jsonLd['@graph']).toHaveLength(4);
  });

  it('Person node has name "Ryan Gonyon"', () => {
    const person = jsonLd['@graph'].find(n => n['@type'] === 'Person');
    expect(person).toBeDefined();
    expect(person.name).toBe('Ryan Gonyon');
  });

  it('Person node has correct @id', () => {
    const person = jsonLd['@graph'].find(n => n['@type'] === 'Person');
    expect(person['@id']).toBe('https://radical.codes/#ryan-gonyon');
  });

  it('Person node has jobTitle "Software engineer"', () => {
    const person = jsonLd['@graph'].find(n => n['@type'] === 'Person');
    expect(person.jobTitle).toBe('Software engineer');
  });

  it('Person node lists at least 5 knowsAbout topics', () => {
    const person = jsonLd['@graph'].find(n => n['@type'] === 'Person');
    expect(Array.isArray(person.knowsAbout)).toBe(true);
    expect(person.knowsAbout.length).toBeGreaterThanOrEqual(5);
  });

  it('Brand node has name "Radical Codes"', () => {
    const brand = jsonLd['@graph'].find(n => n['@type'] === 'Brand');
    expect(brand).toBeDefined();
    expect(brand.name).toBe('Radical Codes');
  });

  it('WebSite node has url "https://radical.codes/"', () => {
    const site = jsonLd['@graph'].find(n => n['@type'] === 'WebSite');
    expect(site).toBeDefined();
    expect(site.url).toBe('https://radical.codes/');
  });

  it('OfferCatalog node has 4 service items', () => {
    const catalog = jsonLd['@graph'].find(n => n['@type'] === 'OfferCatalog');
    expect(catalog).toBeDefined();
    expect(catalog.itemListElement).toHaveLength(4);
  });

  it('OfferCatalog includes "AI-built MVP stabilization" service', () => {
    const catalog = jsonLd['@graph'].find(n => n['@type'] === 'OfferCatalog');
    const names = catalog.itemListElement.map(i => i.itemOffered.name);
    expect(names).toContain('AI-built MVP stabilization');
  });

  it('OfferCatalog includes "Reviewable AI workflow automation" service', () => {
    const catalog = jsonLd['@graph'].find(n => n['@type'] === 'OfferCatalog');
    const names = catalog.itemListElement.map(i => i.itemOffered.name);
    expect(names).toContain('Reviewable AI workflow automation');
  });

  it('all @graph nodes have @id', () => {
    jsonLd['@graph'].forEach(node => {
      expect(node['@id']).toBeTruthy();
    });
  });
});

describe('index.html – Navigation: Fit link', () => {
  it('nav contains a link with id "nav-link-fit" pointing to #fit', () => {
    expect(html).toContain('id="nav-link-fit"');
    expect(html).toContain('href="#fit"');
  });
});

describe('index.html – Buyer Fit Matrix section (#fit)', () => {
  it('section with id="fit" exists', () => {
    expect(html).toContain('id="fit"');
  });

  it('fit section has aria-labelledby="fit-title"', () => {
    expect(html).toContain('aria-labelledby="fit-title"');
  });

  it('fit section contains "FIT MATRIX" eyebrow label', () => {
    expect(html).toContain('FIT MATRIX');
  });

  it('fit section has "Good Fit" panel', () => {
    expect(html).toContain('Good Fit');
  });

  it('fit section has "Not a Fit" panel', () => {
    expect(html).toContain('Not a Fit');
  });

  it('Good Fit panel includes AI-built or legacy app rescue item', () => {
    expect(html).toContain('AI-built or legacy app rescue');
  });

  it('Not a Fit panel includes generic landing pages item', () => {
    expect(html).toContain('Generic landing pages');
  });
});

describe('index.html – Service Lanes section (#lanes)', () => {
  it('section with id="lanes" exists', () => {
    expect(html).toContain('id="lanes"');
  });

  it('lanes section has aria-labelledby="lanes-title"', () => {
    expect(html).toContain('aria-labelledby="lanes-title"');
  });

  it('contains all 4 lane kicker labels', () => {
    expect(html).toContain('01 / Rescue');
    expect(html).toContain('02 / Boundaries');
    expect(html).toContain('03 / Workflow');
    expect(html).toContain('04 / Ops');
  });

  it('lane 01 is "AI-built MVP stabilization"', () => {
    // The lane-title following "01 / Rescue"
    const idx01 = html.indexOf('01 / Rescue');
    const section = html.slice(idx01, idx01 + 500);
    expect(section).toContain('AI-built MVP stabilization');
  });

  it('lane 04 is "Internal control boards"', () => {
    const idx04 = html.indexOf('04 / Ops');
    const section = html.slice(idx04, idx04 + 500);
    expect(section).toContain('Internal control boards');
  });

  it('each lane card has an output deliverable listed', () => {
    expect(html).toContain('fault map, patched flow, test path, and handoff notes');
    expect(html).toContain('verified provider path, sync checks, and rollback notes');
    expect(html).toContain('input queue, AI step, review gate, logs, and approved output');
    expect(html).toContain('dashboard, acceptance checks, runbook, and next-slice backlog');
  });

  it('lane cards use <article> element', () => {
    const laneSection = html.slice(html.indexOf('id="lanes"'), html.indexOf('<!-- Method'));
    const articleCount = (laneSection.match(/<article\s/g) || []).length;
    expect(articleCount).toBe(4);
  });
});

describe('index.html – Engagement Model section (#engagement)', () => {
  it('section with id="engagement" exists', () => {
    expect(html).toContain('id="engagement"');
  });

  it('engagement section has aria-labelledby="engagement-title"', () => {
    expect(html).toContain('aria-labelledby="engagement-title"');
  });

  it('contains all 3 engagement step labels', () => {
    expect(html).toContain('01 / DIAGNOSTIC CALL');
    expect(html).toContain('02 / ALIGNMENT MILESTONE');
    expect(html).toContain('03 / FIRST PRODUCTION SLICE');
  });

  it('CTA button links to mailto for diagnostic', () => {
    expect(html).toContain('href="mailto:coderradical@gmail.com?subject=First%20slice%20diagnostic"');
  });

  it('CTA button has id="engagement-diagnostic-link"', () => {
    expect(html).toContain('id="engagement-diagnostic-link"');
  });

  it('engagement section contains a note about starting material', () => {
    expect(html).toContain('Useful starting material');
  });
});

describe('index.html – Boundary Checklist section (#boundaries)', () => {
  it('section with id="boundaries" exists', () => {
    expect(html).toContain('id="boundaries"');
  });

  it('boundaries section has aria-labelledby="boundaries-title"', () => {
    expect(html).toContain('aria-labelledby="boundaries-title"');
  });

  it('contains all 4 boundary provider labels', () => {
    expect(html).toContain('Stripe');
    expect(html).toContain('Supabase');
    expect(html).toContain('AI Providers');
    expect(html).toContain('Deployments');
  });

  it('Stripe boundary item describes webhook reconciliation', () => {
    expect(html).toContain('Payment state and webhook reconciliation');
  });

  it('Supabase boundary item describes RLS and edge function boundaries', () => {
    expect(html).toContain('Auth, RLS, storage, and edge function boundaries');
  });
});

describe('index.html – Proof Ledger updates', () => {
  it('Data Flow Canvas case study row exists', () => {
    expect(html).toContain('id="case-study-data-flow-canvas"');
  });

  it('Data Flow Canvas links to the GitHub repo', () => {
    expect(html).toContain('https://github.com/Radical-Coder/data-flow-canvas-mvp');
  });

  it('proof-board-data-flow-link exists in proof board', () => {
    expect(html).toContain('id="proof-board-data-flow-link"');
  });

  it('ledger table has aria-describedby on <table> element', () => {
    expect(html).toContain('aria-describedby="ledger-title"');
  });

  it('ledger table header cells use scope="col"', () => {
    const tableSection = html.slice(
      html.indexOf('class="ledger-table"'),
      html.indexOf('</thead>')
    );
    const scopeColCount = (tableSection.match(/scope="col"/g) || []).length;
    expect(scopeColCount).toBe(4);
  });

  it('section-note paragraph is present in Proof Ledger header', () => {
    expect(html).toContain('class="section-note"');
    expect(html).toContain('The useful proof is not a screenshot');
  });
});