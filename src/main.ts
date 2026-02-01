import { init as initHackerweb } from "./sites/hackerweb";
import { init as initHN } from "./sites/hn";
import { fullVersion } from "../config";

// Expose for console debugging: __HWT__
Object.assign(window, {
  __HWT__: { version: fullVersion, loaded: new Date().toISOString() },
});
console.debug(`[HackerWeb Tools] v${fullVersion}`);

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
