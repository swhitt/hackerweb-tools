const LINK_CLASS = "hn-links-header";

export function injectHeaderLink(): void {
  if (document.querySelector(`.${LINK_CLASS}`)) return;

  const pagetop = document.querySelector(".pagetop");
  if (!pagetop) return;

  const link = document.createElement("a");
  link.href = "https://hckrnews.com/";
  link.textContent = "hckrnews";
  link.className = LINK_CLASS;

  pagetop.append(" | ", link);
}
