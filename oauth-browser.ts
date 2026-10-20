import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";

/** Keep manual sign-in available even when the desktop launcher fails silently. */
export async function launchOAuthBrowser(
  pi: Pick<ExtensionAPI, "exec" | "sendMessage">,
  ui: Pick<ExtensionContext["ui"], "notify">,
  url: string,
  platform: NodeJS.Platform = process.platform,
) {
  // Notifications can be replaced by the next notification. Keep the link in the
  // transcript, including when the launcher reports success but opens no tab.
  pi.sendMessage({
    customType: "google-workspace-auth",
    content: `Google Workspace sign-in: if no browser tab opens, open this URL manually and complete consent within three minutes.\n\n${url}\n\nReturn to pi after the browser confirms authentication. Do not paste your client secret into the authorization-code prompt.`,
    display: true,
  });
  ui.notify("Opening your browser to start Google authentication...", "info");

  const command = platform === "darwin" ? "open" : platform === "win32" ? "cmd" : "xdg-open";
  const args = platform === "win32" ? ["/c", "start", "", url] : [url];
  try {
    const result = await pi.exec(command, args, { timeout: 10_000 });
    if (result.killed || result.code !== 0) {
      throw new Error(result.stderr.trim() || `${command} failed or timed out (exit ${result.code}).`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    ui.notify(`Browser launch failed: ${message} Open the sign-in URL in the chat manually.`, "warning");
  }
}
