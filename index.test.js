// Unit test for topic extraction logic (uses Node's built-in test runner)
import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Extracted pure function mirroring the logic in index.js
function extractTopic(argv, defaultTopic = "latest developments in AI agents") {
  return argv.slice(2).join(" ") || defaultTopic;
}

describe("extractTopic", () => {
  it("returns the default topic when no CLI args are provided", () => {
    const result = extractTopic(["node", "index.js"]);
    assert.equal(result, "latest developments in AI agents");
  });

describe("buildPrompt", () => {
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

  it("includes the topic in the prompt", () => {
    const prompt = buildPrompt("AI agents");
    assert.ok(prompt.includes('"AI agents"'));
  });

  it("instructs the agent to return only the final Markdown report", () => {
    const prompt = buildPrompt("anything");
    assert.ok(prompt.includes("Return ONLY the final Markdown report"));
  });

  it("lists all required report sections", () => {
    const prompt = buildPrompt("anything");
    for (const section of ["# Title", "## Summary", "## Key Findings", "## Details", "## Sources"]) {
      assert.ok(prompt.includes(section), `Missing section: ${section}`);
    }
  });
});

  it("returns a single CLI argument as the topic", () => {
    const result = extractTopic(["node", "index.js", "quantum computing"]);
    assert.equal(result, "quantum computing");
  });

  it("joins multiple CLI arguments with spaces", () => {
    const result = extractTopic(["node", "index.js", "AI", "agents", "2025"]);
    assert.equal(result, "AI agents 2025");
  });

  it("uses a custom default when provided", () => {
    const result = extractTopic(["node", "index.js"], "custom default");
    assert.equal(result, "custom default");
  });
});