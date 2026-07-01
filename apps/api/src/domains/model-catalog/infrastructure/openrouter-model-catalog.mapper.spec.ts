import {
  mapOpenRouterCatalogModels,
  mapOpenRouterModelEndpointCapabilities,
} from "./openrouter-model-catalog.mapper";

describe(mapOpenRouterCatalogModels.name, () => {
  const mapSingleModel = (
    endpoint: Record<string, unknown>,
    overrides: Record<string, unknown> = {},
  ) =>
    mapOpenRouterCatalogModels({
      data: [
        {
          slug: "provider/model",
          permaslug: "provider/model-20260101",
          short_name: "Provider Model",
          input_modalities: ["text"],
          output_modalities: ["text"],
          endpoint,
          ...overrides,
        },
      ],
    })[0];

  it("maps served OpenRouter models into the Supagen catalog shape", () => {
    expect(
      mapOpenRouterCatalogModels({
        data: [
          {
            slug: "anthropic/claude-sonnet-5",
            permaslug: "anthropic/claude-sonnet-5-20260630",
            short_name: "Claude Sonnet 5",
            name: "Anthropic: Claude Sonnet 5",
            author: "anthropic",
            author_display_name: "Anthropic",
            description: "Frontier Sonnet-class model.",
            created_at: "2026-06-30T18:11:23.921Z",
            context_length: 1_000_000,
            input_modalities: ["text", "image", null],
            output_modalities: ["text"],
            supports_reasoning: true,
            endpoint: {
              context_length: 900_000,
              max_completion_tokens: 65_536,
              supports_reasoning: true,
              supports_tool_parameters: true,
              supported_parameters: [
                "max_tokens",
                "stop",
                "reasoning",
                "include_reasoning",
                "tools",
                "tool_choice",
                "structured_outputs",
                "response_format",
                "verbosity",
                null,
              ],
              features: {
                supports_native_web_search: true,
                supports_tool_choice: {
                  literal_none: true,
                  literal_auto: true,
                  literal_required: true,
                  type_function: true,
                },
              },
              display_pricing: [
                {
                  sku_label: "Input Price",
                  price: "2e-6",
                  displayMultiplier: 1_000_000,
                  unitLabel: "/M tokens",
                },
                {
                  sku_label: "Output Price",
                  price: "10e-6",
                  displayMultiplier: 1_000_000,
                  unitLabel: "/M tokens",
                },
              ],
              provider_info: {
                icon: {
                  url: "/images/icons/Bedrock.svg",
                },
              },
            },
          },
        ],
      }),
    ).toEqual([
      {
        slug: "anthropic/claude-sonnet-5",
        permaslug: "anthropic/claude-sonnet-5-20260630",
        displayName: "Claude Sonnet 5",
        description: "Frontier Sonnet-class model.",
        authorName: "Anthropic",
        authorIconUrl: "https://openrouter.ai/images/icons/Anthropic.svg",
        inputModalities: ["text", "image"],
        outputModalities: ["text"],
        supportedParameters: [
          "max_tokens",
          "stop",
          "reasoning",
          "include_reasoning",
          "tools",
          "tool_choice",
          "structured_outputs",
          "response_format",
          "verbosity",
        ],
        capabilities: [
          {
            key: "text.reasoning",
            label: "Reasoning",
            outputModality: "text",
          },
          {
            key: "text.tool-calling",
            label: "Tool Calling",
            outputModality: "text",
          },
          {
            key: "text.structured-outputs",
            label: "Structured Outputs",
            outputModality: "text",
          },
          {
            key: "text.web-search",
            label: "Web Search",
            outputModality: "text",
          },
        ],
        releaseDate: "2026-06-30T18:11:23.921Z",
        inputPrice: "$2/M tokens",
        outputPrice: "$10/M tokens",
        contextWindowSize: 900_000,
        maxOutputTokens: 65_536,
      },
    ]);
  });

  it("normalizes text capability flags from supported parameters and source booleans", () => {
    expect(
      mapSingleModel({
        supports_reasoning: true,
        supports_tool_parameters: true,
        supported_parameters: [
          "tool_choice",
          "parallel_tool_calls",
          "structured_outputs",
          "response_format",
          "web_search_options",
        ],
      }),
    ).toMatchObject({
      capabilities: expect.arrayContaining([
        expect.objectContaining({ key: "text.reasoning" }),
        expect.objectContaining({ key: "text.tool-calling" }),
        expect.objectContaining({ key: "text.structured-outputs" }),
        expect.objectContaining({ key: "text.web-search" }),
      ]),
    });
  });

  it("maps native web search from endpoint features without requiring the web search parameter", () => {
    expect(
      mapSingleModel({
        supported_parameters: [],
        features: {
          supports_native_web_search: true,
        },
      }),
    ).toMatchObject({
      capabilities: expect.arrayContaining([
        expect.objectContaining({ key: "text.web-search" }),
      ]),
    });
  });

  it("maps web search from the request parameter when native search is not listed", () => {
    expect(
      mapSingleModel({
        supported_parameters: ["web_search_options"],
      }),
    ).toMatchObject({
      capabilities: expect.arrayContaining([
        expect.objectContaining({ key: "text.web-search" }),
      ]),
    });
  });

  it("uses endpoint feature overrides for structured output parameters", () => {
    expect(
      mapSingleModel({
        supported_parameters: ["structured_outputs", "response_format"],
        features: {
          supported_parameters: {
            structured_outputs: false,
            response_format: false,
          },
        },
      }),
    ).toMatchObject({
      capabilities: [],
    });

    expect(
      mapSingleModel({
        supported_parameters: [],
        features: {
          supported_parameters: {
            response_format: true,
          },
        },
      }),
    ).toMatchObject({
      capabilities: expect.arrayContaining([
        expect.objectContaining({ key: "text.structured-outputs" }),
      ]),
    });
  });

  it("folds tool choice variants into the user-facing tool calling capability", () => {
    expect(
      mapSingleModel({
        supports_tool_parameters: false,
        supported_parameters: ["tool_choice"],
      }),
    ).toMatchObject({
      capabilities: expect.arrayContaining([
        expect.objectContaining({ key: "text.tool-calling" }),
      ]),
    });

    expect(
      mapSingleModel({
        supports_tool_parameters: false,
        supported_parameters: ["parallel_tool_calls"],
      }),
    ).toMatchObject({
      capabilities: expect.arrayContaining([
        expect.objectContaining({ key: "text.tool-calling" }),
      ]),
    });
  });

  it("does not let model-level reasoning support override an explicit endpoint false", () => {
    expect(
      mapSingleModel(
        {
          supports_reasoning: false,
          supported_parameters: [],
        },
        {
          supports_reasoning: true,
        },
      ),
    ).toMatchObject({
      capabilities: [],
    });
  });

  it("aggregates model endpoint capabilities when any serving endpoint supports them", () => {
    const model = mapSingleModel({
      supported_parameters: [],
    });

    expect(
      mapOpenRouterModelEndpointCapabilities(model, {
        data: [
          {
            supported_parameters: [],
          },
          {
            supported_parameters: ["web_search_options"],
          },
        ],
      }),
    ).toEqual([
      {
        key: "text.web-search",
        label: "Web Search",
        outputModality: "text",
      },
    ]);
  });

  it("maps approved image capability chips", () => {
    expect(
      mapSingleModel(
        {
          supported_image_parameters: {
            n: { max: 4 },
            qualities: ["high"],
            resolutions: ["1024x1024"],
          },
        },
        {
          input_modalities: ["text", "image"],
          output_modalities: ["text", "image"],
        },
      ),
    ).toMatchObject({
      capabilities: [
        { key: "image.text-to-image" },
        { key: "image.reference-images" },
        { key: "image.multiple-images" },
        { key: "image.resolution-options" },
        { key: "image.quality-control" },
        { key: "image.image-text-output" },
      ],
    });
  });

  it("maps approved video capability chips", () => {
    expect(
      mapSingleModel(
        {
          supported_video_parameters: {
            generate_audio: true,
            supported_frame_images: ["first_frame", "last_frame"],
            supported_sizes: ["720p"],
          },
        },
        {
          input_modalities: ["text", "image"],
          output_modalities: ["video"],
        },
      ),
    ).toMatchObject({
      capabilities: [
        { key: "video.text-to-video" },
        { key: "video.image-to-video" },
        { key: "video.reference-frames" },
        { key: "video.audio-generation" },
        { key: "video.size-resolution-options" },
      ],
    });
  });

  it("maps approved speech capability chips", () => {
    expect(
      mapSingleModel(
        {},
        {
          input_modalities: ["text"],
          output_modalities: ["speech"],
          supported_tts_voices: ["Zephyr"],
        },
      ),
    ).toMatchObject({
      capabilities: [
        { key: "speech.text-to-speech" },
        { key: "speech.voice-selection" },
      ],
    });
  });

  it("maps approved audio capability chips", () => {
    expect(
      mapSingleModel(
        {
          supported_parameters: ["tools", "response_format"],
          display_pricing: [
            {
              sku_label: "Song Generation",
              price: "0.01",
              displayMultiplier: 1,
              unitLabel: "/song",
            },
          ],
        },
        {
          input_modalities: ["text", "audio"],
          output_modalities: ["audio"],
        },
      ),
    ).toMatchObject({
      capabilities: [
        { key: "audio.audio-input" },
        { key: "audio.audio-output" },
        { key: "audio.song-generation" },
        { key: "audio.tool-calling" },
        { key: "audio.structured-outputs" },
      ],
    });
  });

  it("maps approved embeddings and rerank capability chips", () => {
    expect(
      mapSingleModel(
        {},
        {
          input_modalities: ["text", "image", "file", "audio", "video"],
          output_modalities: ["embeddings"],
        },
      ),
    ).toMatchObject({
      capabilities: [
        { key: "embeddings.text-embeddings" },
        { key: "embeddings.image-embeddings" },
        { key: "embeddings.file-embeddings" },
        { key: "embeddings.audio-embeddings" },
        { key: "embeddings.video-embeddings" },
      ],
    });

    expect(
      mapSingleModel(
        {},
        {
          input_modalities: ["text", "image"],
          output_modalities: ["rerank"],
        },
      ),
    ).toMatchObject({
      capabilities: [
        { key: "rerank.text-reranking" },
        { key: "rerank.multimodal-reranking" },
      ],
    });
  });

  it("does not show capability chips for transcription models", () => {
    expect(
      mapSingleModel(
        {},
        {
          input_modalities: ["audio"],
          output_modalities: ["transcription"],
        },
      ),
    ).toMatchObject({
      capabilities: [],
    });
  });

  it("derives author and model display names from the OpenRouter model name", () => {
    expect(
      mapSingleModel(
        {
          provider_info: {
            icon: {
              url: "/images/icons/GoogleVertex.svg",
            },
          },
        },
        {
          name: "Anthropic: Claude Sonnet 5",
          short_name: "Claude 5",
          author: "anthropic",
          author_display_name: "Anthropic",
        },
      ),
    ).toMatchObject({
      authorName: "Anthropic",
      authorIconUrl: "https://openrouter.ai/images/icons/Anthropic.svg",
      displayName: "Claude Sonnet 5",
    });
  });

  it("keeps sensible author and model fallbacks when the model name has no usable separator", () => {
    expect(
      mapSingleModel(
        {},
        {
          name: "Claude Sonnet 5",
          short_name: "Claude 5",
          author: "anthropic",
          author_display_name: "Anthropic",
        },
      ),
    ).toMatchObject({
      authorName: "Anthropic",
      displayName: "Claude 5",
    });
  });

  it("falls back to null instead of showing a mismatched serving provider icon", () => {
    expect(
      mapSingleModel(
        {
          provider_info: {
            icon: {
              url: "/images/icons/Bedrock.svg",
            },
          },
        },
        {
          author: "unknown-author",
          author_display_name: "Unknown Author",
          name: "Unknown Author: Mystery Model",
        },
      ),
    ).toMatchObject({
      authorIconUrl: null,
    });
  });

  it("uses a matching endpoint icon as an unknown author fallback", () => {
    expect(
      mapSingleModel(
        {
          provider_info: {
            icon: {
              url: "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.sourceful.com&size=256",
            },
          },
        },
        {
          author: "sourceful",
          author_display_name: "Sourceful",
          name: "Sourceful: Riverflow",
        },
      ),
    ).toMatchObject({
      authorIconUrl:
        "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.sourceful.com&size=256",
    });
  });

  it("uses text token display pricing for input and output prices", () => {
    expect(
      mapSingleModel({
        display_pricing: [
          {
            sku_label: "Input Price",
            price: "2e-6",
            displayMultiplier: 1_000_000,
            unitLabel: "/M tokens",
          },
          {
            sku_label: "Output Price",
            price: "10e-6",
            displayMultiplier: 1_000_000,
            unitLabel: "/M tokens",
          },
        ],
      }),
    ).toMatchObject({
      inputPrice: "$2/M tokens",
      outputPrice: "$10/M tokens",
    });
  });

  it("prefers image output pricing over generic output pricing", () => {
    expect(
      mapSingleModel({
        display_pricing: [
          {
            sku_label: "Input Price",
            price: "0.00001",
            displayMultiplier: 1_000_000,
            unitLabel: "/M tokens",
          },
          {
            sku_label: "Output Price",
            price: "0.00001",
            displayMultiplier: 1_000_000,
            unitLabel: "/M tokens",
          },
          {
            sku_label: "Image Output",
            price: "0.00004",
            displayMultiplier: 1_000_000,
            unitLabel: "/M tokens",
          },
        ],
      }),
    ).toMatchObject({
      inputPrice: "$10/M tokens",
      outputPrice: "$40/M tokens",
    });
  });

  it("uses unit-priced image and video output SKUs without token fallback input prices", () => {
    expect(
      mapOpenRouterCatalogModels({
        data: [
          {
            slug: "sourceful/riverflow-v2.5-pro",
            permaslug: "sourceful/riverflow-v2.5-pro",
            short_name: "Riverflow",
            endpoint: {
              display_pricing: [
                {
                  sku_label: "Image Output",
                  price: "0.13",
                  displayMultiplier: 1,
                  unitLabel: "/image",
                  tiers: [{ sku_label: "1024px", price: "0.13" }],
                },
              ],
              pricing: {
                prompt: "0",
                completion: "0",
              },
            },
          },
          {
            slug: "google/veo-3.1-fast",
            permaslug: "google/veo-3.1-fast",
            short_name: "Veo",
            endpoint: {
              display_pricing: [
                {
                  sku_label: "Video (with audio)",
                  price: "0.10",
                  displayMultiplier: 1,
                  unitLabel: "/second",
                  tiers: [{ sku_label: "720p", price: "0.10" }],
                },
              ],
              pricing: {
                prompt: "0",
                completion: "0",
              },
            },
          },
        ],
      }),
    ).toMatchObject([
      {
        slug: "sourceful/riverflow-v2.5-pro",
        inputPrice: null,
        outputPrice: "$0.13/image*",
      },
      {
        slug: "google/veo-3.1-fast",
        inputPrice: null,
        outputPrice: "$0.1/second*",
      },
    ]);
  });

  it("maps embeddings as input-priced with no output price", () => {
    expect(
      mapSingleModel(
        {
          display_pricing: [
            {
              sku_label: "Input Price",
              price: "0.00000002",
              displayMultiplier: 1_000_000,
              unitLabel: "/M tokens",
            },
            {
              sku_label: "Text Input",
              price: "0.00000001",
              displayMultiplier: 1_000_000,
              unitLabel: "/M tokens",
            },
          ],
        },
        {
          input_modalities: ["text"],
          output_modalities: ["embedding"],
        },
      ),
    ).toMatchObject({
      inputPrice: "$0.01/M tokens",
      outputPrice: null,
    });
  });

  it("maps rerank search units as the input price", () => {
    expect(
      mapSingleModel({
        display_pricing: [
          {
            sku_label: "Search units",
            price: "0.0025",
            displayMultiplier: 1,
            unitLabel: "/search",
          },
        ],
      }),
    ).toMatchObject({
      inputPrice: "$0.0025/search",
      outputPrice: null,
    });
  });

  it("maps speech character pricing as the input price", () => {
    expect(
      mapSingleModel({
        display_pricing: [
          {
            sku_label: "Characters",
            price: "0.000022",
            displayMultiplier: 1_000_000,
            unitLabel: "/M characters",
          },
        ],
      }),
    ).toMatchObject({
      inputPrice: "$22/M characters",
      outputPrice: null,
    });
  });

  it("maps transcription duration pricing as the input price", () => {
    expect(
      mapSingleModel({
        display_pricing: [
          {
            sku_label: "Audio Minutes",
            price: "0.0015",
            displayMultiplier: 1,
            unitLabel: "/minute",
          },
        ],
      }),
    ).toMatchObject({
      inputPrice: "$0.0015/minute",
      outputPrice: null,
    });
  });

  it("suffixes tiered display pricing with an asterisk and uses the base price", () => {
    expect(
      mapSingleModel({
        display_pricing: [
          {
            sku_label: "Input Price",
            price: "5e-6",
            displayMultiplier: 1_000_000,
            unitLabel: "/M tokens",
            tiers: [
              { sku_label: "<=272K", price: "5e-6" },
              { sku_label: ">272K", price: "10e-6" },
            ],
          },
          {
            sku_label: "Output Price",
            price: "30e-6",
            displayMultiplier: 1_000_000,
            unitLabel: "/M tokens",
            tiers: [
              { sku_label: "<=272K", price: "30e-6" },
              { sku_label: ">272K", price: "45e-6" },
            ],
          },
        ],
      }),
    ).toMatchObject({
      inputPrice: "$5/M tokens*",
      outputPrice: "$30/M tokens*",
    });
  });

  it("returns null for invalid or missing selected display prices", () => {
    expect(
      mapSingleModel({
        display_pricing: [
          {
            sku_label: "Input Price",
            price: "not-a-number",
            displayMultiplier: 1_000_000,
            unitLabel: "/M tokens",
          },
          {
            sku_label: "Output Price",
            displayMultiplier: 1_000_000,
            unitLabel: "/M tokens",
          },
        ],
        pricing: {
          prompt: "0.000001",
          completion: "0.000002",
        },
      }),
    ).toMatchObject({
      inputPrice: null,
      outputPrice: null,
    });
  });

  it("filters unavailable and OpenRouter-internal models", () => {
    expect(
      mapOpenRouterCatalogModels({
        data: [
          {
            slug: "anthropic/served",
            permaslug: "anthropic/served-20260101",
            short_name: "Served",
            endpoint: {
              pricing: {
                prompt: "0.000001",
                completion: "0.000002",
              },
            },
          },
          {
            slug: "anthropic/unserved",
            permaslug: "anthropic/unserved-20260101",
            endpoint: null,
          },
          {
            slug: "openrouter/auto",
            permaslug: "openrouter/auto",
            endpoint: {},
          },
          {
            slug: "anthropic/internal-permaslug",
            permaslug: "openrouter/internal",
            endpoint: {},
          },
        ],
      }),
    ).toMatchObject([
      {
        slug: "anthropic/served",
        inputPrice: "$1/M tokens",
        outputPrice: "$2/M tokens",
      },
    ]);
  });
});
