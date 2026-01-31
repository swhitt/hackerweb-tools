import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";

export default defineConfig({
  plugins: [
    monkey({
      entry: "src/userscripts/hn-links/main.ts",
      userscript: {
        name: "HN Links",
        namespace: "https://github.com/swhitt",
        version: "1.0.0",
        description: "Quick links to HackerWeb and hckrnews from Hacker News",
        match: ["https://news.ycombinator.com/*"],
        icon: "https://news.ycombinator.com/favicon.ico",
        grant: "none",
      },
      build: {
        fileName: "hn-links.user.js",
      },
    }),
  ],
  build: {
    minify: false,
    emptyOutDir: false,
  },
});
