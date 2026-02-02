import { init as initHackerweb } from "./sites/hackerweb";
import { init as initHN } from "./sites/hn";
import { initSettingsPanel } from "./sites/shared/settings-panel";
import { fullVersion } from "../config";
import {
  getConfigStore,
  runMigrations,
  isFeatureEnabled,
  DEFAULT_CONFIG,
} from "./config";
import type { ConfigSection, ConfigKey, UserConfig } from "./config";

// Initialize config system and run migrations
runMigrations();
const configStore = getConfigStore();

// Debug API for console access
interface HWTDebugAPI {
  version: string;
  loaded: string;
  config: UserConfig;
  defaults: UserConfig;
  set: <S extends ConfigSection>(
    section: S,
    key: ConfigKey<S>,
    value: UserConfig[S][ConfigKey<S>]
  ) => void;
  reset: <S extends ConfigSection>(section: S, key: ConfigKey<S>) => void;
  resetAll: () => void;
  export: () => string;
  import: (json: string) => boolean;
  isEnabled: (feature: keyof UserConfig["features"]) => boolean;
}

const debugAPI: HWTDebugAPI = {
  version: fullVersion,
  loaded: new Date().toISOString(),
  get config() {
    return configStore.getAll();
  },
  defaults: DEFAULT_CONFIG,
  set: (section, key, value) => configStore.set(section, key, value),
  reset: (section, key) => configStore.reset(section, key),
  resetAll: () => configStore.resetAll(),
  export: () => configStore.export(),
  import: (json) => configStore.import(json),
  isEnabled: (feature) => isFeatureEnabled(feature),
};

// Expose for console debugging: __HWT__
Object.assign(window, { __HWT__: debugAPI });
console.debug(`[HackerWeb Tools] v${fullVersion}`);

function main() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", route, { once: true });
  } else {
    route();
  }
}

function route() {
  const host = location.hostname;

  // Initialize settings panel on all supported sites
  if (host === "hackerweb.app" || host === "news.ycombinator.com") {
    initSettingsPanel();
  }

  if (host === "hackerweb.app") {
    initHackerweb();
  } else if (host === "news.ycombinator.com") {
    initHN();
  }
}

main();
