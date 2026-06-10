import { query } from "@anthropic-ai/claude-agent-sdk";
import { writeFileSync } from "node:fs";

// ---- The topic to research: pass it on the command line ----
//   node index.js "latest news on AI agents"
const topic = process.argv.slice(2).join(" ") || "latest developments in AI agents";

console.log(`\n🔎 Researching: "${topic}"\n`);

// The agent's instructions. It is free to decide how many searches/fetches
// to run — that autonomy is what makes it "agentic".
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

// query() runs the agent loop: it plans, calls tools, and responds.
for await (const message of query({
  prompt,
  options: {
    // Built-in tools the agent may use to crawl the internet.
    allowedTools: ["WebSearch", "WebFetch"],
    permissionMode: "bypassPermissions", // run tools without prompting
    maxTurns: 20,
  },
})) {
  // Show progress as the agent works.
  if (message.type === "assistant") {
    for (const block of message.message.content) {
      if (block.type === "text" && block.text.trim()) {
        report = block.text; // keep the latest text as the report
      } else if (block.type === "tool_use") {
        const q = block.input?.query || block.input?.url || "";
        console.log(`  → ${block.name}: ${q}`);
      }
    }
  }
}

// Save the report to a file.
const file = "report.md";
writeFileSync(file, report);
console.log(`\n✅ Report written to ${file}\n`);
