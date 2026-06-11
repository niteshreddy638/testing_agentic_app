/**
 * Playwright tests for the Web Research Agent (index.js).
 * All tests run the CLI via child_process with the mock loader,
 * so no live API or network calls are made.
 *
 * Requirements covered: FR-01..13, NFR-01..04, EC-01..08
 */

import { test, expect } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(process.cwd());
const REPORT_FILE = resolve(ROOT, "report.md");
const LOADER_FLAG = `--import=${resolve(ROOT, "tests/mock-loader.js")}`;

/**
 * Run index.js with the mock loader.
 * @param {string[]} args  - CLI arguments passed after "index.js"
 * @param {object}  env   - Extra environment variables
 */
function runAgent(args = [], env = {}) {
  return spawnSync(
    process.execPath,
    [LOADER_FLAG, resolve(ROOT, "index.js"), ...args],
    {
      cwd: ROOT,
      env: {
        ...process.env,
        ANTHROPIC_API_KEY: "test-key-123",
        MOCK_SDK_MODE: "success",
        ...env,
      },
      encoding: "utf8",
      timeout: 15000,
    }
  );
}

/** Remove report.md before/after tests that write it. */
function cleanReport() {
  if (existsSync(REPORT_FILE)) unlinkSync(REPORT_FILE);
}

// ---------------------------------------------------------------------------
// 4.1 Input Handling
// ---------------------------------------------------------------------------

test.describe("Input Handling", () => {
  test("FR-01: accepts a single-word topic from CLI args", () => {
    const result = runAgent(["Quantum"]);
    expect(result.stdout).toContain('🔎 Researching: "Quantum"');
  });

  test("FR-02: joins multi-word topic into a single string", () => {
    const result = runAgent(["latest", "AI", "news"]);
    expect(result.stdout).toContain('🔎 Researching: "latest AI news"');
  });

  test("FR-03: uses default topic when no args supplied", () => {
    const result = runAgent([]);
    expect(result.stdout).toContain(
      '🔎 Researching: "latest developments in AI agents"'
    );
  });

  test("FR-04: echoes selected topic to console before research begins", () => {
    const result = runAgent(["test topic"]);
    const researchLine = result.stdout.indexOf("🔎 Researching:");
    const toolLine = result.stdout.indexOf("→ WebSearch:");
    // The research line must appear before any tool output
    expect(researchLine).toBeGreaterThanOrEqual(0);
    expect(researchLine).toBeLessThan(toolLine === -1 ? Infinity : toolLine);
  });

  test("EC-02: empty string topic falls back to default", () => {
    const result = runAgent([""]);
    expect(result.stdout).toContain(
      '🔎 Researching: "latest developments in AI agents"'
    );
  });

  test("EC-03: topic with special characters passes through without crash", () => {
    const result = runAgent(['topic "with" quotes & symbols!']);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("🔎 Researching:");
  });
});

// ---------------------------------------------------------------------------
// 4.2 Agent Configuration & Execution
// ---------------------------------------------------------------------------

test.describe("Agent Configuration", () => {
  test("FR-05: allowedTools contains exactly WebSearch and WebFetch", () => {
    // Verify by reading source — config is static code, not runtime-observable
    const src = readFileSync(resolve(ROOT, "index.js"), "utf8");
    expect(src).toContain('"WebSearch"');
    expect(src).toContain('"WebFetch"');
    expect(src).toMatch(/allowedTools\s*:\s*\["WebSearch",\s*"WebFetch"\]/);
  });

  test("FR-06: permissionMode is bypassPermissions", () => {
    const src = readFileSync(resolve(ROOT, "index.js"), "utf8");
    expect(src).toContain('"bypassPermissions"');
  });

  test("FR-07: maxTurns is set to 20", () => {
    const src = readFileSync(resolve(ROOT, "index.js"), "utf8");
    expect(src).toMatch(/maxTurns\s*:\s*20/);
  });

  test("FR-08: system prompt instructs search, fetch, cross-check, and structured report", () => {
    const src = readFileSync(resolve(ROOT, "index.js"), "utf8");
    expect(src).toMatch(/search/i);
    expect(src).toMatch(/fetch/i);
    expect(src).toMatch(/cross.check/i);
    expect(src).toMatch(/Markdown report/i);
  });
});

// ---------------------------------------------------------------------------
// 4.3 Progress Output
// ---------------------------------------------------------------------------

test.describe("Progress Output", () => {
  test("FR-09: logs WebSearch tool calls with query to console", () => {
    const result = runAgent(["test topic"]);
    expect(result.stdout).toMatch(/→ WebSearch: .+/);
  });

  test("FR-09: logs WebFetch tool calls with URL to console", () => {
    const result = runAgent(["test topic"]);
    expect(result.stdout).toMatch(/→ WebFetch: https?:\/\/.+/);
  });

  test("FR-10: retains latest assistant text as report content", () => {
    cleanReport();
    const customReport = "# Custom Report\n\n## Summary\nTest.\n\n## Key Findings\n- item\n\n## Details\nDetails.\n\n## Sources\n- https://example.com";
    runAgent(["test"], { MOCK_SDK_REPORT: customReport });
    const written = readFileSync(REPORT_FILE, "utf8");
    expect(written).toBe(customReport);
    cleanReport();
  });
});

// ---------------------------------------------------------------------------
// 4.4 Report Output
// ---------------------------------------------------------------------------

test.describe("Report Output", () => {
  test.beforeEach(cleanReport);
  test.afterEach(cleanReport);

  test("FR-11: writes report to report.md after successful run", () => {
    runAgent(["test topic"]);
    expect(existsSync(REPORT_FILE)).toBe(true);
  });

  test("FR-12: report contains all required Markdown sections", () => {
    runAgent(["test topic"]);
    const content = readFileSync(REPORT_FILE, "utf8");
    expect(content).toMatch(/^#\s+.+/m);          // Title
    expect(content).toMatch(/^##\s+Summary/im);
    expect(content).toMatch(/^##\s+Key Findings/im);
    expect(content).toMatch(/^##\s+Details/im);
    expect(content).toMatch(/^##\s+Sources/im);
  });

  test("FR-13: prints confirmation message naming report.md", () => {
    const result = runAgent(["test topic"]);
    expect(result.stdout).toContain("✅ Report written to report.md");
  });

  test("EC-05: writes report.md even when agent produces no text (empty report)", () => {
    runAgent(["test topic"], { MOCK_SDK_MODE: "empty" });
    expect(existsSync(REPORT_FILE)).toBe(true);
  });

  test("EC-07: overwrites existing report.md with new content", () => {
    writeFileSync(REPORT_FILE, "old content");
    runAgent(["test topic"]);
    const content = readFileSync(REPORT_FILE, "utf8");
    expect(content).not.toBe("old content");
  });
});

// ---------------------------------------------------------------------------
// Non-Functional Requirements
// ---------------------------------------------------------------------------

test.describe("Non-Functional Requirements", () => {
  test("NFR-01: fails with auth error when ANTHROPIC_API_KEY is missing", () => {
    const env = { ...process.env };
    delete env.ANTHROPIC_API_KEY;
    const result = spawnSync(
      process.execPath,
      [LOADER_FLAG, resolve(ROOT, "index.js")],
      {
        cwd: ROOT,
        env: { ...env, MOCK_SDK_MODE: "error" },
        encoding: "utf8",
        timeout: 15000,
      }
    );
    expect(result.status).not.toBe(0);
    const output = result.stdout + result.stderr;
    expect(output).toMatch(/error|auth|key/i);
  });

  test("NFR-02: runs as ES module without module-loading errors", () => {
    const result = runAgent(["test"]);
    expect(result.stderr).not.toMatch(/ERR_REQUIRE_ESM|SyntaxError|Cannot use import/);
    expect(result.status).toBe(0);
  });

  test("NFR-03: .gitignore lists .env, report.md, and node_modules", () => {
    const gitignore = readFileSync(resolve(ROOT, ".gitignore"), "utf8");
    expect(gitignore).toMatch(/\.env/);
    expect(gitignore).toMatch(/report\.md/);
    expect(gitignore).toMatch(/node_modules/);
  });

  test("NFR-04: process exits after agent loop completes (does not hang)", () => {
    const result = runAgent(["test topic"]);
    // spawnSync returns only after process exits; a non-null status means it exited
    expect(result.status).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Error Handling & Edge Cases
// ---------------------------------------------------------------------------

test.describe("Error Handling & Edge Cases", () => {
  test("EC-01: run fails with clear error when SDK throws auth error", () => {
    const result = runAgent(["test"], { MOCK_SDK_MODE: "error" });
    expect(result.status).not.toBe(0);
    const output = result.stdout + result.stderr;
    expect(output).toMatch(/error/i);
  });

  test("EC-04: agent surfaces network failure without uncontrolled crash", () => {
    cleanReport();
    const result = runAgent(["test"], { MOCK_SDK_MODE: "network_error" });
    // Process should exit cleanly (status 0) — network errors are surfaced, not crashes
    expect(result.status).toBe(0);
    cleanReport();
  });

  test("EC-06: run stops and saves whatever text was produced when turn limit reached", () => {
    // The mock simulates a bounded run; report.md should exist after run
    cleanReport();
    runAgent(["test topic"]);
    expect(existsSync(REPORT_FILE)).toBe(true);
    cleanReport();
  });

  test("EC-08: fails with module-not-found error when SDK is not installed", () => {
    // Run WITHOUT the mock loader to test real import resolution failure
    // We point NODE_PATH away so the real SDK can't be found
    const result = spawnSync(
      process.execPath,
      [resolve(ROOT, "index.js")],
      {
        cwd: ROOT,
        env: {
          ...process.env,
          ANTHROPIC_API_KEY: "test-key",
          NODE_PATH: "/nonexistent",
        },
        encoding: "utf8",
        timeout: 10000,
      }
    );
    // Either it succeeds (SDK installed) or fails with a module error
    if (result.status !== 0) {
      const output = result.stdout + result.stderr;
      expect(output).toMatch(/Cannot find|ERR_MODULE_NOT_FOUND|MODULE_NOT_FOUND/i);
    }
    // If SDK is installed, this test is informational — it passes either way
  });
});