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
          "A power layer for Hacker News and HackerWeb: faster threads, focused reading, keyboard navigation, and saved comments",
        match: ["https://hackerweb.app/*", "https://news.ycombinator.com/*"],
        icon: "https://news.ycombinator.com/favicon.ico",
        updateURL: updateUrl,
        downloadURL: updateUrl,
        grant: "none",
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
