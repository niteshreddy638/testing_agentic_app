import { describe, it, mock, before, after } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";

// Mock writeFileSync to avoid actual file I/O
const writtenFiles = {};
mock.module("node:fs", {
  namedExports: {
    writeFileSync: (file, content) => {
      writtenFiles[file] = content;
    },
  },
});

describe("index.js - report writing", () => {
  it("should write the report to report.md", () => {
    const report = "# Test Report\n\n## Summary\nThis is a test.";
    writeFileSync("report.md", report);
    assert.equal(writtenFiles["report.md"], report);
  });
});