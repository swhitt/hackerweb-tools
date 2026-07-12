import { beforeEach, describe, expect, it } from "vitest";
import {
  extractComment,
  extractHackerWebStory,
  extractHnStory,
} from "./adapters";

describe("Saved host adapters", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("extracts an HN story", () => {
    document.body.innerHTML = `
      <table><tbody>
        <tr class="athing" id="123"><td class="titleline"><a href="https://example.com/post">A useful post</a></td></tr>
        <tr><td class="subtext"><span class="score">42 points</span> by <a class="hnuser">alice</a></td></tr>
      </tbody></table>`;

    const story = document.querySelector(".athing");
    expect(story).not.toBeNull();
    if (!story) return;
    expect(extractHnStory(story)).toMatchObject({
      key: "hn:123",
      kind: "story",
      title: "A useful post",
      author: "alice",
      sourceUrl: "https://example.com/post",
    });
  });

  it("extracts a HackerWeb story row", () => {
    document.body.innerHTML = `
      <ul id="hwlist"><li id="story-456">
        <a href="https://example.com"><div class="story"><b>HW story</b><div class="metadata">12 points by bob</div></div></a>
        <a class="detail-disclosure-button" href="#/item/456"></a>
      </li></ul>`;

    const story = document.querySelector("#story-456");
    expect(story).not.toBeNull();
    if (!story) return;
    expect(extractHackerWebStory(story)).toMatchObject({
      key: "hn:456",
      kind: "story",
      title: "HW story",
      author: "bob",
    });
  });

  it("skips HackerWeb's empty spacer paragraph when saving a comment", () => {
    document.body.innerHTML = `
      <div id="view-comments"><div class="post-content"><header><h1>Discussion</h1></header></div>
        <section class="comments"><ul><li>
          <p class="metadata"><b class="user">carol</b><time><a href="https://news.ycombinator.com/item?id=789">now</a></time></p>
          <p></p><p>The actual comment text.</p>
        </li></ul></section>
      </div>`;

    const comment = document.querySelector("section.comments li");
    expect(comment).not.toBeNull();
    if (!comment) return;
    expect(extractComment(comment, "hackerweb")).toMatchObject({
      key: "hn:789",
      kind: "comment",
      title: "Discussion",
      author: "carol",
      text: "The actual comment text.",
    });
  });
});
