import { qs } from "../../../utils/dom-helpers";
import { makeSavedKey, type SavedItem, type SavedItemKind } from "./store";

export type SavedSite = "hackerweb" | "hn";

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function truncate(value: string, maxLength = 320): string {
  const text = normalizeText(value);
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function getAuthorFromMetadata(metadata: Element | null): string {
  const user = metadata?.querySelector(".hnuser, .user")?.textContent;
  if (user) return normalizeText(user);
  return /\bby\s+([^\s·]+)/i.exec(metadata?.textContent ?? "")?.[1] ?? "";
}

function getMetadataSnapshot(metadata: Element | null): string {
  if (!metadata) return "";
  const copy = metadata.cloneNode(true);
  if (!(copy instanceof Element)) return "";
  for (const control of copy.querySelectorAll(".hwt-save-btn")) {
    control.remove();
  }
  return normalizeText(copy.textContent).replace(/\s*\|\s*$/, "");
}

function makeItem(
  id: string,
  kind: SavedItemKind,
  site: SavedSite,
  fields: Pick<SavedItem, "title" | "text" | "author"> & {
    sourceUrl?: string | undefined;
  }
): SavedItem {
  const item: SavedItem = {
    key: makeSavedKey(kind, id),
    id,
    kind,
    url: `https://news.ycombinator.com/item?id=${id}`,
    title:
      truncate(fields.title, 240) ||
      `${kind === "story" ? "Story" : "Comment"} #${id}`,
    text: truncate(fields.text),
    author: truncate(fields.author, 80),
    source: site,
    savedAt: Date.now(),
  };
  if (fields.sourceUrl) item.sourceUrl = fields.sourceUrl;
  return item;
}

export function extractHnStory(row: Element): SavedItem | null {
  const id = row.id;
  if (!id) return null;
  const titleLink = qs<HTMLAnchorElement>(".titleline > a", row);
  const subtext = row.nextElementSibling?.querySelector(".subtext") ?? null;

  return makeItem(id, "story", "hn", {
    title: titleLink?.textContent ?? "",
    text: getMetadataSnapshot(subtext),
    author: getAuthorFromMetadata(subtext),
    sourceUrl: titleLink?.href,
  });
}

export function extractHackerWebStory(container: Element): SavedItem | null {
  const idFromRow = /^story-(\d+)$/.exec(container.id)?.[1];
  const itemLink = qs<HTMLAnchorElement>(
    'a[href*="item/"], a[href*="item?id="]',
    container
  );
  const idFromLink = /(?:item\/|item\?id=)(\d+)/.exec(
    itemLink?.href ?? ""
  )?.[1];
  const id = idFromRow ?? idFromLink;
  if (!id) return null;

  const metadata = qs(".metadata", container);
  const sourceLink = qs<HTMLAnchorElement>(
    ":scope > a:not(.detail-disclosure-button), header > a[href]",
    container
  );
  return makeItem(id, "story", "hackerweb", {
    title: qs(".story b, h1", container)?.textContent ?? "",
    text: getMetadataSnapshot(metadata),
    author: getAuthorFromMetadata(metadata),
    sourceUrl: sourceLink?.href,
  });
}

export function extractComment(
  comment: Element,
  site: SavedSite
): SavedItem | null {
  const timeLink = qs<HTMLAnchorElement>(
    site === "hn"
      ? '.comhead a[href*="item?id="]'
      : 'p.metadata time a[href*="item?id="]',
    comment
  );
  const id = /item\?id=(\d+)/.exec(timeLink?.href ?? "")?.[1];
  if (!id) return null;

  const metadata = qs(site === "hn" ? ".comhead" : "p.metadata", comment);
  const text =
    site === "hn"
      ? (qs(".commtext", comment)?.textContent ?? "")
      : Array.from(
          comment.querySelectorAll(":scope > p:not(.metadata), :scope > pre")
        )
          .map((element) => normalizeText(element.textContent))
          .filter(Boolean)
          .join(" ");
  const title =
    site === "hn"
      ? (qs(".fatitem .titleline > a")?.textContent ?? document.title)
      : (qs("#view-comments .post-content header h1")?.textContent ??
        document.title);

  return makeItem(id, "comment", site, {
    title,
    text,
    author: getAuthorFromMetadata(metadata),
  });
}
