import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

async function loadSettingsPanel() {
  const ui = await import("./ui");
  const config = await import("../../../config");
  config.resetConfigStore();
  return { ...ui, ...config };
}

describe("settings panel", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    document.documentElement.className = "";
    document.head.innerHTML = "";
    document.body.innerHTML = "";
    document.body.style.overflow = "";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("behaves as an inert, labelled dialog while closed", async () => {
    const { createPanel } = await loadSettingsPanel();
    const panel = createPanel();

    expect(panel.getAttribute("role")).toBe("dialog");
    expect(panel.getAttribute("aria-modal")).toBe("true");
    expect(panel.getAttribute("aria-labelledby")).toBe("hwt-settings-title");
    expect(panel.getAttribute("aria-hidden")).toBe("true");
    expect(panel.inert).toBe(true);
  });

  it("opens, manages modal state, and restores launcher focus", async () => {
    const { createGearButton, createOverlay, createPanel, togglePanel } =
      await loadSettingsPanel();
    const gear = createGearButton();
    const overlay = createOverlay();
    const panel = createPanel();
    document.body.style.overflow = "clip";
    gear.focus();

    togglePanel(true);

    expect(panel.classList.contains("hwt-visible")).toBe(true);
    expect(panel.inert).toBe(false);
    expect(panel.getAttribute("aria-hidden")).toBe("false");
    expect(overlay.getAttribute("aria-hidden")).toBe("false");
    expect(gear.getAttribute("aria-expanded")).toBe("true");
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.activeElement).toBe(
      panel.querySelector("#hwt-settings-search")
    );

    togglePanel(false);

    expect(panel.inert).toBe(true);
    expect(panel.getAttribute("aria-hidden")).toBe("true");
    expect(gear.getAttribute("aria-expanded")).toBe("false");
    expect(document.body.style.overflow).toBe("clip");
    expect(document.activeElement).toBe(gear);
  });

  it("associates every rendered control with a visible label", async () => {
    const { createPanel } = await loadSettingsPanel();
    const panel = createPanel();
    const controls = panel.querySelectorAll<HTMLInputElement>(
      ".hwt-settings-row input"
    );

    expect(controls.length).toBeGreaterThan(0);
    for (const control of controls) {
      expect(control.id).not.toBe("");
      const label = panel.querySelector<HTMLLabelElement>(
        `label[for="${control.id}"]`
      );
      expect(label?.textContent.trim()).not.toBe("");
    }

    const toggle = panel.querySelector<HTMLInputElement>(
      '.hwt-toggle input[type="checkbox"]'
    );
    expect(toggle?.getAttribute("role")).toBe("switch");
    expect(toggle?.getAttribute("aria-describedby")).toBeTruthy();
  });

  it("only exposes settings that affect the current origin", async () => {
    const { createPanel } = await loadSettingsPanel();
    const panel = createPanel();
    const groupTitles = Array.from(
      panel.querySelectorAll(".hwt-settings-group-title")
    ).map((element) => element.textContent);

    // jsdom's default origin is treated as the HN test surface.
    expect(groupTitles).toContain("Available here");
    expect(groupTitles).toContain("Hacker News");
    expect(groupTitles).not.toContain("HackerWeb");
    expect(panel.textContent).toContain("Hacker News enhancements");
    expect(panel.textContent).not.toContain("HackerWeb enhancements");
    expect(panel.querySelector(".hwt-settings-overview")).toBeNull();
  });

  it("filters controls by feature, description, and site terms", async () => {
    const { createPanel } = await loadSettingsPanel();
    const panel = createPanel();
    const search = panel.querySelector<HTMLInputElement>(
      "#hwt-settings-search"
    );
    expect(search).not.toBeNull();

    if (!search) return;
    search.value = "favicons";
    search.dispatchEvent(new Event("input", { bubbles: true }));

    const visibleRows = Array.from(
      panel.querySelectorAll<HTMLElement>(".hwt-settings-row")
    ).filter((row) => !row.hidden);
    expect(visibleRows).toHaveLength(1);
    expect(visibleRows[0]?.textContent).toContain("Story favicons");

    search.value = "definitely-not-a-setting";
    search.dispatchEvent(new Event("input", { bubbles: true }));
    expect(
      panel.querySelector<HTMLElement>(".hwt-settings-empty")?.hidden
    ).toBe(false);
  });

  it("updates configuration and the active-feature summary", async () => {
    const { createPanel, getConfigStore } = await loadSettingsPanel();
    const panel = createPanel();
    const labels = Array.from(
      panel.querySelectorAll<HTMLLabelElement>(".hwt-settings-row-label")
    );
    const keyboardLabel = labels.find(
      (label) => label.textContent === "Keyboard nav"
    );
    const input = keyboardLabel
      ? panel.querySelector<HTMLInputElement>(`#${keyboardLabel.htmlFor}`)
      : null;

    expect(input?.checked).toBe(false);
    input?.click();

    expect(getConfigStore().get("features", "keyboardNav")).toBe(true);
    expect(
      panel.querySelector(".hwt-settings-active-count")?.textContent
    ).toContain("3 / 10 enabled");
    expect(
      panel.querySelector<HTMLElement>(".hwt-settings-reload")?.hidden
    ).toBe(false);
  });

  it("supports comma, slash, Escape, and focus trapping", async () => {
    const {
      createGearButton,
      createOverlay,
      createPanel,
      registerKeyboardShortcuts,
    } = await loadSettingsPanel();
    const gear = createGearButton();
    createOverlay();
    const panel = createPanel();
    const cleanup = registerKeyboardShortcuts();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "," }));
    expect(panel.getAttribute("aria-hidden")).toBe("false");

    const close = panel.querySelector<HTMLButtonElement>(".hwt-settings-close");
    const toggle = panel.querySelector<HTMLInputElement>(
      '.hwt-toggle input[type="checkbox"]'
    );
    toggle?.focus();
    toggle?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "/", bubbles: true })
    );
    expect(document.activeElement).toBe(
      panel.querySelector("#hwt-settings-search")
    );

    close?.focus();
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", shiftKey: true })
    );
    expect(panel.contains(document.activeElement)).toBe(true);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(panel.getAttribute("aria-hidden")).toBe("true");
    expect(document.activeElement).toBe(gear);
    cleanup();
  });
});
