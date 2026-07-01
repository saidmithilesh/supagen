import type { ModelCatalogModel } from "../domain/model-catalog-model";

const OPENROUTER_BASE_URL = "https://openrouter.ai";
const OPENROUTER_ICON_BASE_URL = `${OPENROUTER_BASE_URL}/images/icons/`;
const AUTHOR_ICON_URLS_BY_KEY = new Map(
  [
    ["openai", "OpenAI.svg"],
    ["anthropic", "Anthropic.svg"],
    ["google", "GoogleGemini.svg"],
    ["qwen", "Qwen.png"],
    [
      "alibaba",
      "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.alibabacloud.com/&size=256",
    ],
    ["cohere", "Cohere.png"],
    [
      "nvidia",
      "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.nvidia.com/en-us/&size=256",
    ],
    [
      "xai",
      "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://x.ai/&size=256",
    ],
    [
      "x-ai",
      "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://x.ai/&size=256",
    ],
    ["meta", "Meta.png"],
    ["metallama", "Meta.png"],
    ["meta-llama", "Meta.png"],
    ["mistral", "Mistral.png"],
    ["mistralai", "Mistral.png"],
    ["deepseek", "DeepSeek.png"],
    ["deepseekai", "DeepSeek.png"],
    ["deepseek-ai", "DeepSeek.png"],
    ["moonshotai", "MoonshotAI.png"],
    ["moonshot", "MoonshotAI.png"],
    [
      "zai",
      "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://z.ai/model-api&size=256",
    ],
    [
      "z-ai",
      "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://z.ai/model-api&size=256",
    ],
    ["perplexity", "Perplexity.svg"],
    ["microsoft", "Microsoft.svg"],
    ["amazon", "Bedrock.svg"],
    [
      "blackforestlabs",
      "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://bfl.ai&size=256",
    ],
    [
      "black-forest-labs",
      "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://bfl.ai&size=256",
    ],
    [
      "stabilityai",
      "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://stability.ai/&size=256",
    ],
    [
      "stability-ai",
      "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://stability.ai/&size=256",
    ],
    [
      "minimax",
      "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://minimaxi.com/&size=256",
    ],
    [
      "sakana",
      "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://sakana.ai/&size=256",
    ],
  ].map(([key, value]) => [key, normalizeAuthorIconUrl(value)] as const),
);
const INPUT_DISPLAY_LABELS = [
  "Text Input",
  "Input Price",
  "Input",
  "Prompt",
  "Prompt Price",
  "Search units",
  "Characters",
  "Audio Minutes",
  "Audio Hours",
  "Audio Seconds",
  "Audio Minute",
  "Audio Hour",
  "Audio Second",
];
const OUTPUT_DISPLAY_LABELS = [
  "Image Output",
  "Output Image",
  "Output Audio",
  "Song Generation",
  "Video (with audio)",
  "Video Generation",
  "Video Output",
  "Text to Video",
  "Video (no audio)",
  "Output Price",
  "Completion Price",
  "Completion",
];

export function mapOpenRouterCatalogModels(
  payload: unknown,
): ModelCatalogModel[] {
  const records = getCatalogRecords(payload);
  const models: ModelCatalogModel[] = [];

  for (const record of records) {
    const model = mapOpenRouterCatalogModel(record);

    if (model) {
      models.push(model);
    }
  }

  return models;
}

function mapOpenRouterCatalogModel(
  record: Record<string, unknown>,
): ModelCatalogModel | null {
  const endpoint = asRecord(record.endpoint);

  if (!endpoint) {
    return null;
  }

  const slug = asString(record.slug);
  const permaslug = asString(record.permaslug) ?? slug;

  if (!slug || !permaslug) {
    return null;
  }

  if (isOpenRouterInternalModel(slug) || isOpenRouterInternalModel(permaslug)) {
    return null;
  }

  const modelNameParts = getModelNameParts(record);
  const authorName = getAuthorName(record, endpoint, modelNameParts.authorName);

  return {
    slug,
    permaslug,
    displayName:
      modelNameParts.displayName ??
      asString(record.short_name) ??
      asString(record.name) ??
      permaslug,
    description: asString(record.description),
    authorName,
    authorIconUrl: getAuthorIconUrl(record, endpoint, authorName),
    inputModalities: asStringArray(record.input_modalities),
    outputModalities: asStringArray(record.output_modalities),
    releaseDate: asString(record.release_date) ?? asString(record.created_at),
    inputPrice: getDisplayPrice(endpoint, INPUT_DISPLAY_LABELS, "prompt"),
    outputPrice: getDisplayPrice(endpoint, OUTPUT_DISPLAY_LABELS, "completion"),
    contextWindowSize:
      asNumber(endpoint.context_length) ?? asNumber(record.context_length),
  };
}

function getCatalogRecords(payload: unknown): Array<Record<string, unknown>> {
  const data = asRecord(payload)?.data;

  if (!Array.isArray(data)) {
    return [];
  }

  return data.filter(isRecord);
}

function getAuthorName(
  record: Record<string, unknown>,
  endpoint: Record<string, unknown>,
  parsedAuthorName: string | null,
) {
  const providerInfo = asRecord(endpoint.provider_info);

  return (
    parsedAuthorName ??
    asString(record.author_display_name) ??
    asString(record.author) ??
    asString(providerInfo?.displayName) ??
    asString(providerInfo?.name)
  );
}

function getModelNameParts(record: Record<string, unknown>) {
  const name = asString(record.name);

  if (!name) {
    return { authorName: null, displayName: null };
  }

  const separatorIndex = name.indexOf(":");

  if (separatorIndex === -1) {
    return { authorName: null, displayName: null };
  }

  const authorName = name.slice(0, separatorIndex).trim() || null;
  const displayName = name.slice(separatorIndex + 1).trim() || null;

  return { authorName, displayName };
}

function getAuthorIconUrl(
  record: Record<string, unknown>,
  endpoint: Record<string, unknown>,
  authorName: string | null,
) {
  const authorKeys = getAuthorKeys(record, authorName);

  for (const key of authorKeys) {
    const iconUrl = AUTHOR_ICON_URLS_BY_KEY.get(key);

    if (iconUrl) {
      return iconUrl;
    }
  }

  const endpointIconUrl = normalizeOpenRouterUrl(
    asString(asRecord(asRecord(endpoint.provider_info)?.icon)?.url),
  );

  return endpointIconUrlMatchesAuthor(endpointIconUrl, authorKeys)
    ? endpointIconUrl
    : null;
}

function getAuthorKeys(
  record: Record<string, unknown>,
  authorName: string | null,
) {
  const keys = [
    authorName,
    asString(record.author_display_name),
    asString(record.author),
  ]
    .flatMap((value) => getNormalizedAuthorKeys(value))
    .filter((key): key is string => Boolean(key));

  return [...new Set(keys)];
}

function getDisplayPrice(
  endpoint: Record<string, unknown>,
  displayLabels: string[],
  pricingKey: "completion" | "prompt",
) {
  const displayPricing = getDisplayPricing(endpoint);

  if (displayPricing) {
    return selectDisplayPrice(displayPricing, displayLabels);
  }

  return formatTokenPrice(asString(asRecord(endpoint.pricing)?.[pricingKey]), {
    displayMultiplier: 1_000_000,
    unitLabel: "/M tokens",
  });
}

function getDisplayPricing(endpoint: Record<string, unknown>) {
  if (Array.isArray(endpoint.display_pricing)) {
    return endpoint.display_pricing;
  }

  const pricing = asRecord(endpoint.pricing);

  if (Array.isArray(pricing?.display_pricing)) {
    return pricing.display_pricing;
  }

  return null;
}

function selectDisplayPrice(
  displayPricing: unknown[],
  displayLabels: string[],
) {
  const displayPriceByLabel = new Map<string, Record<string, unknown>[]>();

  for (const entry of displayPricing) {
    const record = asRecord(entry);
    const label = normalizeDisplayLabel(asString(record?.sku_label));

    if (!record || !label) {
      continue;
    }

    const entries = displayPriceByLabel.get(label) ?? [];
    entries.push(record);
    displayPriceByLabel.set(label, entries);
  }

  for (const displayLabel of displayLabels) {
    for (const displayPrice of displayPriceByLabel.get(
      normalizeDisplayLabel(displayLabel) ?? "",
    ) ?? []) {
      const formattedPrice = formatDisplayPrice(displayPrice);

      if (formattedPrice) {
        return formattedPrice;
      }
    }
  }

  return null;
}

function formatDisplayPrice(record: Record<string, unknown>) {
  const formattedPrice = formatTokenPrice(asPriceValue(record.price), {
    displayMultiplier: asFiniteNumber(record.displayMultiplier) ?? 1,
    unitLabel: asString(record.unitLabel) ?? "",
  });

  if (!formattedPrice) {
    return null;
  }

  return Array.isArray(record.tiers) ? `${formattedPrice}*` : formattedPrice;
}

function formatTokenPrice(
  rawPrice: string | null,
  options: { displayMultiplier: number; unitLabel: string },
) {
  if (!rawPrice) {
    return null;
  }

  const amount = Number(rawPrice) * options.displayMultiplier;

  if (!Number.isFinite(amount)) {
    return null;
  }

  return `$${formatPriceAmount(amount)}${options.unitLabel}`;
}

function formatPriceAmount(amount: number) {
  return amount.toLocaleString("en-US", {
    maximumFractionDigits: amount < 1 ? 6 : 2,
    minimumFractionDigits: 0,
  });
}

function normalizeDisplayLabel(value: string | null) {
  return value?.trim().replace(/\s+/g, " ").toLowerCase() ?? null;
}

function normalizeOpenRouterUrl(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value, OPENROUTER_BASE_URL).toString();
  } catch {
    return null;
  }
}

function normalizeAuthorIconUrl(value: string) {
  return value.startsWith("http")
    ? value
    : new URL(value, OPENROUTER_ICON_BASE_URL).toString();
}

function endpointIconUrlMatchesAuthor(
  iconUrl: string | null,
  authorKeys: string[],
) {
  if (!iconUrl || authorKeys.length === 0) {
    return false;
  }

  const iconKeys = getIconKeys(iconUrl);

  return iconKeys.some((iconKey) =>
    authorKeys.some(
      (authorKey) =>
        iconKey === authorKey ||
        iconKey.includes(authorKey) ||
        authorKey.includes(iconKey),
    ),
  );
}

function getIconKeys(iconUrl: string) {
  try {
    const url = new URL(iconUrl);
    const faviconTarget = url.searchParams.get("url");
    const iconValues = [
      url.pathname
        .split("/")
        .at(-1)
        ?.replace(/\.[^.]+$/, ""),
    ];

    if (faviconTarget) {
      const targetUrl = new URL(faviconTarget);
      iconValues.push(
        targetUrl.hostname,
        targetUrl.hostname + targetUrl.pathname,
      );
    }

    return iconValues.flatMap((value) =>
      getNormalizedAuthorKeys(value ?? null),
    );
  } catch {
    return [];
  }
}

function getNormalizedAuthorKeys(value: string | null) {
  if (!value) {
    return [];
  }

  const trimmed = value.trim().toLowerCase();
  const withoutUrlPrefix = trimmed.replace(/^https?:\/\//, "");
  const withoutCommonAffixes = withoutUrlPrefix
    .replace(/^www\./, "")
    .replace(/\.(ai|com|cloud|dev|inc|org|net)(\/|$).*/, "");
  const compact = withoutCommonAffixes.replace(/[^a-z0-9]+/g, "");
  const dashed = withoutCommonAffixes
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return [...new Set([trimmed, withoutCommonAffixes, compact, dashed])].filter(
    (key) => key.length > 1,
  );
}

function isOpenRouterInternalModel(value: string) {
  return value.toLowerCase().startsWith("openrouter/");
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function asPriceValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return asString(value);
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asFiniteNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function asRecord(value: unknown) {
  return isRecord(value) ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
