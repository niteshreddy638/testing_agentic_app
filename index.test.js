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
  it("returns empty string when there are no messages", () => {
    assert.equal(extractReport([]), "");
  });

  it("ignores non-assistant messages", () => {
    const messages = [
      { type: "user", message: { content: [{ type: "text", text: "hello" }] } },
    ];
    assert.equal(extractReport(messages), "");
  });
});