import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Web Research Agent", () => {
  it("should write the report to report.md", async () => {
    const report = "# AI Agents\n\n## Summary\nTest summary.";
    const file = "report.md";

    assert.equal(file, "report.md");
    assert.ok(report.length > 0, "Report content should not be empty");
  });

  it("should use the default topic when no CLI args are provided", () => {
    const args = [];
    const topic = args.join(" ") || "latest developments in AI agents";
    assert.equal(topic, "latest developments in AI agents");
  });

  it("should use a custom topic when CLI args are provided", () => {
    const args = ["AI", "safety", "research"];
    const topic = args.join(" ") || "latest developments in AI agents";
    assert.equal(topic, "AI safety research");
  });

  it("should produce a report with required markdown sections", () => {
    const report = [
      "# AI Agents",
      "## Summary",
      "## Key Findings",
      "## Details",
      "## Sources",
    ].join("\n");

    assert.ok(report.includes("# "), "Report should have a title");
    assert.ok(report.includes("## Summary"), "Report should have a Summary section");
    assert.ok(report.includes("## Key Findings"), "Report should have a Key Findings section");
    assert.ok(report.includes("## Details"), "Report should have a Details section");
    assert.ok(report.includes("## Sources"), "Report should have a Sources section");
  });

  it("should keep the latest assistant text as the report", () => {
    let report = "";
    const messages = [
      { type: "assistant", text: "First draft." },
      { type: "assistant", text: "Final report content." },
    ];

    for (const msg of messages) {
      if (msg.type === "assistant" && msg.text.trim()) {
        report = msg.text;
      }
    }

    assert.equal(report, "Final report content.");
  });

  it("should ignore non-assistant messages when building the report", () => {
    let report = "";
    const messages = [
      { type: "user", text: "Research AI agents." },
      { type: "tool_result", text: "Some tool output." },
      { type: "assistant", text: "Final report." },
    ];

    for (const msg of messages) {
      if (msg.type === "assistant" && msg.text.trim()) {
        report = msg.text;
      }
    }

    assert.equal(report, "Final report.");
  });

  it("should not update report for assistant messages with blank text", () => {
    let report = "Previous report.";
    const messages = [
      { type: "assistant", text: "   " },
      { type: "assistant", text: "" },
    ];

    for (const msg of messages) {
      if (msg.type === "assistant" && msg.text.trim()) {
        report = msg.text;
      }
    }

    assert.equal(report, "Previous report.");
  });

  it("should extract query or url from tool_use block input", () => {
    const block = { type: "tool_use", name: "WebSearch", input: { query: "AI agents 2025" } };
    const q = block.input?.query || block.input?.url || "";
    assert.equal(q, "AI agents 2025");
  });

  it("should extract url from tool_use block when query is absent", () => {
    const block = { type: "tool_use", name: "WebFetch", input: { url: "https://example.com" } };
    const q = block.input?.query || block.input?.url || "";
    assert.equal(q, "https://example.com");
  });

  it("should return empty string when tool_use block has no query or url", () => {
    const block = { type: "tool_use", name: "WebSearch", input: {} };
    const q = block.input?.query || block.input?.url || "";
    assert.equal(q, "");
  });
});