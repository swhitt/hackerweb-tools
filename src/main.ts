import { init as initHackerweb } from "./sites/hackerweb";
import { init as initHN } from "./sites/hn";

function main() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", route);
  } else {
    route();
  }
}

function route() {
  const host = location.hostname;

  if (host === "hackerweb.app") {
    initHackerweb();
  } else if (host === "news.ycombinator.com") {
    initHN();
  }
}

main();
