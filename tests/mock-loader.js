/**
 * Node.js ES Module loader hook.
 * Intercepts imports of @anthropic-ai/claude-agent-sdk and redirects
 * them to our local mock, so index.js can be tested without live API calls.
 *
 * Usage: node --import ./tests/mock-loader.js index.js
 */

import { pathToFileURL } from "node:url";
import { resolve as pathResolve } from "node:path";

const MOCK_SPECIFIER = "@anthropic-ai/claude-agent-sdk";
const MOCK_PATH = pathToFileURL(
  pathResolve(process.cwd(), "tests/mocks/claude-agent-sdk.mock.js")
).href;

export async function resolve(specifier, context, nextResolve) {
  if (specifier === MOCK_SPECIFIER) {
    return { shortCircuit: true, url: MOCK_PATH };
  }
  return nextResolve(specifier, context);
}