export const SUPAGEN_THEMES = ["light", "dark", "dark-warm"] as const;

export type SupagenTheme = (typeof SUPAGEN_THEMES)[number];

export const SUPAGEN_THEME_STORAGE_KEY = "supagen-theme";
export const DEFAULT_SUPAGEN_THEME: SupagenTheme = "light";
export const SUPAGEN_SYSTEM_THEME_QUERY = "(prefers-color-scheme: dark)";

type ThemeStorage = Pick<Storage, "getItem" | "setItem">;
type ThemeMediaMatcher = Pick<Window, "matchMedia">["matchMedia"];

export function isSupagenTheme(value: unknown): value is SupagenTheme {
  return (
    typeof value === "string" && SUPAGEN_THEMES.includes(value as SupagenTheme)
  );
}

export function getSystemSupagenTheme(
  matchMedia: ThemeMediaMatcher | null | undefined,
): SupagenTheme {
  if (!matchMedia) {
    return DEFAULT_SUPAGEN_THEME;
  }

  try {
    return matchMedia(SUPAGEN_SYSTEM_THEME_QUERY).matches ? "dark" : "light";
  } catch {
    return DEFAULT_SUPAGEN_THEME;
  }
}

export function readStoredSupagenTheme(
  storage: Pick<ThemeStorage, "getItem"> | null | undefined,
): SupagenTheme | null {
  if (!storage) {
    return null;
  }

  try {
    const storedTheme = storage.getItem(SUPAGEN_THEME_STORAGE_KEY);

    return isSupagenTheme(storedTheme) ? storedTheme : null;
  } catch {
    return null;
  }
}

export function resolveSupagenTheme(
  storage: Pick<ThemeStorage, "getItem"> | null | undefined,
  matchMedia: ThemeMediaMatcher | null | undefined,
): SupagenTheme {
  return readStoredSupagenTheme(storage) ?? getSystemSupagenTheme(matchMedia);
}

export function applySupagenTheme(
  theme: SupagenTheme,
  target: Pick<HTMLElement, "classList" | "dataset">,
) {
  target.classList.remove(...SUPAGEN_THEMES);
  target.classList.add(theme);
  target.dataset.theme = theme;
}

export function persistSupagenTheme(
  theme: SupagenTheme,
  storage: Pick<ThemeStorage, "setItem"> | null | undefined,
) {
  if (!storage) {
    return;
  }

  storage.setItem(SUPAGEN_THEME_STORAGE_KEY, theme);
}

export function getSupagenThemeInitScript() {
  const themes = JSON.stringify(SUPAGEN_THEMES);
  const storageKey = JSON.stringify(SUPAGEN_THEME_STORAGE_KEY);
  const fallbackTheme = JSON.stringify(DEFAULT_SUPAGEN_THEME);
  const systemThemeQuery = JSON.stringify(SUPAGEN_SYSTEM_THEME_QUERY);

  return `(() => {
  const themes = ${themes};
  const fallbackTheme = ${fallbackTheme};
  const systemThemeQuery = ${systemThemeQuery};
  const getSystemTheme = () => {
    try {
      return window.matchMedia(systemThemeQuery).matches ? "dark" : fallbackTheme;
    } catch {
      return fallbackTheme;
    }
  };
  const applyTheme = (theme) => {
    const root = document.documentElement;
    root.classList.remove(...themes);
    root.classList.add(theme);
    root.dataset.theme = theme;
  };

  try {
    const storedTheme = window.localStorage.getItem(${storageKey});
    applyTheme(themes.includes(storedTheme) ? storedTheme : getSystemTheme());
  } catch {
    applyTheme(getSystemTheme());
  }
})();`;
}
