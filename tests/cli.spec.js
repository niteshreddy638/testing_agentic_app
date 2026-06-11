import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";

test("echoes the default topic to console when no argument is given", () => {
  // Run the app with no args — it should print the default topic immediately
  // We only check the first line of output (before the agent loop starts)
  let output = "";
  try {
    output = execFileSync("node", ["index.js"], {
      timeout: 5000,
      encoding: "utf8",
      env: { ...process.env, ANTHROPIC_API_KEY: "invalid-key-for-unit-test" },
    });

test("echoes a custom topic when passed as a CLI argument", () => {
  let output = "";
  try {
    output = execFileSync("node", ["index.js", "quantum computing"], {
      timeout: 5000,
      encoding: "utf8",
      env: { ...process.env, ANTHROPIC_API_KEY: "invalid-key-for-unit-test" },
    });
  } catch (err) {
    output = (err.stdout || "") + (err.stderr || "");
  }

  expect(output).toContain('🔎 Researching: "quantum computing"');
});

test("joins multiple CLI arguments into a single topic string", () => {
  let output = "";
  try {
    output = execFileSync("node", ["index.js", "latest", "AI", "news"], {
      timeout: 5000,
      encoding: "utf8",
      env: { ...process.env, ANTHROPIC_API_KEY: "invalid-key-for-unit-test" },
    });
  } catch (err) {
    output = (err.stdout || "") + (err.stderr || "");
  }

  expect(output).toContain('🔎 Researching: "latest AI news"');
});

test("fails with an error when ANTHROPIC_API_KEY is missing", () => {
  let output = "";
  const env = { ...process.env };
  delete env.ANTHROPIC_API_KEY;

  try {
    output = execFileSync("node", ["index.js"], {
      timeout: 5000,
      encoding: "utf8",
      env,
    });
  } catch (err) {
    output = (err.stdout || "") + (err.stderr || "");
  }

  // The process should not silently succeed — it must print an error
  expect(output).not.toContain("✅ Report written to report.md");
});

test("prints the researching message before any agent work begins", () => {
  let output = "";
  try {
    output = execFileSync("node", ["index.js", "space exploration"], {
      timeout: 5000,
      encoding: "utf8",
      env: { ...process.env, ANTHROPIC_API_KEY: "invalid-key-for-unit-test" },
    });
  } catch (err) {
    output = (err.stdout || "") + (err.stderr || "");
  }

  // The topic line must appear at the very start of output (before any tool calls)
  const lines = output.split("\n").filter((l) => l.trim());
  const firstMeaningfulLine = lines[0] || "";
  expect(firstMeaningfulLine).toContain("🔎 Researching:");
});
  } catch (err) {
    // The process will fail due to invalid API key — that's fine.
    // We only care about the stdout printed before the error.
    output = (err.stdout || "") + (err.stderr || "");
  }

  expect(output).toContain('🔎 Researching: "latest developments in AI agents"');
});