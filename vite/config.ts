import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";

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
        grant: "none",
      },
      build: {
        fileName: "hackerweb-tools.user.js",
      },
    }),
  ],
  build: {
    minify: false,
    emptyOutDir: false,
  },
});
