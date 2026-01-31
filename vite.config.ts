import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
  plugins: [
    basicSsl(),
    monkey({
      entry: "src/main.ts",
      userscript: {
        name: "HackerWeb Collapse",
        namespace: "https://github.com/swhitt",
        description: "Collapsible nested comment threads for HackerWeb",
        match: ["https://hackerweb.app/*"],
        icon: "https://hackerweb.app/favicon.ico",
        grant: "none",
      },
      build: {
        fileName: "hackerweb-collapse.user.js",
      },
    }),
  ],
  build: {
    minify: false,
  },
});
