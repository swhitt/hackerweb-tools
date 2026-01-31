import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";
import { updateUrl, gist } from "../config";

export default defineConfig({
  plugins: [
    monkey({
      entry: "src/main.ts",
      userscript: {
        name: "HackerWeb Tools",
        namespace: "https://github.com/swhitt",
        version: "1.0.0",
        description:
          "Enhancements for Hacker News and HackerWeb: collapsible comments, quick navigation links",
        match: ["https://hackerweb.app/*", "https://news.ycombinator.com/*"],
        icon: "https://news.ycombinator.com/favicon.ico",
        updateURL: updateUrl,
        downloadURL: updateUrl,
        grant: "none",
      },
      build: {
        fileName: gist.filename,
      },
    }),
  ],
  build: {
    minify: false,
    emptyOutDir: false,
  },
});
