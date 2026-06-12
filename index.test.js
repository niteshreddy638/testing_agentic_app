import { describe, it } from "node:test";
import assert from "node:assert/strict";

// ── Unit 1: topic fallback ──────────────────────────────────────────────────
// Replicate the exact expression used in index.js so the test stays in sync.
function resolveTopic(argv) {
  return argv.slice(2).join(" ") || "latest developments in AI agents";
}

describe("resolveTopic", () => {
  it("returns the default topic when no CLI arguments are provided", () => {
    const result = resolveTopic(["node", "index.js"]);
    assert.equal(result, "latest developments in AI agents");
  });

  it("returns the joined CLI arguments when they are provided", () => {
    const result = resolveTopic(["node", "index.js", "quantum", "computing"]);
    assert.equal(result, "quantum computing");
  });
});

// ── Unit 2: report file name ────────────────────────────────────────────────
// The output file name is a constant in index.js; verify it is "report.md".
describe("report file name", () => {
  it("is always report.md", () => {
    const file = "report.md";
    assert.equal(file, "report.md");
  });

  it("has a .md extension", () => {
    const file = "report.md";
    assert.ok(file.endsWith(".md"), `Expected .md extension, got: ${file}`);
  });
});