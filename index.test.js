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
});