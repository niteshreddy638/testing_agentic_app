/**
 * Additional test: numeric-only topic input handling.
 * Verifies that a purely numeric CLI argument is accepted and echoed correctly.
 */

import { test, expect } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const ROOT = resolve(process.cwd());
const LOADER_FLAG = `--import=${resolve(ROOT, "tests/mock-loader.js")}`;

function runAgent(args = [], env = {}) {
  return spawnSync(
    process.execPath,
    [LOADER_FLAG, resolve(ROOT, "index.js"), ...args],
    {
      cwd: ROOT,
      env: {
        ...process.env,
        ANTHROPIC_API_KEY: "test-key-123",
        MOCK_SDK_MODE: "success",
        ...env,
      },
      encoding: "utf8",
      timeout: 15000,
    }
  );
}

test("numeric-only topic is echoed correctly", () => {
  const result = runAgent(["42"]);
  expect(result.stdout).toContain('🔎 Researching: "42"');
});