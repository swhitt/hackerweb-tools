import { describe, expect, it } from "vitest";
import { CSS_HACKERWEB } from "./styles";

describe("HackerWeb dark styles", () => {
  it("themes the live comments containers behind spaced comment rows", () => {
    expect(CSS_HACKERWEB).toMatch(
      /html\.hwt-dark \.scroll,\s*html\.hwt-dark section\.comments,\s*html\.hwt-dark section\.comments > ul \{\s*background: #151517 !important;/
    );
  });
});
