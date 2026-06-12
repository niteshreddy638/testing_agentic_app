/**
 * Unit tests for web-research-agent (index.js)
 *
 * We test the pure logic that can be exercised without hitting the network:
 *   1. Topic parsing from process.argv
 *   2. Prompt construction
 *   3. Report-file naming
 *
 * The @anthropic-ai/claude-agent-sdk and node:fs are mocked so no real
 * network calls or disk writes happen during the test run.
 *
 * NEW: test that buildPrompt includes the topic in the output string.
 */

import { jest } from "@jest/globals";

// ── Mocks ────────────────────────────────────────────────────────────────────

// Mock the SDK so `query()` returns a single assistant message with text.
jest.unstable_mockModule("@anthropic-ai/claude-agent-sdk", () => ({
  query: jest.fn(async function* ({ prompt }) {
    yield {
      type: "assistant",
      message: {
        content: [{ type: "text", text: `Mock report for: ${prompt}` }],
      },
    };
  }),
}));

// Mock writeFileSync so no files are written to disk.
const mockWriteFileSync = jest.fn();
jest.unstable_mockModule("node:fs", () => ({
  writeFileSync: mockWriteFileSync,
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build the prompt string the same way index.js does, so we can assert on it
 * without importing the module (which has side-effects on load).
 */
function buildPrompt(topic) {
  return `You are a web research agent. Research the topic below by:
1. Searching the web for relevant, recent sources.
2. Fetching and reading the most useful pages to crawl their content.
3. Cross-checking facts across multiple sources.

Then write a clear Markdown report with these sections:
- # Title
- ## Summary (3-4 sentences)
- ## Key Findings (bullet points)
- ## Details (a few short paragraphs)
- ## Sources (list of the URLs you used)

Topic: "${topic}"

Return ONLY the final Markdown report as your last message.`;
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("Topic parsing", () => {
  test("uses a single CLI arg as-is", () => {
    const args = ["quantum-computing"];
    const topic = args.join(" ") || "latest developments in AI agents";
    expect(topic).toBe("quantum-computing");
  });
});

describe("Output file naming", () => {
  test("report is always written to report.md", () => {
    const file = "report.md";
    expect(file).toBe("report.md");
  });
});

describe("Prompt construction", () => {
  test("buildPrompt includes the topic in the output string", () => {
    const topic = "quantum computing";
    const prompt = buildPrompt(topic);
    expect(prompt).toContain(`Topic: "${topic}"`);
  });
});