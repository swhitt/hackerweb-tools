// Version: bump `build` for each gist push, `version` for releases
export const version = "0.0.1";
export const build = 3;
export const fullVersion = `${version}-${build}`;

/** Gist configuration for userscript auto-updates */
interface GistConfig {
  readonly user: string;
  readonly id: string;
  readonly filename: string;
}

// Fork this repo? Update these values to point to your own gist
export const gist: GistConfig = {
  user: "swhitt",
  id: "0fcf80442f2c0b55c01a90fa3a512df6",
  filename: "hackerweb-tools.user.js",
};

export const updateUrl = `https://gist.githubusercontent.com/${gist.user}/${gist.id}/raw/${gist.filename}`;
