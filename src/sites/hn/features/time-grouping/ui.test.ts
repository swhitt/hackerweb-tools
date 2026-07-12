import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CSS_HN } from "../../../shared/dark-mode/styles";
import { addTimeGrouping } from "./ui";

function createStory(id: string, visibleAge: string, timestamp: string): void {
  const list = document.querySelector("#story-list");
  if (!list) throw new Error("Story list fixture is missing");

  const story = document.createElement("tr");
  story.className = "athing";
  story.id = id;

  const metadata = document.createElement("tr");
  const cell = document.createElement("td");
  const age = document.createElement("span");
  age.className = "age";
  age.title = timestamp;
  age.textContent = visibleAge;
  cell.appendChild(age);
  metadata.appendChild(cell);
  list.append(story, metadata);
}

describe("time grouping", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <table id="hnmain">
        <tbody><tr><td>
          <table class="header"><tbody><tr><td>Navigation</td></tr></tbody></table>
          <table class="itemlist"><tbody id="story-list"></tbody></table>
        </td></tr></tbody>
      </table>
    `;
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-12T18:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("prefers HN's visible relative age over its absolute title", () => {
    createStory("1", "20 minutes ago", "2026-07-12T10:00:00Z");

    addTimeGrouping();

    const group = document.querySelector(".hwt-time-group");
    expect(group?.textContent).toBe("Just now");
  });

  it("falls back to parsing an absolute timestamp", () => {
    createStory("1", "", "2026-07-12T16:30:00Z");

    addTimeGrouping();

    const group = document.querySelector(".hwt-time-group");
    expect(group?.textContent).toBe("Today");
  });

  it("inserts one header per contiguous age band and stays idempotent", () => {
    createStory("1", "10 minutes ago", "2026-07-12T17:50:00Z");
    createStory("2", "45 minutes ago", "2026-07-12T17:15:00Z");
    createStory("3", "3 hours ago", "2026-07-12T15:00:00Z");

    addTimeGrouping();
    addTimeGrouping();

    const labels = Array.from(document.querySelectorAll(".hwt-time-group")).map(
      (group) => group.textContent
    );
    expect(labels).toEqual(["Just now", "Past hour", "Today"]);
  });

  it("keeps grouped cells themed in HN dark mode", () => {
    expect(CSS_HN).toContain("html.hwt-dark .hwt-time-group > td");
  });
});
