/**
 * Tests for PR changes to index.html:
 * - New CSS class `.section-note`
 * - New proof board console link: #proof-board-data-flow-link
 * - New section note paragraph in the Proof Ledger header
 * - New ledger table row: #case-study-data-flow-canvas
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { describe, it, expect, beforeAll } from "vitest";
import { JSDOM } from "jsdom";

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = resolve(__dirname, "../index.html");

let document;

beforeAll(() => {
  const html = readFileSync(htmlPath, "utf-8");
  const dom = new JSDOM(html);
  document = dom.window.document;
});

// ---------------------------------------------------------------------------
// 1. CSS .section-note rule
// ---------------------------------------------------------------------------
describe(".section-note CSS rule", () => {
  let ruleText;

  beforeAll(() => {
    // Collect all inline <style> block text from the document
    const styleBlocks = Array.from(document.querySelectorAll("style"))
      .map((s) => s.textContent)
      .join("\n");
    ruleText = styleBlocks;
  });

  it("defines the .section-note rule in a <style> block", () => {
    expect(ruleText).toContain(".section-note");
  });

  it("sets max-width to 760px", () => {
    expect(ruleText).toMatch(/\.section-note\s*\{[^}]*max-width\s*:\s*760px/s);
  });

  it("sets margin-top to 14px", () => {
    expect(ruleText).toMatch(/\.section-note\s*\{[^}]*margin-top\s*:\s*14px/s);
  });

  it("sets font-size to 15px", () => {
    expect(ruleText).toMatch(/\.section-note\s*\{[^}]*font-size\s*:\s*15px/s);
  });

  it("sets line-height to 1.55", () => {
    expect(ruleText).toMatch(/\.section-note\s*\{[^}]*line-height\s*:\s*1\.55/s);
  });

  it("sets color to var(--ink-muted)", () => {
    expect(ruleText).toMatch(
      /\.section-note\s*\{[^}]*color\s*:\s*var\(--ink-muted\)/s
    );
  });
});

// ---------------------------------------------------------------------------
// 2. Proof board console link: #proof-board-data-flow-link
// ---------------------------------------------------------------------------
describe("Proof board Data Flow Canvas console link (#proof-board-data-flow-link)", () => {
  let link;

  beforeAll(() => {
    link = document.getElementById("proof-board-data-flow-link");
  });

  it("exists in the document", () => {
    expect(link).not.toBeNull();
  });

  it("has the correct href pointing to the GitHub repo", () => {
    expect(link.getAttribute("href")).toBe(
      "https://github.com/Radical-Coder/data-flow-canvas-mvp"
    );
  });

  it("has class 'console-link'", () => {
    expect(link.classList.contains("console-link")).toBe(true);
  });

  it("opens in a new tab (target='_blank')", () => {
    expect(link.getAttribute("target")).toBe("_blank");
  });

  it("has rel='noopener' for security", () => {
    expect(link.getAttribute("rel")).toBe("noopener");
  });

  it("contains the expected link text", () => {
    expect(link.textContent.trim()).toContain("Data Flow Canvas Source");
  });

  it("is inside the console-links container", () => {
    expect(link.closest(".console-links")).not.toBeNull();
  });

  it("uses an absolute HTTPS URL (not a relative path)", () => {
    expect(link.getAttribute("href")).toMatch(/^https:\/\//);
  });
});

// ---------------------------------------------------------------------------
// 3. Section note paragraph in the Proof Ledger header
// ---------------------------------------------------------------------------
describe("Section note paragraph in the Proof Ledger (#work .section-header)", () => {
  let section;
  let noteEl;

  beforeAll(() => {
    section = document.getElementById("work");
    noteEl = section ? section.querySelector(".section-header .section-note") : null;
  });

  it("the #work section exists", () => {
    expect(section).not.toBeNull();
  });

  it("exists within the #work section's .section-header", () => {
    expect(noteEl).not.toBeNull();
  });

  it("is a <p> element", () => {
    expect(noteEl.tagName.toLowerCase()).toBe("p");
  });

  it("has the class 'section-note'", () => {
    expect(noteEl.classList.contains("section-note")).toBe(true);
  });

  it("contains the expected text content", () => {
    const text = noteEl.textContent.trim();
    expect(text).toContain("The useful proof is not a screenshot");
  });

  it("mentions live surface or public source", () => {
    expect(noteEl.textContent).toContain("live surface");
  });

  it("mentions how risk was bounded and tested", () => {
    expect(noteEl.textContent).toContain("risk was bounded, tested, and made legible");
  });

  it("is not empty", () => {
    expect(noteEl.textContent.trim().length).toBeGreaterThan(0);
  });

  it("appears after the section-title in DOM order", () => {
    const title = section.querySelector(".section-title");
    expect(title).not.toBeNull();
    // compareDocumentPosition flag 4 = note follows title
    const position = title.compareDocumentPosition(noteEl);
    expect(position & 4).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// 4. Data Flow Canvas ledger row (#case-study-data-flow-canvas)
// ---------------------------------------------------------------------------
describe("Data Flow Canvas ledger row (#case-study-data-flow-canvas)", () => {
  let row;

  beforeAll(() => {
    row = document.getElementById("case-study-data-flow-canvas");
  });

  it("exists in the document", () => {
    expect(row).not.toBeNull();
  });

  it("is a <tr> element", () => {
    expect(row.tagName.toLowerCase()).toBe("tr");
  });

  it("is inside the ledger table within #work", () => {
    const workSection = document.getElementById("work");
    expect(workSection).not.toBeNull();
    expect(workSection.contains(row)).toBe(true);
  });

  it("displays the project mark 'DF'", () => {
    const mark = row.querySelector(".project-mark");
    expect(mark).not.toBeNull();
    expect(mark.textContent.trim()).toBe("DF");
  });

  it("displays the project name 'Data Flow Canvas MVP'", () => {
    const name = row.querySelector(".ledger-project-name");
    expect(name).not.toBeNull();
    expect(name.textContent.trim()).toBe("Data Flow Canvas MVP");
  });

  it("displays the project subtitle 'Workflow automation source proof'", () => {
    const by = row.querySelector(".ledger-project-by");
    expect(by).not.toBeNull();
    expect(by.textContent.trim()).toBe("Workflow automation source proof");
  });

  it("contains the risk description about invisible glue automations", () => {
    const riskCell = row.querySelector(".ledger-risk-desc");
    expect(riskCell).not.toBeNull();
    expect(riskCell.textContent).toContain("invisible glue");
  });

  it("risk cell has data-label='Risk Solved'", () => {
    const riskCell = row.querySelector(".ledger-risk-desc");
    expect(riskCell.getAttribute("data-label")).toBe("Risk Solved");
  });

  it("contains the outcome description about the public proof repo", () => {
    const outcomeCell = row.querySelector(".ledger-outcome-desc");
    expect(outcomeCell).not.toBeNull();
    expect(outcomeCell.textContent).toContain("Public proof repo");
  });

  it("outcome cell has data-label='Outcome'", () => {
    const outcomeCell = row.querySelector(".ledger-outcome-desc");
    expect(outcomeCell.getAttribute("data-label")).toBe("Outcome");
  });

  it("outcome description mentions Python and browser-runner form", () => {
    const outcomeCell = row.querySelector(".ledger-outcome-desc");
    expect(outcomeCell.textContent).toContain("Python");
    expect(outcomeCell.textContent).toContain("browser-runner form");
  });
});

// ---------------------------------------------------------------------------
// 5. Data Flow Canvas proof link (#data-flow-canvas-case-study-link)
// ---------------------------------------------------------------------------
describe("Data Flow Canvas proof link (#data-flow-canvas-case-study-link)", () => {
  let link;

  beforeAll(() => {
    link = document.getElementById("data-flow-canvas-case-study-link");
  });

  it("exists in the document", () => {
    expect(link).not.toBeNull();
  });

  it("has the correct href pointing to the GitHub repo", () => {
    expect(link.getAttribute("href")).toBe(
      "https://github.com/Radical-Coder/data-flow-canvas-mvp"
    );
  });

  it("has class 'ledger-link'", () => {
    expect(link.classList.contains("ledger-link")).toBe(true);
  });

  it("opens in a new tab (target='_blank')", () => {
    expect(link.getAttribute("target")).toBe("_blank");
  });

  it("has rel='noopener' for security", () => {
    expect(link.getAttribute("rel")).toBe("noopener");
  });

  it("contains the text 'GitHub Repo'", () => {
    expect(link.textContent).toContain("GitHub Repo");
  });

  it("is inside the #case-study-data-flow-canvas row", () => {
    const row = document.getElementById("case-study-data-flow-canvas");
    expect(row.contains(link)).toBe(true);
  });

  it("is inside a <td> with data-label='Proof'", () => {
    const td = link.closest("td");
    expect(td).not.toBeNull();
    expect(td.getAttribute("data-label")).toBe("Proof");
  });

  it("uses an absolute HTTPS URL (not a relative path)", () => {
    expect(link.getAttribute("href")).toMatch(/^https:\/\//);
  });
});

// ---------------------------------------------------------------------------
// 6. Row ordering regression: data-flow row precedes readiness row
// ---------------------------------------------------------------------------
describe("Ledger table row ordering (regression)", () => {
  it("case-study-data-flow-canvas appears before case-study-readiness in DOM", () => {
    const dfRow = document.getElementById("case-study-data-flow-canvas");
    const readinessRow = document.getElementById("case-study-readiness");
    expect(dfRow).not.toBeNull();
    expect(readinessRow).not.toBeNull();
    // compareDocumentPosition flag 4 = readinessRow follows dfRow
    const position = dfRow.compareDocumentPosition(readinessRow);
    expect(position & 4).toBeTruthy();
  });

  it("ledger table has at least 4 body rows (including the new data-flow row)", () => {
    const tbody = document
      .getElementById("work")
      ?.querySelector(".ledger-table tbody");
    expect(tbody).not.toBeNull();
    expect(tbody.querySelectorAll("tr").length).toBeGreaterThanOrEqual(4);
  });
});

// ---------------------------------------------------------------------------
// 7. Boundary / negative cases
// ---------------------------------------------------------------------------
describe("Boundary and negative cases for new PR elements", () => {
  it("section-note paragraph has no child anchor elements (it is plain text)", () => {
    const workSection = document.getElementById("work");
    const noteEl = workSection?.querySelector(".section-header .section-note");
    expect(noteEl).not.toBeNull();
    expect(noteEl.querySelectorAll("a").length).toBe(0);
  });

  it("proof-board-data-flow-link text is not empty", () => {
    const link = document.getElementById("proof-board-data-flow-link");
    expect(link.textContent.trim().length).toBeGreaterThan(0);
  });

  it("data-flow-canvas-case-study-link href is not a fragment-only or empty URL", () => {
    const link = document.getElementById("data-flow-canvas-case-study-link");
    const href = link.getAttribute("href");
    expect(href).toBeTruthy();
    expect(href).not.toBe("#");
    expect(href).not.toBe("");
  });

  it("proof-board-data-flow-link and data-flow-canvas-case-study-link both point to the same GitHub repo URL", () => {
    const consoleLink = document.getElementById("proof-board-data-flow-link");
    const ledgerLink = document.getElementById("data-flow-canvas-case-study-link");
    expect(consoleLink.getAttribute("href")).toBe(
      ledgerLink.getAttribute("href")
    );
  });

  it("project mark 'DF' has aria-hidden='true' to avoid screen-reader clutter", () => {
    const row = document.getElementById("case-study-data-flow-canvas");
    const mark = row?.querySelector(".project-mark");
    expect(mark).not.toBeNull();
    expect(mark.getAttribute("aria-hidden")).toBe("true");
  });
});
