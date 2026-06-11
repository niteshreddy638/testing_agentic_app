/**
 * Mock for @anthropic-ai/claude-agent-sdk
 * Simulates the async generator `query()` function.
 * Controlled via environment variables set per test:
 *   MOCK_SDK_MODE: "success" | "empty" | "error" | "network_error"
 *   MOCK_SDK_REPORT: the report text to return (default: a valid markdown report)
 */

const DEFAULT_REPORT = `# AI Research Report

## Summary
This is a test summary with three to four sentences covering the topic.
It provides an overview of the research findings gathered from multiple sources.
The agent successfully searched and fetched relevant pages.

## Key Findings
- Finding one about the topic
- Finding two about the topic
- Finding three about the topic

## Details
Some detailed paragraphs about the research topic go here.
The agent cross-checked multiple sources to verify accuracy.

## Sources
- https://example.com/source1
- https://example.com/source2
`;

export async function* query({ prompt, options } = {}) {
  const mode = process.env.MOCK_SDK_MODE || "success";
  const reportText = process.env.MOCK_SDK_REPORT || DEFAULT_REPORT;

  if (mode === "error") {
    throw new Error("Authentication error: invalid API key");
  }

  if (mode === "network_error") {
    // Yield a tool_use message then simulate network failure in text
    yield {
      type: "assistant",
      message: {
        content: [
          { type: "tool_use", name: "WebSearch", input: { query: "test topic" } },
        ],
      },
    };
    yield {
      type: "assistant",
      message: {
        content: [
          { type: "text", text: "Network error encountered while fetching results." },
        ],
      },
    };
    return;
  }

  if (mode === "empty") {
    // Yield tool calls but no text content
    yield {
      type: "assistant",
      message: {
        content: [
          { type: "tool_use", name: "WebSearch", input: { query: "test topic" } },
          { type: "tool_use", name: "WebFetch", input: { url: "https://example.com" } },
        ],
      },
    };
    return;
  }

  // Default: "success" mode
  // First yield: tool calls (progress output)
  yield {
    type: "assistant",
    message: {
      content: [
        { type: "tool_use", name: "WebSearch", input: { query: "test topic search" } },
        { type: "tool_use", name: "WebFetch", input: { url: "https://example.com/page" } },
      ],
    },
  };

  // Second yield: final report text
  yield {
    type: "assistant",
    message: {
      content: [
        { type: "text", text: reportText },
      ],
    },
  };
}