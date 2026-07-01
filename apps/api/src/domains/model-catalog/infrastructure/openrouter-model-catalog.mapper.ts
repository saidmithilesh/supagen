import type {
  ModelCatalogCapability,
  ModelCatalogModel,
} from "../domain/model-catalog-model";

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

export function mapOpenRouterModelEndpointCapabilities(
  model: ModelCatalogModel,
  payload: unknown,
): ModelCatalogCapability[] {
  const endpoints = getEndpointRecords(payload);

  if (endpoints.length === 0) {
    return model.capabilities;
  }

  return getModelCapabilities({
    inputModalities: model.inputModalities,
    outputModalities: model.outputModalities,
    records: endpoints.map((endpoint) => ({
      endpoint,
      model: asRecord(endpoint.model),
    })),
  });
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
  const supportedParameters = asStringArray(endpoint.supported_parameters);

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
    supportedParameters,
    capabilities: getModelCapabilities({
      inputModalities: asStringArray(record.input_modalities),
      outputModalities: asStringArray(record.output_modalities),
      records: [{ endpoint, model: record }],
    }),
    releaseDate: asString(record.release_date) ?? asString(record.created_at),
    inputPrice: getDisplayPrice(endpoint, INPUT_DISPLAY_LABELS, "prompt"),
    outputPrice: getDisplayPrice(endpoint, OUTPUT_DISPLAY_LABELS, "completion"),
    contextWindowSize:
      asNumber(endpoint.context_length) ?? asNumber(record.context_length),
    maxOutputTokens: asNumber(endpoint.max_completion_tokens),
  };
}

function getModelCapabilities(input: {
  inputModalities: string[];
  outputModalities: string[];
  records: Array<{
    endpoint: Record<string, unknown>;
    model: Record<string, unknown> | null;
  }>;
}) {
  return MODEL_CAPABILITY_DEFINITIONS.filter((definition) =>
    definition.isSupported(input),
  ).map(({ key, label, outputModality }) => ({
    key,
    label,
    outputModality,
  }));
}

function getFeatureSupportedParameter(
  features: Record<string, unknown> | null,
  parameterKey: string,
) {
  return asBoolean(asRecord(features?.supported_parameters)?.[parameterKey]);
}

function hasAnyCapabilityParameter(
  supportedParameterKeys: Set<string>,
  parameterKeys: string[],
) {
  return parameterKeys.some((parameterKey) =>
    supportedParameterKeys.has(parameterKey),
  );
}

function normalizeCapabilityKey(value: string) {
  return value.trim().toLowerCase();
}

const MODEL_CAPABILITY_DEFINITIONS: Array<
  ModelCatalogCapability & {
    isSupported(input: {
      inputModalities: string[];
      outputModalities: string[];
      records: Array<{
        endpoint: Record<string, unknown>;
        model: Record<string, unknown> | null;
      }>;
    }): boolean;
  }
> = [
  {
    key: "text.reasoning",
    label: "Reasoning",
    outputModality: "text",
    isSupported: ({ outputModalities, records }) =>
      hasOutputModality(outputModalities, "text") &&
      records.some(({ endpoint, model }) => {
        const supportedParameterKeys = getSupportedParameterKeys(endpoint);

        return (
          asBoolean(endpoint.supports_reasoning) === true ||
          hasAnyCapabilityParameter(supportedParameterKeys, [
            "reasoning",
            "include_reasoning",
          ]) ||
          (asBoolean(endpoint.supports_reasoning) === null &&
            asBoolean(model?.supports_reasoning) === true)
        );
      }),
  },
  {
    key: "text.tool-calling",
    label: "Tool Calling",
    outputModality: "text",
    isSupported: ({ outputModalities, records }) =>
      hasOutputModality(outputModalities, "text") &&
      records.some(({ endpoint }) => {
        const supportedParameterKeys = getSupportedParameterKeys(endpoint);

        return (
          supportsToolCalling(endpoint, supportedParameterKeys) ||
          hasAnyCapabilityParameter(supportedParameterKeys, [
            "tool_choice",
            "parallel_tool_calls",
          ])
        );
      }),
  },
  {
    key: "text.structured-outputs",
    label: "Structured Outputs",
    outputModality: "text",
    isSupported: ({ outputModalities, records }) =>
      hasOutputModality(outputModalities, "text") &&
      records.some(({ endpoint }) =>
        supportsStructuredOutputs(
          endpoint,
          getSupportedParameterKeys(endpoint),
        ),
      ),
  },
  {
    key: "text.web-search",
    label: "Web Search",
    outputModality: "text",
    isSupported: ({ outputModalities, records }) =>
      hasOutputModality(outputModalities, "text") &&
      records.some(({ endpoint }) => {
        const features = asRecord(endpoint.features);

        return (
          asBoolean(features?.supports_native_web_search) === true ||
          hasAnyCapabilityParameter(getSupportedParameterKeys(endpoint), [
            "web_search_options",
          ])
        );
      }),
  },
  {
    key: "image.text-to-image",
    label: "Text to Image",
    outputModality: "image",
    isSupported: ({ inputModalities, outputModalities }) =>
      hasInputModality(inputModalities, "text") &&
      hasOutputModality(outputModalities, "image"),
  },
  {
    key: "image.reference-images",
    label: "Reference Images",
    outputModality: "image",
    isSupported: ({ inputModalities, outputModalities, records }) =>
      hasOutputModality(outputModalities, "image") &&
      (hasInputModality(inputModalities, "image") ||
        records.some(({ endpoint }) => {
          const inputReferences = asRecord(
            getImageParameters(endpoint)?.input_references,
          );

          return hasPositiveNumber(inputReferences?.max);
        })),
  },
  {
    key: "image.multiple-images",
    label: "Multiple Images",
    outputModality: "image",
    isSupported: ({ outputModalities, records }) =>
      hasOutputModality(outputModalities, "image") &&
      records.some(({ endpoint }) =>
        hasNumberGreaterThan(asRecord(getImageParameters(endpoint)?.n)?.max, 1),
      ),
  },
  {
    key: "image.resolution-options",
    label: "Resolutions / Aspect Ratio Options",
    outputModality: "image",
    isSupported: ({ outputModalities, records }) =>
      hasOutputModality(outputModalities, "image") &&
      records.some(({ endpoint }) => {
        const parameters = getImageParameters(endpoint);

        return (
          hasNonEmptyArray(parameters?.resolutions) ||
          hasNonEmptyArray(parameters?.aspect_ratios)
        );
      }),
  },
  {
    key: "image.quality-control",
    label: "Quality Control",
    outputModality: "image",
    isSupported: ({ outputModalities, records }) =>
      hasOutputModality(outputModalities, "image") &&
      records.some(({ endpoint }) =>
        hasNonEmptyArray(getImageParameters(endpoint)?.qualities),
      ),
  },
  {
    key: "image.image-text-output",
    label: "Image + Text Output",
    outputModality: "image",
    isSupported: ({ outputModalities }) =>
      hasOutputModality(outputModalities, "image") &&
      hasOutputModality(outputModalities, "text"),
  },
  {
    key: "video.text-to-video",
    label: "Text to Video",
    outputModality: "video",
    isSupported: ({ inputModalities, outputModalities }) =>
      hasInputModality(inputModalities, "text") &&
      hasOutputModality(outputModalities, "video"),
  },
  {
    key: "video.image-to-video",
    label: "Image to Video",
    outputModality: "video",
    isSupported: ({ inputModalities, outputModalities, records }) =>
      hasOutputModality(outputModalities, "video") &&
      (hasInputModality(inputModalities, "image") ||
        records.some(({ endpoint }) =>
          hasNonEmptyArray(
            getVideoParameters(endpoint)?.supported_frame_images,
          ),
        ) ||
        records.some(({ endpoint }) =>
          hasPricingLabel(endpoint, "Image to Video"),
        )),
  },
  {
    key: "video.reference-frames",
    label: "Reference Frames",
    outputModality: "video",
    isSupported: ({ outputModalities, records }) =>
      hasOutputModality(outputModalities, "video") &&
      records.some(({ endpoint }) =>
        hasNonEmptyArray(getVideoParameters(endpoint)?.supported_frame_images),
      ),
  },
  {
    key: "video.audio-generation",
    label: "Audio Generation",
    outputModality: "video",
    isSupported: ({ outputModalities, records }) =>
      hasOutputModality(outputModalities, "video") &&
      records.some(
        ({ endpoint }) =>
          asBoolean(getVideoParameters(endpoint)?.generate_audio) === true,
      ),
  },
  {
    key: "video.size-resolution-options",
    label: "Size/Resolution Options",
    outputModality: "video",
    isSupported: ({ outputModalities, records }) =>
      hasOutputModality(outputModalities, "video") &&
      records.some(({ endpoint }) => {
        const parameters = getVideoParameters(endpoint);

        return (
          hasNonEmptyArray(parameters?.supported_sizes) ||
          hasNonEmptyArray(parameters?.supported_resolutions) ||
          hasNonEmptyArray(parameters?.supported_aspect_ratios)
        );
      }),
  },
  {
    key: "speech.text-to-speech",
    label: "Text to Speech",
    outputModality: "speech",
    isSupported: ({ inputModalities, outputModalities }) =>
      hasInputModality(inputModalities, "text") &&
      hasOutputModality(outputModalities, "speech"),
  },
  {
    key: "speech.voice-selection",
    label: "Voice Selection",
    outputModality: "speech",
    isSupported: ({ outputModalities, records }) =>
      hasOutputModality(outputModalities, "speech") &&
      records.some(({ endpoint, model }) =>
        hasNonEmptyArray(
          endpoint.supported_tts_voices ?? model?.supported_tts_voices,
        ),
      ),
  },
  {
    key: "audio.audio-input",
    label: "Audio Input",
    outputModality: "audio",
    isSupported: ({ inputModalities, outputModalities, records }) =>
      hasOutputModality(outputModalities, "audio") &&
      (hasInputModality(inputModalities, "audio") ||
        records.some(({ endpoint }) =>
          hasAnyPricingLabel(endpoint, ["Audio", "Input Audio"]),
        )),
  },
  {
    key: "audio.audio-output",
    label: "Audio Output",
    outputModality: "audio",
    isSupported: ({ outputModalities, records }) =>
      hasOutputModality(outputModalities, "audio") ||
      records.some(({ endpoint }) => hasPricingLabel(endpoint, "Output Audio")),
  },
  {
    key: "audio.song-generation",
    label: "Song Generation",
    outputModality: "audio",
    isSupported: ({ outputModalities, records }) =>
      hasOutputModality(outputModalities, "audio") &&
      records.some(({ endpoint }) =>
        hasPricingLabel(endpoint, "Song Generation"),
      ),
  },
  {
    key: "audio.tool-calling",
    label: "Tool Calling",
    outputModality: "audio",
    isSupported: ({ outputModalities, records }) =>
      hasOutputModality(outputModalities, "audio") &&
      records.some(({ endpoint }) =>
        supportsToolCalling(endpoint, getSupportedParameterKeys(endpoint)),
      ),
  },
  {
    key: "audio.structured-outputs",
    label: "Structured Outputs",
    outputModality: "audio",
    isSupported: ({ outputModalities, records }) =>
      hasOutputModality(outputModalities, "audio") &&
      records.some(({ endpoint }) =>
        supportsStructuredOutputs(
          endpoint,
          getSupportedParameterKeys(endpoint),
        ),
      ),
  },
  {
    key: "embeddings.text-embeddings",
    label: "Text Embeddings",
    outputModality: "embeddings",
    isSupported: ({ inputModalities, outputModalities }) =>
      hasInputModality(inputModalities, "text") &&
      hasOutputModality(outputModalities, "embeddings"),
  },
  {
    key: "embeddings.image-embeddings",
    label: "Image Embeddings",
    outputModality: "embeddings",
    isSupported: ({ inputModalities, outputModalities }) =>
      hasInputModality(inputModalities, "image") &&
      hasOutputModality(outputModalities, "embeddings"),
  },
  {
    key: "embeddings.file-embeddings",
    label: "File Embeddings",
    outputModality: "embeddings",
    isSupported: ({ inputModalities, outputModalities }) =>
      hasInputModality(inputModalities, "file") &&
      hasOutputModality(outputModalities, "embeddings"),
  },
  {
    key: "embeddings.audio-embeddings",
    label: "Audio Embeddings",
    outputModality: "embeddings",
    isSupported: ({ inputModalities, outputModalities }) =>
      hasInputModality(inputModalities, "audio") &&
      hasOutputModality(outputModalities, "embeddings"),
  },
  {
    key: "embeddings.video-embeddings",
    label: "Video Embeddings",
    outputModality: "embeddings",
    isSupported: ({ inputModalities, outputModalities }) =>
      hasInputModality(inputModalities, "video") &&
      hasOutputModality(outputModalities, "embeddings"),
  },
  {
    key: "rerank.text-reranking",
    label: "Text Reranking",
    outputModality: "rerank",
    isSupported: ({ inputModalities, outputModalities }) =>
      hasInputModality(inputModalities, "text") &&
      hasOutputModality(outputModalities, "rerank"),
  },
  {
    key: "rerank.multimodal-reranking",
    label: "Multimodal Reranking",
    outputModality: "rerank",
    isSupported: ({ inputModalities, outputModalities }) =>
      hasInputModality(inputModalities, "image") &&
      hasOutputModality(outputModalities, "rerank"),
  },
];

function supportsToolCalling(
  endpoint: Record<string, unknown>,
  supportedParameterKeys: Set<string>,
) {
  return (
    asBoolean(endpoint.supports_tool_parameters) === true ||
    hasAnyCapabilityParameter(supportedParameterKeys, [
      "tools",
      "tool_choice",
      "parallel_tool_calls",
    ])
  );
}

function supportsStructuredOutputs(
  endpoint: Record<string, unknown>,
  supportedParameterKeys: Set<string>,
) {
  const features = asRecord(endpoint.features);
  const structuredOutputs =
    getFeatureSupportedParameter(features, "structured_outputs") ??
    hasAnyCapabilityParameter(supportedParameterKeys, ["structured_outputs"]);
  const responseFormat =
    getFeatureSupportedParameter(features, "response_format") ??
    hasAnyCapabilityParameter(supportedParameterKeys, ["response_format"]);

  return structuredOutputs || responseFormat;
}

function getSupportedParameterKeys(endpoint: Record<string, unknown>) {
  return new Set(
    asStringArray(endpoint.supported_parameters).map(normalizeCapabilityKey),
  );
}

function getImageParameters(endpoint: Record<string, unknown>) {
  return asRecord(endpoint.supported_image_parameters);
}

function getVideoParameters(endpoint: Record<string, unknown>) {
  return asRecord(endpoint.supported_video_parameters);
}

function hasInputModality(modalities: string[], modality: string) {
  return hasModality(modalities, modality);
}

function hasOutputModality(modalities: string[], modality: string) {
  return hasModality(modalities, modality);
}

function hasModality(modalities: string[], modality: string) {
  const normalizedModality = normalizeCapabilityKey(modality);

  return modalities.some((value) => {
    const normalizedValue = normalizeCapabilityKey(value);

    return (
      normalizedValue === normalizedModality ||
      (normalizedModality === "embeddings" && normalizedValue === "embedding")
    );
  });
}

function hasNonEmptyArray(value: unknown) {
  return Array.isArray(value) && value.length > 0;
}

function hasPositiveNumber(value: unknown) {
  const number = asFiniteNumber(value);

  return number !== null && number > 0;
}

function hasNumberGreaterThan(value: unknown, threshold: number) {
  const number = asFiniteNumber(value);

  return number !== null && number > threshold;
}

function hasAnyPricingLabel(
  endpoint: Record<string, unknown>,
  labels: string[],
) {
  return labels.some((label) => hasPricingLabel(endpoint, label));
}

function hasPricingLabel(endpoint: Record<string, unknown>, label: string) {
  const normalizedLabel = normalizeDisplayLabel(label);

  if (!normalizedLabel) {
    return false;
  }

  return (getDisplayPricing(endpoint) ?? []).some(
    (entry) =>
      normalizeDisplayLabel(asString(asRecord(entry)?.sku_label)) ===
      normalizedLabel,
  );
}

function getEndpointRecords(payload: unknown): Array<Record<string, unknown>> {
  const data = asRecord(payload)?.data;

  return Array.isArray(data) ? data.filter(isRecord) : [];
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

function asBoolean(value: unknown) {
  return typeof value === "boolean" ? value : null;
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
