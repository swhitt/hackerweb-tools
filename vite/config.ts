import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";
import { updateUrl, gist, fullVersion } from "../config";

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
    emptyOutDir: false,
    sourcemap: true,
  },
});
