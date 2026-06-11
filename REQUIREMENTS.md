# Test Requirements Document — Web Research Agent

**Application under test:** `index.js` (Web Research Agent, built on the Claude Agent SDK)
**Document purpose:** Define the testable requirements from which test cases will be derived.
This document does **not** contain test cases — only the requirements they must verify.
**Version:** 1.0  **Date:** 2026-06-10

---

## 1. Overview

The Web Research Agent is a CLI application that accepts a topic, autonomously searches and
crawls the web using the Claude Agent SDK (`WebSearch` + `WebFetch` tools), and produces a
Markdown research report saved to `report.md`.

```
topic (CLI arg) → Claude Agent (query loop) → WebSearch + WebFetch → report.md
```

## 2. Scope

**In scope for testing**
- CLI argument handling and input parsing
- Agent invocation and configuration (tools, permissions, turn limit)
- Progress output to the console
- Report generation and file output
- Environment/configuration prerequisites (API key)
- Error and edge-case handling

**Out of scope**
- The internal correctness of the Claude Agent SDK itself (third-party dependency)
- Live quality/accuracy of web content returned by search engines
- The LLM's subjective writing quality (only structural requirements are testable)

## 3. Definitions

| Term | Meaning |
| ---- | ------- |
| Topic | The research subject supplied as command-line arguments |
| Report | The final Markdown text produced by the agent |
| Tool call | An agent action using `WebSearch` or `WebFetch` |
| Turn | One agent reasoning/response cycle in the SDK `query` loop |

---

## 4. Functional Requirements

Each requirement has a unique ID for traceability to test cases.

### 4.1 Input Handling

| ID | Requirement | Acceptance Criteria |
| -- | ----------- | ------------------- |
| FR-01 | The app SHALL accept a topic from command-line arguments. | Running `node index.js "AI agents"` uses `"AI agents"` as the topic. |
| FR-02 | Multi-word topics SHALL be joined into a single topic string. | `node index.js latest AI news` → topic = `"latest AI news"`. |
| FR-03 | When no topic argument is supplied, the app SHALL use the default topic `"latest developments in AI agents"`. | Running `node index.js` with no args uses the default. |
| FR-04 | The selected topic SHALL be echoed to the console before research begins. | Console shows `🔎 Researching: "<topic>"`. |

### 4.2 Agent Configuration & Execution

| ID | Requirement | Acceptance Criteria |
| -- | ----------- | ------------------- |
| FR-05 | The agent SHALL be allowed to use only the `WebSearch` and `WebFetch` tools. | `allowedTools` is exactly `["WebSearch", "WebFetch"]`. |
| FR-06 | The agent SHALL run with `permissionMode: "bypassPermissions"` so tools run without manual approval. | No interactive permission prompt appears during a run. |
| FR-07 | The agent SHALL be limited to a maximum of 20 turns. | `maxTurns` is 20; the run terminates at or before 20 turns. |
| FR-08 | The agent SHALL be instructed to search, fetch/crawl pages, cross-check sources, and produce a structured report. | The system prompt contains these instructions. |

### 4.3 Progress Output

| ID | Requirement | Acceptance Criteria |
| -- | ----------- | ------------------- |
| FR-09 | Each tool call SHALL be reported to the console with the tool name and its query or URL. | Console lines like `  → WebSearch: <query>` / `  → WebFetch: <url>` appear. |
| FR-10 | The latest assistant text message SHALL be retained as the report content. | Final report equals the last non-empty assistant text block. |

### 4.4 Report Output

| ID | Requirement | Acceptance Criteria |
| -- | ----------- | ------------------- |
| FR-11 | The final report SHALL be written to a file named `report.md`. | File `report.md` exists after a successful run. |
| FR-12 | The report SHALL be valid Markdown containing the sections: Title, Summary, Key Findings, Details, Sources. | All five sections are present in `report.md`. |
| FR-13 | On completion, the app SHALL print a confirmation message naming the output file. | Console shows `✅ Report written to report.md`. |

---

## 5. Non-Functional Requirements

| ID | Requirement | Acceptance Criteria |
| -- | ----------- | ------------------- |
| NFR-01 | The app SHALL require the `ANTHROPIC_API_KEY` environment variable to authenticate. | With no key configured, the run fails with an authentication-related error. |
| NFR-02 | The app SHALL be runnable on Node.js v22+ as an ES module. | `npm start` / `node index.js` runs without module-loading errors. |
| NFR-03 | Secrets and generated artifacts SHALL NOT be committed (`.env`, `report.md`, `node_modules/`). | These paths are listed in `.gitignore`. |
| NFR-04 | A run SHALL terminate (success or failure) and not hang indefinitely, bounded by `maxTurns`. | The process exits after the agent loop completes. |

---

## 6. Error Handling & Edge Cases

| ID | Requirement / Condition | Expected Behavior |
| -- | ----------------------- | ----------------- |
| EC-01 | Missing/invalid `ANTHROPIC_API_KEY`. | Run fails with a clear authentication error; no partial `report.md` overwrite expected. |
| EC-02 | Empty topic (e.g., quoted empty string `""`). | App falls back to the default topic. |
| EC-03 | Topic with special characters / quotes. | Topic is passed through without breaking the prompt or crashing. |
| EC-04 | Network failure during `WebSearch` / `WebFetch`. | Agent surfaces the failure; the process does not crash uncontrollably. |
| EC-05 | Agent produces no usable text (empty report). | `report.md` is written (may be empty); confirmation message still reflects actual state. |
| EC-06 | Turn limit (20) reached before a complete report. | Run stops; whatever text was last produced is saved. |
| EC-07 | `report.md` already exists. | File is overwritten with the new report. |
| EC-08 | SDK dependency not installed. | App fails at import with a clear module-not-found error. |

---

## 7. Test Data Requirements

- A valid `ANTHROPIC_API_KEY` (for integration/end-to-end runs).
- Sample topics: a simple topic, a multi-word topic, an empty string, a special-character topic.
- For unit-level tests, the Claude Agent SDK `query` function should be mockable so behavior
  can be verified without live API/network calls.

## 8. Suggested Test Levels

| Level | Focus | Key Requirements Covered |
| ----- | ----- | ------------------------ |
| Unit | Argument parsing, prompt construction, message handling, file write | FR-01..04, FR-09..13 |
| Integration | Agent invocation with mocked SDK, config values | FR-05..08, EC-04..06 |
| End-to-End | Full live run producing a real report | FR-01..13, NFR-01..04 |

## 9. Traceability

Every test case authored later MUST reference one or more requirement IDs above
(e.g., `FR-03`, `EC-02`) so coverage can be tracked back to this document.
