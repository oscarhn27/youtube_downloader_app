import { test, expect } from "@playwright/test";
import { escapeHtml } from "../../renderer/src/utils";
import { isValidYouTubeUrl } from "../../renderer/src/validation.js";

const { describe, beforeEach } = test;

describe("Unit - utilidades del renderer (navegador)", () => {
  test("isValidYouTubeUrl", async () => {
    const results = [
      "https://www.youtube.com/watch?v=abc",
      "https://youtu.be/abc",
      "https://youtube.com/embed/abc",
      "https://example.com/watch?v=abc",
      "notaurl",
    ].map(isValidYouTubeUrl);
    expect(results[0]).toBeTruthy();
    expect(results[1]).toBeTruthy();
    expect(results[2]).toBeTruthy();
    expect(results[3]).toBeFalsy();
    expect(results[4]).toBeFalsy();
  });

  test("escapeHtml", async ({ page }) => {
    const escaped = escapeHtml('<div x="1">&"\'"</div>');
    expect(escaped).toContain("&lt;div");
    expect(escaped).toContain("&amp;");
    expect(escaped).toContain("&quot;");
    expect(escaped).toContain("&#039;");
  });
});
