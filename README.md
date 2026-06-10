# Web Research Agent 🔎

A **simple agentic application** built on the [Claude Agent SDK](https://docs.anthropic.com/en/api/agent-sdk).
Give it a topic — the agent autonomously searches the web, crawls the most useful
pages, cross-checks facts, and writes a Markdown report.

## How it works

```
your topic  →  Claude Agent  →  WebSearch + WebFetch (crawl)  →  report.md
```

The agent decides on its own how many searches and page fetches to run. That
decision-making loop is what makes it *agentic* rather than a fixed script.

## Setup

```bash
npm install
export ANTHROPIC_API_KEY="sk-ant-..."   # your Claude API key
```

## Usage

```bash
node index.js "impact of AI agents on software testing"
```

The final report is printed to the console and saved to `report.md`.

## Files

| File          | Purpose                                  |
| ------------- | ---------------------------------------- |
| `index.js`    | The whole agent (~50 lines)              |
| `package.json`| Dependency on the Claude Agent SDK       |
