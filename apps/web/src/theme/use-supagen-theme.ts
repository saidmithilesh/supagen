import { useCallback, useEffect, useSyncExternalStore } from "react";

import {
  applySupagenTheme,
  DEFAULT_SUPAGEN_THEME,
  resolveSupagenTheme,
  persistSupagenTheme,
  type SupagenTheme,
  SUPAGEN_SYSTEM_THEME_QUERY,
  SUPAGEN_THEMES,
} from "./supagen-theme";

const SUPAGEN_THEME_CHANGE_EVENT = "supagen-theme-change";

function getNextTheme(theme: SupagenTheme): SupagenTheme {
  const index = SUPAGEN_THEMES.indexOf(theme);
  return SUPAGEN_THEMES[(index + 1) % SUPAGEN_THEMES.length];
}

function getClientTheme(): SupagenTheme {
  if (typeof window === "undefined") {
    return DEFAULT_SUPAGEN_THEME;
  }

  return resolveSupagenTheme(window.localStorage, window.matchMedia);
}

function getServerTheme(): SupagenTheme {
  return DEFAULT_SUPAGEN_THEME;
}

function subscribeToThemeChanges(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(SUPAGEN_THEME_CHANGE_EVENT, callback);

  const systemTheme =
    typeof window.matchMedia === "function"
      ? window.matchMedia(SUPAGEN_SYSTEM_THEME_QUERY)
      : null;
  systemTheme?.addEventListener?.("change", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SUPAGEN_THEME_CHANGE_EVENT, callback);
    systemTheme?.removeEventListener?.("change", callback);
  };
}

function notifyThemeChanged() {
  window.dispatchEvent(new Event(SUPAGEN_THEME_CHANGE_EVENT));
}

export function useSupagenTheme() {
  const theme = useSyncExternalStore(
    subscribeToThemeChanges,
    getClientTheme,
    getServerTheme,
  );

  useEffect(() => {
    applySupagenTheme(theme, document.documentElement);
  }, [theme]);

  const updateTheme = useCallback((nextTheme: SupagenTheme) => {
    persistSupagenTheme(nextTheme, window.localStorage);
    applySupagenTheme(nextTheme, document.documentElement);
    notifyThemeChanged();
  }, []);

  const cycleTheme = useCallback(() => {
    updateTheme(getNextTheme(getClientTheme()));
  }, [updateTheme]);

  return { theme, updateTheme, cycleTheme };
}
