import { mapOpenRouterCatalogModels } from "./openrouter-model-catalog.mapper";

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
            endpoint: {
              context_length: 900_000,
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
        releaseDate: "2026-06-30T18:11:23.921Z",
        inputPrice: "$2/M tokens",
        outputPrice: "$10/M tokens",
        contextWindowSize: 900_000,
      },
    ]);
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
