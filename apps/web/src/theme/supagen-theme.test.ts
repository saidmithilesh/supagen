import { describe, expect, it } from "vitest";

import {
  DEFAULT_SUPAGEN_THEME,
  getSupagenThemeInitScript,
  getSystemSupagenTheme,
  readStoredSupagenTheme,
  resolveSupagenTheme,
  SUPAGEN_THEMES,
  SUPAGEN_SYSTEM_THEME_QUERY,
  SUPAGEN_THEME_STORAGE_KEY,
} from "./supagen-theme";

const createMatchMedia =
  (matches: boolean): Window["matchMedia"] =>
  (query) =>
    ({
      matches,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }) as unknown as MediaQueryList;

describe("Supagen theme", () => {
  it("includes all supported themes in the pre-hydration script", () => {
    const initScript = getSupagenThemeInitScript();

    for (const theme of SUPAGEN_THEMES) {
      expect(initScript).toContain(theme);
    }

    expect(initScript).toContain(SUPAGEN_THEME_STORAGE_KEY);
    expect(initScript).toContain(SUPAGEN_SYSTEM_THEME_QUERY);
  });

  it("reads valid stored themes", () => {
    expect(readStoredSupagenTheme({ getItem: () => "dark-warm" })).toBe(
      "dark-warm",
    );
  });

  it("ignores invalid stored themes", () => {
    expect(readStoredSupagenTheme({ getItem: () => "sepia" })).toBeNull();
  });

  it("uses the system theme when there is no stored theme", () => {
    expect(resolveSupagenTheme(null, createMatchMedia(true))).toBe("dark");
    expect(resolveSupagenTheme(null, createMatchMedia(false))).toBe("light");
  });

  it("keeps stored dark-warm instead of resolving from the system", () => {
    expect(
      resolveSupagenTheme(
        { getItem: () => "dark-warm" },
        createMatchMedia(false),
      ),
    ).toBe("dark-warm");
  });

  it("falls back to light when system theme is unavailable", () => {
    expect(getSystemSupagenTheme(null)).toBe(DEFAULT_SUPAGEN_THEME);
  });
});
