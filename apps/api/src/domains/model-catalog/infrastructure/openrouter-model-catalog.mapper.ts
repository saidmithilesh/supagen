import type {
  ModelCatalogCapability,
  ModelCatalogModel,
  ModelCatalogParameter,
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

export function mapOpenRouterModelEndpointMetadata(
  model: ModelCatalogModel,
  payload: unknown,
): Pick<ModelCatalogModel, "capabilities" | "supportedParameterDetails"> {
  const endpoints = getEndpointRecords(payload);

  if (endpoints.length === 0) {
    return {
      capabilities: model.capabilities,
      supportedParameterDetails: model.supportedParameterDetails,
    };
  }

  const input = {
    inputModalities: model.inputModalities,
    outputModalities: model.outputModalities,
    records: endpoints.map((endpoint) => ({
      endpoint,
      model: asRecord(endpoint.model),
    })),
  };

  return {
    capabilities: getModelCapabilities(input),
    supportedParameterDetails: getModelParameters(input.records),
  };
}

function mapOpenRouterCatalogModel(
  record: Record<string, unknown>,
): ModelCatalogModel | null {
  const endpoint = asRecord(record.endpoint);
  const warningMessage = asString(record.warning_message);

  if (!endpoint && !warningMessage) {
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
  const endpointRecord = endpoint ?? {};
  const authorName = getAuthorName(
    record,
    endpointRecord,
    modelNameParts.authorName,
  );
  const supportedParameters = asStringArray(
    endpointRecord.supported_parameters,
  );

  return {
    slug,
    permaslug,
    displayName:
      modelNameParts.displayName ??
      asString(record.short_name) ??
      asString(record.name) ??
      permaslug,
    description: asString(record.description),
    warningMessage,
    authorName,
    authorIconUrl: getAuthorIconUrl(record, endpointRecord, authorName),
    inputModalities: asStringArray(record.input_modalities),
    outputModalities: asStringArray(record.output_modalities),
    supportedParameters,
    supportedParameterDetails: getModelParameters([
      { endpoint: endpointRecord, model: record },
    ]),
    capabilities: getModelCapabilities({
      inputModalities: asStringArray(record.input_modalities),
      outputModalities: asStringArray(record.output_modalities),
      records: [{ endpoint: endpointRecord, model: record }],
    }),
    releaseDate: asString(record.release_date) ?? asString(record.created_at),
    inputPrice: getDisplayPrice(endpointRecord, INPUT_DISPLAY_LABELS, "prompt"),
    outputPrice: getDisplayPrice(
      endpointRecord,
      OUTPUT_DISPLAY_LABELS,
      "completion",
    ),
    contextWindowSize:
      asNumber(endpointRecord.context_length) ??
      asNumber(record.context_length),
    maxOutputTokens: asNumber(endpointRecord.max_completion_tokens),
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

const OPENROUTER_PARAMETER_DEFINITIONS = new Map<
  string,
  { name: string; type: string; values: string }
>([
  ["background", { name: "Background", type: "enum", values: "Any" }],
  [
    "frequency_penalty",
    { name: "Frequency Penalty", type: "number", values: "-2 to 2" },
  ],
  [
    "include_reasoning",
    { name: "Include Reasoning", type: "boolean", values: "true or false" },
  ],
  ["logit_bias", { name: "Logit Bias", type: "object", values: "Any" }],
  ["logprobs", { name: "Logprobs", type: "boolean", values: "true or false" }],
  ["max_tokens", { name: "Max Tokens", type: "integer", values: "Any" }],
  ["min_p", { name: "Min P", type: "number", values: "0 to 1" }],
  ["n", { name: "Number Of Outputs", type: "integer", values: "Any" }],
  [
    "output_compression",
    { name: "Output Compression", type: "integer", values: "0 to 100" },
  ],
  ["output_format", { name: "Output Format", type: "enum", values: "Any" }],
  [
    "parallel_tool_calls",
    { name: "Parallel Tool Calls", type: "boolean", values: "true or false" },
  ],
  [
    "presence_penalty",
    { name: "Presence Penalty", type: "number", values: "-2 to 2" },
  ],
  ["quality", { name: "Quality", type: "enum", values: "Any" }],
  ["reasoning", { name: "Reasoning", type: "object", values: "Any" }],
  [
    "repetition_penalty",
    { name: "Repetition Penalty", type: "number", values: "0 to 2" },
  ],
  [
    "response_format",
    { name: "Response Format", type: "object", values: "Any" },
  ],
  ["seed", { name: "Seed", type: "integer", values: "Any" }],
  ["stop", { name: "Stop", type: "string or array", values: "Any" }],
  [
    "structured_outputs",
    { name: "Structured Outputs", type: "boolean", values: "true or false" },
  ],
  ["temperature", { name: "Temperature", type: "number", values: "0 to 2" }],
  [
    "tool_choice",
    { name: "Tool Choice", type: "string or object", values: "Any" },
  ],
  ["tools", { name: "Tools", type: "array", values: "Any" }],
  ["top_a", { name: "Top A", type: "number", values: "0 to 1" }],
  ["top_k", { name: "Top K", type: "integer", values: "0 or greater" }],
  ["top_logprobs", { name: "Top Logprobs", type: "integer", values: "Any" }],
  ["top_p", { name: "Top P", type: "number", values: "0 to 1" }],
  [
    "verbosity",
    { name: "Verbosity", type: "enum", values: "low, medium, high" },
  ],
  [
    "web_search_options",
    { name: "Web Search Options", type: "object", values: "Any" },
  ],
]);

const PARAMETER_DISPLAY_ORDER = [
  "temperature",
  "top_p",
  "top_k",
  "min_p",
  "top_a",
  "frequency_penalty",
  "presence_penalty",
  "repetition_penalty",
  "max_tokens",
  "stop",
  "seed",
  "logit_bias",
  "logprobs",
  "top_logprobs",
  "reasoning",
  "include_reasoning",
  "tools",
  "tool_choice",
  "parallel_tool_calls",
  "structured_outputs",
  "response_format",
  "web_search_options",
  "verbosity",
  "resolution",
  "aspect_ratio",
  "size",
  "quality",
  "output_format",
  "background",
  "n",
  "input_references",
  "output_compression",
  "duration",
  "frame_images",
  "generate_audio",
];
const PARAMETER_DISPLAY_INDEX = new Map(
  PARAMETER_DISPLAY_ORDER.map((key, index) => [key, index] as const),
);

function getModelParameters(
  records: Array<{
    endpoint: Record<string, unknown>;
    model: Record<string, unknown> | null;
  }>,
): ModelCatalogParameter[] {
  const parametersByKey = new Map<string, MutableModelCatalogParameter>();

  for (const { endpoint } of records) {
    for (const parameterKey of asStringArray(endpoint.supported_parameters)) {
      addParameter(
        parametersByKey,
        getGenericParameter(parameterKey, endpoint),
      );
    }

    for (const parameter of getImageParametersList(endpoint)) {
      addParameter(parametersByKey, parameter);
    }

    for (const parameter of getVideoParametersList(endpoint)) {
      addParameter(parametersByKey, parameter);
    }

    for (const parameter of getPassthroughParameters(endpoint)) {
      addParameter(parametersByKey, parameter);
    }
  }

  return [...parametersByKey.values()]
    .map(({ valueSet, ...parameter }) => ({
      ...parameter,
      values:
        valueSet.size > 0
          ? sortParameterValues([...valueSet]).join(", ")
          : parameter.values,
    }))
    .sort(compareModelParameters);
}

function getGenericParameter(
  rawKey: string,
  endpoint: Record<string, unknown>,
): ModelCatalogParameter {
  const key = normalizeParameterKey(rawKey);
  const definition = OPENROUTER_PARAMETER_DEFINITIONS.get(key);

  if (key === "max_tokens") {
    const maxCompletionTokens = asFiniteNumber(endpoint.max_completion_tokens);

    return {
      key,
      name: definition?.name ?? formatParameterName(key),
      type: definition?.type ?? "any",
      values:
        maxCompletionTokens && maxCompletionTokens > 0
          ? `Up to ${formatCompactNumber(maxCompletionTokens)}`
          : (definition?.values ?? "Any"),
    };
  }

  if (key === "tool_choice") {
    return {
      key,
      name: definition?.name ?? formatParameterName(key),
      type: definition?.type ?? "any",
      values: getToolChoiceValues(endpoint) ?? definition?.values ?? "Any",
    };
  }

  if (key === "reasoning") {
    return {
      key,
      name: definition?.name ?? formatParameterName(key),
      type: definition?.type ?? "any",
      values: getReasoningValues(endpoint) ?? definition?.values ?? "Any",
    };
  }

  return {
    key,
    name: definition?.name ?? formatParameterName(key),
    type: definition?.type ?? "any",
    values: definition?.values ?? "Any",
  };
}

function getImageParametersList(
  endpoint: Record<string, unknown>,
): ModelCatalogParameter[] {
  const parameters = getImageParameters(endpoint);

  if (!parameters) {
    return [];
  }

  return [
    getEnumParameter("resolution", "Resolution", parameters.resolutions),
    getEnumParameter("aspect_ratio", "Aspect Ratio", parameters.aspect_ratios),
    getEnumParameter(
      "output_format",
      "Output Format",
      parameters.output_formats,
    ),
    getEnumParameter("quality", "Quality", parameters.qualities),
    getEnumParameter("background", "Background", parameters.backgrounds),
    getRangeParameter("n", "Number Of Outputs", "integer", parameters.n),
    getRangeParameter(
      "input_references",
      "Input References",
      "array",
      parameters.input_references,
      "items",
    ),
    getRangeParameter(
      "output_compression",
      "Output Compression",
      "integer",
      parameters.output_compression,
    ),
  ].filter((parameter): parameter is ModelCatalogParameter =>
    Boolean(parameter),
  );
}

function getVideoParametersList(
  endpoint: Record<string, unknown>,
): ModelCatalogParameter[] {
  const parameters = getVideoParameters(endpoint);

  if (!parameters) {
    return [];
  }

  return [
    getEnumParameter("duration", "Duration", parameters.supported_durations),
    getEnumParameter(
      "frame_images",
      "Frame Images",
      parameters.supported_frame_images,
    ),
    getEnumParameter("size", "Size", parameters.supported_sizes),
    getEnumParameter(
      "resolution",
      "Resolution",
      parameters.supported_resolutions,
    ),
    getEnumParameter(
      "aspect_ratio",
      "Aspect Ratio",
      parameters.supported_aspect_ratios,
    ),
    getBooleanParameter(
      "generate_audio",
      "Generate Audio",
      parameters.generate_audio,
    ),
    getBooleanParameter("seed", "Seed", parameters.seed, "integer", "Any"),
  ].filter((parameter): parameter is ModelCatalogParameter =>
    Boolean(parameter),
  );
}

function getPassthroughParameters(
  endpoint: Record<string, unknown>,
): ModelCatalogParameter[] {
  return asStringArray(endpoint.allowed_passthrough_parameters).map((key) => ({
    key: normalizeParameterKey(key),
    name: formatParameterName(key),
    type: "any",
    values: "Any",
  }));
}

function getEnumParameter(
  key: string,
  name: string,
  values: unknown,
): ModelCatalogParameter | null {
  const enumValues = asStringArray(values);

  if (enumValues.length === 0) {
    return null;
  }

  return {
    key,
    name,
    type: "enum",
    values: enumValues.join(", "),
  };
}

function getRangeParameter(
  key: string,
  name: string,
  type: string,
  range: unknown,
  unit?: string,
): ModelCatalogParameter | null {
  const rangeRecord = asRecord(range);

  if (!rangeRecord) {
    return null;
  }

  const min = asFiniteNumber(rangeRecord.min);
  const max = asFiniteNumber(rangeRecord.max);

  if (min === null && max === null) {
    return null;
  }

  return {
    key,
    name,
    type,
    values: formatRange(min, max, unit),
  };
}

function getBooleanParameter(
  key: string,
  name: string,
  value: unknown,
  type = "boolean",
  values = "true or false",
): ModelCatalogParameter | null {
  return asBoolean(value) === true ? { key, name, type, values } : null;
}

function addParameter(
  parametersByKey: Map<string, MutableModelCatalogParameter>,
  parameter: ModelCatalogParameter,
) {
  const key = normalizeParameterKey(parameter.key);
  const existing = parametersByKey.get(key);

  if (!existing) {
    parametersByKey.set(key, {
      ...parameter,
      key,
      valueSet:
        parameter.values === "Any"
          ? new Set()
          : new Set(splitParameterValues(parameter.values)),
    });
    return;
  }

  existing.type = mergeParameterTypes(existing.type, parameter.type);

  if (parameter.values === "Any") {
    existing.values = existing.valueSet.size === 0 ? "Any" : existing.values;
    return;
  }

  for (const value of splitParameterValues(parameter.values)) {
    existing.valueSet.add(value);
  }
}

function getToolChoiceValues(endpoint: Record<string, unknown>) {
  const supportedToolChoice = asRecord(
    asRecord(endpoint.features)?.supports_tool_choice,
  );

  if (!supportedToolChoice) {
    return null;
  }

  const values = [
    ["none", supportedToolChoice.literal_none],
    ["auto", supportedToolChoice.literal_auto],
    ["required", supportedToolChoice.literal_required],
    ["function", supportedToolChoice.type_function],
  ]
    .filter(([, value]) => asBoolean(value) === true)
    .map(([label]) => label);

  return values.length > 0 ? values.join(", ") : null;
}

function getReasoningValues(endpoint: Record<string, unknown>) {
  const model = asRecord(endpoint.model);
  const reasoningConfig =
    asRecord(asRecord(model?.features)?.reasoning_config) ??
    asRecord(model?.reasoning_config);
  const reasoningEfforts = asStringArray(
    reasoningConfig?.supported_reasoning_efforts,
  );

  return reasoningEfforts.length > 0 ? reasoningEfforts.join(", ") : null;
}

function formatRange(
  min: number | null,
  max: number | null,
  unit: string | undefined,
) {
  const suffix = unit ? ` ${unit}` : "";

  if (min !== null && max !== null) {
    return `${formatRangeNumber(min)} to ${formatRangeNumber(max)}${suffix}`;
  }

  if (max !== null) {
    return `Up to ${formatRangeNumber(max)}${suffix}`;
  }

  return `${formatRangeNumber(min ?? 0)}${suffix} or greater`;
}

function formatCompactNumber(value: number) {
  return Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    notation: "compact",
  }).format(value);
}

function formatRangeNumber(value: number) {
  return Number.isInteger(value) ? String(value) : String(value);
}

function splitParameterValues(value: string) {
  if (value.includes(" to ") || value.startsWith("Up to ")) {
    return [value];
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function sortParameterValues(values: string[]) {
  return values.sort((left, right) =>
    left.localeCompare(right, "en-US", {
      numeric: true,
      sensitivity: "base",
    }),
  );
}

function mergeParameterTypes(left: string, right: string) {
  return left === right ? left : "any";
}

function compareModelParameters(
  left: ModelCatalogParameter,
  right: ModelCatalogParameter,
) {
  const leftIndex = PARAMETER_DISPLAY_INDEX.get(left.key);
  const rightIndex = PARAMETER_DISPLAY_INDEX.get(right.key);

  if (leftIndex !== undefined || rightIndex !== undefined) {
    return (
      (leftIndex ?? Number.MAX_SAFE_INTEGER) -
      (rightIndex ?? Number.MAX_SAFE_INTEGER)
    );
  }

  return left.name.localeCompare(right.name, "en-US", {
    sensitivity: "base",
  });
}

function normalizeParameterKey(value: string) {
  return value.trim().toLowerCase();
}

function formatParameterName(parameter: string) {
  const normalized = parameter.trim().replace(/[_-]+/g, " ");

  if (!normalized) {
    return "Unknown";
  }

  return normalized.replace(/\b\w/g, (character) => character.toUpperCase());
}

type MutableModelCatalogParameter = ModelCatalogParameter & {
  valueSet: Set<string>;
};

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
