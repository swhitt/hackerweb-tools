import { beforeEach, describe, expect, it } from "vitest";
import { injectOpBadges } from "./ui";

describe("HackerWeb OP badges", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("enhances HackerWeb's native original-poster marker", () => {
    document.body.innerHTML = `
      <div id="view-comments">
        <section class="comments">
          <ul><li>
            <p class="metadata">
              <a href="https://news.ycombinator.com/user?id=alice">
                <b class="user op" title="Original Poster">alice</b>
              </a>
            </p>
          </li></ul>
        </section>
      </div>
    `;

    injectOpBadges();
    injectOpBadges();

    const comment = document.querySelector("li");
    expect(comment?.getAttribute("data-is-op")).toBe("true");
    expect(comment?.querySelector(".hwt-op-badge")).toBeNull();
  });

  it("keeps support for legacy /user/:name markup", () => {
    document.body.innerHTML = `
      <header><div class="story"><a href="/user/alice">alice</a></div></header>
      <div id="view-comments">
        <section class="comments">
          <ul><li>
            <p class="metadata"><a href="/user/alice">alice</a></p>
          </li></ul>
        </section>
      </div>
    `;

    injectOpBadges();

    expect(document.querySelector("li")?.getAttribute("data-is-op")).toBe(
      "true"
    );
    expect(document.querySelector(".hwt-op-badge")?.textContent).toBe("OP");
  });
});
