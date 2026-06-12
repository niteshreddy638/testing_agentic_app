import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Mirrors the report-extraction logic from index.js
function extractReport(messages) {
  let report = "";
  for (const message of messages) {
    if (message.type === "assistant") {
      for (const block of message.message.content) {
        if (block.type === "text" && block.text.trim()) {
          report = block.text;
        }
      }
    }
  }
  return report;
}

describe("extractReport", () => {
  it("returns the last assistant text block as the report", () => {
    const messages = [
      {
        type: "assistant",
        message: {
          content: [{ type: "text", text: "# Report\n## Summary\nHello." }],
        },
      },
    ];
    const result = extractReport(messages);
    assert.ok(result.includes("# Report"));
    assert.ok(result.includes("## Summary"));
  });

  it("ignores tool_use blocks", () => {
    const messages = [
      {
        type: "assistant",
        message: {
          content: [
            { type: "tool_use", name: "WebSearch", input: { query: "AI" } },
            { type: "text", text: "Final report." },
          ],
        },
      },
    ];
    assert.equal(extractReport(messages), "Final report.");
  });

  it("returns empty string when there are no messages", () => {
    assert.equal(extractReport([]), "");
  });

  it("skips assistant messages with only whitespace text", () => {
    const messages = [
      {
        type: "assistant",
        message: { content: [{ type: "text", text: "   " }] },
      },
    ];
    assert.equal(extractReport(messages), "");
  });
});