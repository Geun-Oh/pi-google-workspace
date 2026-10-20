import assert from "node:assert/strict";
import { test } from "node:test";
import { launchOAuthBrowser } from "../oauth-browser.ts";

const url = "https://accounts.google.com/o/oauth2/v2/auth?client_id=test&state=test-state";

function harness(exec = async () => ({ code: 0, killed: false, stdout: "", stderr: "" })) {
  const messages = [];
  const notifications = [];
  const calls = [];
  const pi = {
    sendMessage(message) { messages.push(message); },
    async exec(...args) {
      // The fallback must already be visible before awaiting the launcher.
      assert.equal(messages.length, 1);
      calls.push(args);
      return exec(...args);
    },
  };
  const ui = { notify(...args) { notifications.push(args); } };
  return { pi, ui, messages, notifications, calls };
}

for (const [platform, command, args] of [
  ["linux", "xdg-open", [url]],
  ["darwin", "open", [url]],
  ["win32", "cmd", ["/c", "start", "", url]],
]) {
  test(`${platform}: launches with a timeout and a persistent fallback even on success`, async () => {
    const h = harness();
    await launchOAuthBrowser(h.pi, h.ui, url, platform);
    assert.deepEqual(h.calls, [[command, args, { timeout: 10_000 }]]);
    assert.equal(h.messages[0].display, true);
    assert.ok(h.messages[0].content.includes(url));
    assert.equal(h.messages[0].customType, "google-workspace-auth");
    assert.equal(h.notifications.filter(([, level]) => level === "warning").length, 0);
  });
}

for (const [name, exec, expected] of [
  ["nonzero exit", async () => ({ code: 3, killed: false, stderr: "No browser available" }), "No browser available"],
  ["timeout", async () => ({ code: 0, killed: true, stderr: "" }), "timed out"],
  ["launcher exception", async () => { throw new Error("spawn failed"); }, "spawn failed"],
  ["non-Error exception", async () => { throw "launcher unavailable"; }, "launcher unavailable"],
]) {
  test(`${name}: warns without preventing the caller from waiting for manual sign-in`, async () => {
    const h = harness(exec);
    await launchOAuthBrowser(h.pi, h.ui, url, "linux");
    const warnings = h.notifications.filter(([, level]) => level === "warning");
    assert.equal(warnings.length, 1);
    assert.ok(warnings[0][0].includes(expected));
    assert.ok(warnings[0][0].includes("manually"));
    assert.ok(h.messages[0].content.includes(url));
  });
}
