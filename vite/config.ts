import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";
import { updateUrl, gist, fullVersion } from "../config";

const repositoryUrl = "https://github.com/swhitt/hackerweb-tools";

export default defineConfig({
  plugins: [
    monkey({
      entry: "src/main.ts",
      userscript: {
        name: "HackerWeb Tools",
        namespace: "https://github.com/swhitt",
        version: fullVersion,
        author: "Steve Whittaker",
        license: "MIT",
        homepageURL: repositoryUrl,
        source: repositoryUrl,
        description:
          "A userscript for Hacker News and HackerWeb with thread controls, readable layouts, keyboard navigation, and Saved",
        match: ["https://hackerweb.app/*", "https://news.ycombinator.com/*"],
        icon: "https://news.ycombinator.com/favicon.ico",
        updateURL: updateUrl,
        downloadURL: updateUrl,
        grant: ["GM_getValue", "GM_setValue", "GM_addValueChangeListener"],
        "run-at": "document-end",
        noframes: true,
      },
      build: {
        fileName: gist.filename,
      },
    }),
  ],
  build: {
    minify: false,
    emptyOutDir: true,
    sourcemap: false,
  },
});
