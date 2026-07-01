import { ModelCatalogSourceUnavailableError } from "../application/model-catalog.errors";
import type { ModelCatalogModel } from "../domain/model-catalog-model";
import { OpenRouterModelCatalogClient } from "./openrouter-model-catalog.client";

const emptyBenchmarks = {
  artificialAnalysis: [],
  designArena: {
    eloBounds: {
      max: null,
      min: null,
    },
    records: [],
  },
  genericScores: {
    lookbackDays: null,
    scores: [],
  },
};

describe(OpenRouterModelCatalogClient.name, () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("uses cached OpenRouter providers to map catalog author metadata", async () => {
    const fetchMock = jest.fn(async (input: unknown) => {
      const url = String(input);

      if (url.includes("/all-providers")) {
        return new Response(
          JSON.stringify({
            data: [
              {
                slug: "anthropic",
                displayName: "Anthropic Provider",
                icon: {
                  url: "/images/icons/Anthropic.svg",
                },
              },
            ],
          }),
          { status: 200 },
        );
      }

      return new Response(
        JSON.stringify({
          data: [
            {
              slug: "anthropic/claude-sonnet-5",
              permaslug: "anthropic/claude-sonnet-5-20260630",
              name: "Anthropic: Claude Sonnet 5",
              author: "anthropic",
              input_modalities: ["text"],
              output_modalities: ["text"],
              endpoint: {},
            },
          ],
        }),
        { status: 200 },
      );
    });
    globalThis.fetch = fetchMock;
    const client = new OpenRouterModelCatalogClient();

    await expect(client.listModels()).resolves.toMatchObject([
      {
        authorIconUrl: "https://openrouter.ai/images/icons/Anthropic.svg",
        authorName: "Anthropic Provider",
        displayName: "Claude Sonnet 5",
      },
    ]);
    await client.listModels();

    expect(
      fetchMock.mock.calls.filter(([input]) =>
        String(input).includes("/all-providers"),
      ),
    ).toHaveLength(1);
  });

  it("falls back to catalog metadata when a warned model has no endpoints", async () => {
    const model = createModel({
      warningMessage: "**Access may be interrupted.**",
    });
    globalThis.fetch = jest.fn(async () => new Response("{}", { status: 404 }));
    const client = new OpenRouterModelCatalogClient();

    await expect(client.getModelEndpointMetadata(model)).resolves.toEqual({
      averageP50Latency: model.averageP50Latency,
      averageP50Throughput: model.averageP50Throughput,
      benchmarks: emptyBenchmarks,
      capabilities: model.capabilities,
      pricingCatalog: model.pricingCatalog,
      supportedParameterDetails: model.supportedParameterDetails,
    });
  });

  it("treats missing endpoints as source-unavailable for models without warnings", async () => {
    globalThis.fetch = jest.fn(async () => new Response("{}", { status: 404 }));
    const client = new OpenRouterModelCatalogClient();

    await expect(
      client.getModelEndpointMetadata(createModel({ warningMessage: null })),
    ).rejects.toBeInstanceOf(ModelCatalogSourceUnavailableError);
  });
});

function createModel(
  overrides: Partial<ModelCatalogModel> = {},
): ModelCatalogModel {
  return {
    authorIconUrl: null,
    authorName: "Anthropic",
    capabilities: [],
    contextWindowSize: 1_000_000,
    description: "Fable model.",
    displayName: "Claude Fable 5",
    inputModalities: ["text", "image", "file"],
    inputPrice: null,
    maxOutputTokens: null,
    outputModalities: ["text"],
    outputPrice: null,
    permaslug: "anthropic/claude-5-fable-20260609",
    pricingCatalog: [],
    benchmarks: emptyBenchmarks,
    averageP50Throughput: null,
    averageP50Latency: null,
    releaseDate: null,
    slug: "anthropic/claude-fable-5",
    supportedParameterDetails: [],
    supportedParameters: [],
    warningMessage: "**Access may be interrupted.**",
    ...overrides,
  };
}
