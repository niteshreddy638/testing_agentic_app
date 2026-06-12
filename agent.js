import { query } from "@anthropic-ai/claude-agent-sdk";
import { writeFileSync } from "node:fs";

export async function runResearchAgent(topic) {
  const prompt = `You are a web research agent. Research the topic below by:
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

  let report = "";

  for await (const message of query({
    prompt,
    options: {
      allowedTools: ["WebSearch", "WebFetch"],
      permissionMode: "bypassPermissions",
      maxTurns: 20,
    },
  })) {
    if (message.type === "assistant") {
      for (const block of message.message.content) {
        if (block.type === "text" && block.text.trim()) {
          report = block.text;
        } else if (block.type === "tool_use") {
          const q = block.input?.query || block.input?.url || "";
          console.log(`  → ${block.name}: ${q}`);
        }
      }
    }
  }

  const file = "report.md";
  writeFileSync(file, report);
  console.log(`\n✅ Report written to ${file}\n`);

  return report;
}