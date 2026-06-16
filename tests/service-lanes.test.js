import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { JSDOM } from 'jsdom';

let dom;
let document;
let styleContent;

beforeAll(() => {
  const html = readFileSync(resolve(__dirname, '../index.html'), 'utf-8');
  dom = new JSDOM(html);
  document = dom.window.document;

  // Extract all <style> tag contents for CSS rule checks
  const styleTags = document.querySelectorAll('style');
  styleContent = Array.from(styleTags)
    .map((s) => s.textContent)
    .join('\n');
});

// ---------------------------------------------------------------------------
// Section structure
// ---------------------------------------------------------------------------

describe('Service Lanes section – structure', () => {
  it('exists as a <section> element with id="lanes"', () => {
    const section = document.getElementById('lanes');
    expect(section).not.toBeNull();
    expect(section.tagName.toLowerCase()).toBe('section');
  });

  it('has the class "section-container"', () => {
    const section = document.getElementById('lanes');
    expect(section.classList.contains('section-container')).toBe(true);
  });

  it('is labelled by aria-labelledby="lanes-title"', () => {
    const section = document.getElementById('lanes');
    expect(section.getAttribute('aria-labelledby')).toBe('lanes-title');
  });

  it('contains a section-header div', () => {
    const section = document.getElementById('lanes');
    expect(section.querySelector('.section-header')).not.toBeNull();
  });

  it('contains a lane-grid div', () => {
    const section = document.getElementById('lanes');
    expect(section.querySelector('.lane-grid')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

describe('Service Lanes section – header', () => {
  it('has eyebrow text "SERVICE LANES"', () => {
    const section = document.getElementById('lanes');
    const eyebrow = section.querySelector('.section-eyebrow');
    expect(eyebrow).not.toBeNull();
    expect(eyebrow.textContent.trim()).toBe('SERVICE LANES');
  });

  it('has an h2 with id="lanes-title"', () => {
    const heading = document.getElementById('lanes-title');
    expect(heading).not.toBeNull();
    expect(heading.tagName.toLowerCase()).toBe('h2');
  });

  it('has section title text "Four lanes where the work usually lands."', () => {
    const heading = document.getElementById('lanes-title');
    expect(heading.textContent.trim()).toBe(
      'Four lanes where the work usually lands.'
    );
  });

  it('section title has class "section-title"', () => {
    const heading = document.getElementById('lanes-title');
    expect(heading.classList.contains('section-title')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Lane grid
// ---------------------------------------------------------------------------

describe('Service Lanes section – lane grid', () => {
  let grid;

  beforeAll(() => {
    grid = document.querySelector('#lanes .lane-grid');
  });

  it('lane-grid contains exactly 4 lane-card articles', () => {
    const cards = grid.querySelectorAll('.lane-card');
    expect(cards.length).toBe(4);
  });

  it('each lane-card is an <article> element', () => {
    const cards = grid.querySelectorAll('.lane-card');
    cards.forEach((card) => {
      expect(card.tagName.toLowerCase()).toBe('article');
    });
  });

  it('each lane-card has a lane-kicker, lane-title (h3), lane-desc (p), and lane-output', () => {
    const cards = grid.querySelectorAll('.lane-card');
    cards.forEach((card) => {
      expect(card.querySelector('.lane-kicker')).not.toBeNull();
      expect(card.querySelector('h3.lane-title')).not.toBeNull();
      expect(card.querySelector('p.lane-desc')).not.toBeNull();
      expect(card.querySelector('.lane-output')).not.toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// Individual lane card content
// ---------------------------------------------------------------------------

describe('Service Lanes – card 01 / Rescue', () => {
  let card;

  beforeAll(() => {
    const cards = document.querySelectorAll('#lanes .lane-card');
    card = cards[0];
  });

  it('has kicker "01 / Rescue"', () => {
    expect(card.querySelector('.lane-kicker').textContent.trim()).toBe(
      '01 / Rescue'
    );
  });

  it('has title "AI-built MVP stabilization"', () => {
    expect(card.querySelector('h3.lane-title').textContent.trim()).toBe(
      'AI-built MVP stabilization'
    );
  });

  it('description mentions broken auth and deployment drift', () => {
    const desc = card.querySelector('.lane-desc').textContent;
    expect(desc).toContain('broken auth');
    expect(desc).toContain('deployment drift');
  });

  it('output text mentions fault map, patched flow, test path, and handoff notes', () => {
    const output = card.querySelector('.lane-output').textContent;
    expect(output).toContain('fault map');
    expect(output).toContain('patched flow');
    expect(output).toContain('test path');
    expect(output).toContain('handoff notes');
  });
});

describe('Service Lanes – card 02 / Boundaries', () => {
  let card;

  beforeAll(() => {
    const cards = document.querySelectorAll('#lanes .lane-card');
    card = cards[1];
  });

  it('has kicker "02 / Boundaries"', () => {
    expect(card.querySelector('.lane-kicker').textContent.trim()).toBe(
      '02 / Boundaries'
    );
  });

  it('has title "Stripe, Supabase, and provider hardening"', () => {
    expect(card.querySelector('h3.lane-title').textContent.trim()).toBe(
      'Stripe, Supabase, and provider hardening'
    );
  });

  it('description mentions webhooks and RLS', () => {
    const desc = card.querySelector('.lane-desc').textContent;
    expect(desc).toContain('webhooks');
    expect(desc).toContain('RLS');
  });

  it('output text mentions verified provider path, sync checks, and rollback notes', () => {
    const output = card.querySelector('.lane-output').textContent;
    expect(output).toContain('verified provider path');
    expect(output).toContain('sync checks');
    expect(output).toContain('rollback notes');
  });
});

describe('Service Lanes – card 03 / Workflow', () => {
  let card;

  beforeAll(() => {
    const cards = document.querySelectorAll('#lanes .lane-card');
    card = cards[2];
  });

  it('has kicker "03 / Workflow"', () => {
    expect(card.querySelector('.lane-kicker').textContent.trim()).toBe(
      '03 / Workflow'
    );
  });

  it('has title "Reviewable AI automation"', () => {
    expect(card.querySelector('h3.lane-title').textContent.trim()).toBe(
      'Reviewable AI automation'
    );
  });

  it('description mentions humans keep approval control', () => {
    const desc = card.querySelector('.lane-desc').textContent;
    expect(desc).toContain('approval control');
  });

  it('output text mentions input queue, AI step, review gate, logs, and approved output', () => {
    const output = card.querySelector('.lane-output').textContent;
    expect(output).toContain('input queue');
    expect(output).toContain('AI step');
    expect(output).toContain('review gate');
    expect(output).toContain('logs');
    expect(output).toContain('approved output');
  });
});

describe('Service Lanes – card 04 / Ops', () => {
  let card;

  beforeAll(() => {
    const cards = document.querySelectorAll('#lanes .lane-card');
    card = cards[3];
  });

  it('has kicker "04 / Ops"', () => {
    expect(card.querySelector('.lane-kicker').textContent.trim()).toBe(
      '04 / Ops'
    );
  });

  it('has title "Internal control boards"', () => {
    expect(card.querySelector('h3.lane-title').textContent.trim()).toBe(
      'Internal control boards'
    );
  });

  it('description mentions approvals and launch readiness', () => {
    const desc = card.querySelector('.lane-desc').textContent;
    expect(desc).toContain('approvals');
    expect(desc).toContain('launch readiness');
  });

  it('output text mentions dashboard, acceptance checks, runbook, and next-slice backlog', () => {
    const output = card.querySelector('.lane-output').textContent;
    expect(output).toContain('dashboard');
    expect(output).toContain('acceptance checks');
    expect(output).toContain('runbook');
    expect(output).toContain('next-slice backlog');
  });
});

// ---------------------------------------------------------------------------
// Kicker numbering order – regression / boundary
// ---------------------------------------------------------------------------

describe('Service Lanes – kicker ordering', () => {
  it('kickers are numbered 01 through 04 in sequence', () => {
    const kickers = Array.from(
      document.querySelectorAll('#lanes .lane-kicker')
    ).map((k) => k.textContent.trim());

    expect(kickers[0]).toMatch(/^01\s*\//);
    expect(kickers[1]).toMatch(/^02\s*\//);
    expect(kickers[2]).toMatch(/^03\s*\//);
    expect(kickers[3]).toMatch(/^04\s*\//);
  });

  it('there is no fifth lane card (boundary check)', () => {
    const cards = document.querySelectorAll('#lanes .lane-card');
    expect(cards.length).toBeLessThanOrEqual(4);
  });
});

// ---------------------------------------------------------------------------
// CSS class definitions – Service Lane styles
// ---------------------------------------------------------------------------

describe('Service Lanes – CSS class definitions', () => {
  it('defines .lane-grid as a grid with 2-column layout', () => {
    expect(styleContent).toContain('.lane-grid');
    expect(styleContent).toContain('display: grid');
    expect(styleContent).toContain('repeat(2, minmax(0, 1fr))');
  });

  it('defines .lane-card with minimum height', () => {
    expect(styleContent).toContain('.lane-card');
    expect(styleContent).toContain('min-height: 220px');
  });

  it('defines .lane-kicker with monospace font and uppercase transform', () => {
    expect(styleContent).toContain('.lane-kicker');
    expect(styleContent).toContain('text-transform: uppercase');
    expect(styleContent).toContain('font-weight: 700');
  });

  it('defines .lane-title with display font at 20px', () => {
    expect(styleContent).toContain('.lane-title');
    expect(styleContent).toContain('font-size: 20px');
    expect(styleContent).toContain('font-weight: 800');
  });

  it('defines .lane-desc with muted color at 14px', () => {
    expect(styleContent).toContain('.lane-desc');
    expect(styleContent).toContain('font-size: 14px');
    expect(styleContent).toContain('color: var(--ink-muted)');
  });

  it('defines .lane-output with left border and monospace font', () => {
    expect(styleContent).toContain('.lane-output');
    expect(styleContent).toContain('border-left: 2px solid var(--emerald)');
    expect(styleContent).toContain('padding-left: 10px');
  });

  it('lane-kicker color uses --emerald CSS variable', () => {
    // Confirm the kicker uses the brand accent colour
    const kickerBlock = styleContent.match(/\.lane-kicker\s*\{([^}]+)\}/);
    expect(kickerBlock).not.toBeNull();
    expect(kickerBlock[1]).toContain('var(--emerald)');
  });
});

// ---------------------------------------------------------------------------
// Responsive CSS overrides – 768px breakpoint
// ---------------------------------------------------------------------------

describe('Service Lanes – responsive CSS at max-width: 768px', () => {
  it('overrides .lane-grid to single column inside the 768px media query', () => {
    // Find the 768px media query block
    const mediaMatch = styleContent.match(
      /@media\s*\(max-width:\s*768px\)[^{]*\{([\s\S]*?)(?=@media|\s*<\/style>)/
    );
    expect(mediaMatch).not.toBeNull();
    const mediaBlock = mediaMatch[1];
    expect(mediaBlock).toContain('.lane-grid');
    expect(mediaBlock).toContain('grid-template-columns: 1fr');
  });

  it('overrides .lane-card min-height to auto inside the 768px media query', () => {
    const mediaMatch = styleContent.match(
      /@media\s*\(max-width:\s*768px\)[^{]*\{([\s\S]*?)(?=@media|\s*<\/style>)/
    );
    expect(mediaMatch).not.toBeNull();
    const mediaBlock = mediaMatch[1];
    expect(mediaBlock).toContain('.lane-card');
    expect(mediaBlock).toContain('min-height: auto');
  });
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

describe('Service Lanes – accessibility', () => {
  it('section is labelled via aria-labelledby pointing to an existing element', () => {
    const section = document.getElementById('lanes');
    const labelId = section.getAttribute('aria-labelledby');
    expect(document.getElementById(labelId)).not.toBeNull();
  });

  it('each card h3 title is a heading (not a div or span)', () => {
    const cards = document.querySelectorAll('#lanes .lane-card');
    cards.forEach((card) => {
      const heading = card.querySelector('.lane-title');
      expect(heading.tagName.toLowerCase()).toBe('h3');
    });
  });

  it('each card description is a paragraph element', () => {
    const cards = document.querySelectorAll('#lanes .lane-card');
    cards.forEach((card) => {
      const desc = card.querySelector('.lane-desc');
      expect(desc.tagName.toLowerCase()).toBe('p');
    });
  });
});