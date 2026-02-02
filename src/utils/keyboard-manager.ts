/**
 * Central keyboard binding registry.
 * Manages shortcuts across features, prevents conflicts, and handles focus state.
 */

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
type KeyHandler = (event: KeyboardEvent) => void | boolean;

interface KeyBinding {
  key: string;
  handler: KeyHandler;
  description: string;
  scope: "hackerweb" | "hn" | "global";
  priority: number;
}

const TEXT_INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

/**
 * Check if the user is focused in a text input
 */
function isTextInputFocused(): boolean {
  const active = document.activeElement;
  if (!active) return false;

  if (TEXT_INPUT_TAGS.has(active.tagName)) return true;
  if (active.getAttribute("contenteditable") === "true") return true;

  return false;
}

/**
 * Parse a key string like "ctrl+k" or "shift+?" into normalized format
 */
function normalizeKey(key: string): string {
  return key.toLowerCase().trim();
}

/**
 * Check if a keyboard event matches a key binding
 */
function eventMatchesKey(event: KeyboardEvent, key: string): boolean {
  const parts = normalizeKey(key).split("+");
  const mainKey = parts.pop() ?? "";
  const modifiers = new Set(parts);

  // Check main key
  const eventKey = event.key.toLowerCase();
  if (eventKey !== mainKey && event.code.toLowerCase() !== mainKey) {
    return false;
  }

  // Check modifiers
  if (modifiers.has("ctrl") !== event.ctrlKey) return false;
  if (modifiers.has("alt") !== event.altKey) return false;
  if (modifiers.has("shift") !== event.shiftKey) return false;
  if (modifiers.has("meta") !== event.metaKey) return false;

  return true;
}

class KeyboardManager {
  private bindings = new Map<string, KeyBinding>();
  private enabled = true;
  private currentScope: "hackerweb" | "hn" | "global" = "global";
  private initialized = false;
  private boundHandler: ((event: KeyboardEvent) => void) | null = null;

  /**
   * Initialize the keyboard manager (call once on startup)
   */
  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    this.boundHandler = (event) => this.handleKeydown(event);
    document.addEventListener("keydown", this.boundHandler);
  }

  /**
   * Clean up event listeners (for testing and hot reload)
   */
  destroy(): void {
    if (this.boundHandler) {
      document.removeEventListener("keydown", this.boundHandler);
      this.boundHandler = null;
    }
    this.bindings.clear();
    this.initialized = false;
  }

  /**
   * Set the current site scope
   */
  setScope(scope: "hackerweb" | "hn"): void {
    this.currentScope = scope;
  }

  /**
   * Register a keyboard shortcut
   * @param key Key combination like "j", "shift+?", "ctrl+k"
   * @param handler Function to call when key is pressed. Return false to prevent default.
   * @param options Configuration options
   */
  register(
    key: string,
    handler: KeyHandler,
    options: {
      description: string;
      scope?: "hackerweb" | "hn" | "global";
      priority?: number;
    }
  ): () => void {
    const normalized = normalizeKey(key);
    const scope = options.scope ?? "global";
    const id = `${scope}:${normalized}`;

    const binding: KeyBinding = {
      key: normalized,
      handler,
      description: options.description,
      scope,
      priority: options.priority ?? 0,
    };

    // Check for conflicts
    const existing = this.bindings.get(id);
    if (existing) {
      console.warn(
        `[HWT Keys] Overwriting binding for ${key} in scope ${scope}`
      );
    }

    this.bindings.set(id, binding);

    // Return unregister function
    return () => {
      this.bindings.delete(id);
    };
  }

  /**
   * Unregister all bindings for a scope
   */
  unregisterScope(scope: "hackerweb" | "hn" | "global"): void {
    for (const [id, binding] of this.bindings) {
      if (binding.scope === scope) {
        this.bindings.delete(id);
      }
    }
  }

  /**
   * Enable or disable keyboard handling
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Get all registered bindings (for help display)
   */
  getBindings(): KeyBinding[] {
    return Array.from(this.bindings.values()).filter(
      (b) => b.scope === "global" || b.scope === this.currentScope
    );
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (!this.enabled) return;

    // Don't handle when typing in inputs
    if (isTextInputFocused()) return;

    // Find matching bindings for current scope
    const matches: KeyBinding[] = [];

    for (const binding of this.bindings.values()) {
      if (binding.scope !== "global" && binding.scope !== this.currentScope) {
        continue;
      }

      if (eventMatchesKey(event, binding.key)) {
        matches.push(binding);
      }
    }

    if (matches.length === 0) return;

    // Sort by priority (higher first) and call the first match
    matches.sort((a, b) => b.priority - a.priority);
    const binding = matches[0];
    if (!binding) return;

    try {
      const result = binding.handler(event);
      // If handler returns false explicitly, prevent default
      if (result === false) {
        event.preventDefault();
        event.stopPropagation();
      }
    } catch (error) {
      console.error(`[HWT Keys] Error in handler for "${binding.key}":`, error);
    }
  }
}

// Singleton instance
let instance: KeyboardManager | null = null;

/**
 * Get the singleton KeyboardManager instance
 */
export function getKeyboardManager(): KeyboardManager {
  instance ??= new KeyboardManager();
  return instance;
}

/**
 * Reset the singleton for testing
 */
export function resetKeyboardManager(): void {
  instance?.destroy();
  instance = null;
}
