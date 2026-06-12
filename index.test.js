import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// --- Mocks must be declared before any import of the module under test ---
const mockWriteFileSync = jest.fn();
jest.unstable_mockModule("node:fs", () => ({
  writeFileSync: mockWriteFileSync,
}));

const mockQuery = jest.fn();
jest.unstable_mockModule("@anthropic-ai/claude-agent-sdk", () => ({
  query: mockQuery,
}));

// Helper: build an async generator from an array of messages
async function* makeMessages(messages) {
  for (const msg of messages) yield msg;
}

// Lazy import AFTER mocks are registered
const { runResearchAgent } = await import("./agent.js");

describe("runResearchAgent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("extracts the last assistant text block as the report and writes it to report.md", async () => {
    mockQuery.mockReturnValue(
      makeMessages([
        {
          type: "assistant",
          message: { content: [{ type: "text", text: "Intermediate text" }] },
        },
        {
          type: "assistant",
          message: { content: [{ type: "text", text: "# Final Report\n\nContent here." }] },
        },
      ])
    );

    const result = await runResearchAgent("AI agents");

    expect(result).toBe("# Final Report\n\nContent here.");
    expect(mockWriteFileSync).toHaveBeenCalledWith("report.md", "# Final Report\n\nContent here.");
  });

  it("logs tool_use blocks (WebSearch / WebFetch) without treating them as the report", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    mockQuery.mockReturnValue(
      makeMessages([
        {
          type: "assistant",
          message: {
            content: [
              { type: "tool_use", name: "WebSearch", input: { query: "AI agents 2024" } },
              { type: "tool_use", name: "WebFetch", input: { url: "https://example.com" } },
            ],
          },
        },
        {
          type: "assistant",
          message: { content: [{ type: "text", text: "# Report" }] },
        },
      ])
    );

    await runResearchAgent("AI agents");

    const logCalls = consoleSpy.mock.calls.map((c) => c[0]);
    expect(logCalls.some((l) => l.includes("WebSearch") && l.includes("AI agents 2024"))).toBe(true);
    expect(logCalls.some((l) => l.includes("WebFetch") && l.includes("https://example.com"))).toBe(true);
    expect(mockWriteFileSync).toHaveBeenCalledWith("report.md", "# Report");

    consoleSpy.mockRestore();
  });

  it("writes an empty string to report.md when there are no assistant messages", async () => {
    mockQuery.mockReturnValue(makeMessages([]));

    const result = await runResearchAgent("empty topic");

    expect(result).toBe("");
    expect(mockWriteFileSync).toHaveBeenCalledWith("report.md", "");
  });

  it("ignores assistant messages whose text blocks are whitespace-only", async () => {
    mockQuery.mockReturnValue(
      makeMessages([
        {
          type: "assistant",
          message: { content: [{ type: "text", text: "   \n  " }] },
        },
        {
          type: "assistant",
          message: { content: [{ type: "text", text: "# Real Report" }] },
        },
      ])
    );

    const result = await runResearchAgent("whitespace test");

    expect(result).toBe("# Real Report");
    expect(mockWriteFileSync).toHaveBeenCalledWith("report.md", "# Real Report");
  });
});