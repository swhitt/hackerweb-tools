import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";

export default defineConfig({
  plugins: [
    monkey({
      entry: "src/userscripts/hackerweb-collapse/main.ts",
      userscript: {
        name: "HackerWeb Collapse",
        namespace: "https://github.com/swhitt",
        version: "1.0.0",
        description:
          "Collapsible nested comment threads with shift+click, left-gutter click, and hover highlighting",
        match: ["https://hackerweb.app/*"],
        icon: "https://hackerweb.app/favicon.ico",
        grant: "none",
        updateURL:
          "https://gist.githubusercontent.com/swhitt/0fcf80442f2c0b55c01a90fa3a512df6/raw/hackerweb-collapse.user.js",
        downloadURL:
          "https://gist.githubusercontent.com/swhitt/0fcf80442f2c0b55c01a90fa3a512df6/raw/hackerweb-collapse.user.js",
      },
      build: {
        fileName: "hackerweb-collapse.user.js",
      },
    }),
  ],
  build: {
    minify: false,
    emptyOutDir: false,
  },
});
