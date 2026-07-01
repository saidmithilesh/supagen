const MODALITY_ICON_BY_KEY = new Map([
  ["audio", "graphic_eq"],
  ["embedding", "hub"],
  ["embeddings", "hub"],
  ["file", "description"],
  ["image", "image"],
  ["rerank", "sort"],
  ["speech", "record_voice_over"],
  ["text", "article"],
  ["transcription", "subtitles"],
  ["video", "movie"],
]);
const MODALITY_ICON_COLOR_BY_KEY = new Map([
  ["audio", "text-amber-500"],
  ["embedding", "text-emerald-500"],
  ["embeddings", "text-emerald-500"],
  ["file", "text-muted-foreground"],
  ["image", "text-fuchsia-500"],
  ["rerank", "text-violet-500"],
  ["speech", "text-orange-500"],
  ["text", "text-sky-500"],
  ["transcription", "text-cyan-500"],
  ["video", "text-rose-500"],
]);
const RELEASE_DATE_MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function formatContextWindow(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return "-";
  }

  if (value >= 1_000_000) {
    return `${Math.round(value / 1_000_000)}M`;
  }

  return `${Math.max(1, Math.round(value / 1_000))}K`;
}

export function formatReleaseDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return value;
  }

  const releaseDate = new Date(timestamp);
  const monthLabel = RELEASE_DATE_MONTH_LABELS[releaseDate.getUTCMonth()];
  const day = String(releaseDate.getUTCDate()).padStart(2, "0");
  const year = releaseDate.getUTCFullYear();

  return `${monthLabel} ${day}, ${year}`;
}

export function getAuthorInitials(value: string | null) {
  if (!value) {
    return "?";
  }

  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function formatModalityName(value: string) {
  const normalized = value.trim().replace(/[_-]+/g, " ");

  if (!normalized) {
    return "Unknown";
  }

  return normalized.replace(/\b\w/g, (character) => character.toUpperCase());
}

export function getPrimaryOutputModality(outputModalities: string[]) {
  const normalizedOutputModalities = outputModalities.map(normalizeModalityKey);

  return (
    normalizedOutputModalities.find((key) => key !== "text") ??
    normalizedOutputModalities[0] ??
    "text"
  );
}

export function normalizeModalityKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");
}

export function splitPriceValue(value: string | null) {
  if (!value) {
    return null;
  }

  const slashIndex = value.indexOf("/");

  if (slashIndex === -1) {
    return {
      amount: value,
      unit: null,
    };
  }

  return {
    amount: value.slice(0, slashIndex),
    unit: value.slice(slashIndex + 1),
  };
}

export function getModalityIconName(value: string) {
  return MODALITY_ICON_BY_KEY.get(normalizeModalityKey(value)) ?? "category";
}

export function getModalityIconColorClassName(value: string) {
  return (
    MODALITY_ICON_COLOR_BY_KEY.get(normalizeModalityKey(value)) ??
    "text-muted-foreground"
  );
}
