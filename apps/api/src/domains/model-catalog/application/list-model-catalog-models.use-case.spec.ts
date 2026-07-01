import { ListModelCatalogModelsUseCase } from "./list-model-catalog-models.use-case";
import type { ModelCatalogSource } from "./model-catalog-source";

describe(ListModelCatalogModelsUseCase.name, () => {
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
  const models = [
    {
      slug: "anthropic/claude-sonnet-5",
      permaslug: "anthropic/claude-sonnet-5-20260630",
      displayName: "Claude Sonnet 5",
      description: "Frontier Sonnet-class model.",
      warningMessage: null,
      authorName: "Anthropic",
      authorIconUrl: "https://openrouter.ai/images/icons/Anthropic.svg",
      inputModalities: ["text", "image"],
      outputModalities: ["text"],
      supportedParameters: ["tools", "reasoning"],
      supportedParameterDetails: [
        {
          key: "reasoning",
          name: "Reasoning",
          type: "object",
          values: "Any",
        },
        {
          key: "tools",
          name: "Tools",
          type: "array",
          values: "Any",
        },
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
      ],
      releaseDate: "2026-06-30T18:11:23.921Z",
      inputPrice: "$2/M tokens",
      outputPrice: "$10/M tokens",
      pricingCatalog: [],
      benchmarks: emptyBenchmarks,
      averageP50Throughput: null,
      averageP50Latency: null,
      contextWindowSize: 1_000_000,
      maxOutputTokens: 65_536,
    },
    {
      slug: "openai/gpt-4o-mini",
      permaslug: "openai/gpt-4o-mini-20260701",
      displayName: "GPT-4o Mini",
      description: "Small multimodal model.",
      warningMessage: null,
      authorName: "OpenAI",
      authorIconUrl: null,
      inputModalities: ["text"],
      outputModalities: ["text"],
      supportedParameters: ["response_format"],
      supportedParameterDetails: [
        {
          key: "response_format",
          name: "Response Format",
          type: "object",
          values: "Any",
        },
      ],
      capabilities: [
        {
          key: "text.structured-outputs",
          label: "Structured Outputs",
          outputModality: "text",
        },
      ],
      releaseDate: null,
      inputPrice: null,
      outputPrice: null,
      pricingCatalog: [],
      benchmarks: emptyBenchmarks,
      averageP50Throughput: null,
      averageP50Latency: null,
      contextWindowSize: 65_536,
      maxOutputTokens: 16_384,
    },
    {
      slug: "xiaomi/mi-vision-pro",
      permaslug: "xiaomi/mi-vision-pro-20260620",
      displayName: "Mi Vision Pro",
      description: "Image model.",
      warningMessage: null,
      authorName: " Xiaomi ",
      authorIconUrl: "https://openrouter.ai/images/icons/Xiaomi.svg",
      inputModalities: ["text", "image"],
      outputModalities: ["image"],
      supportedParameters: ["reasoning"],
      supportedParameterDetails: [
        {
          key: "reasoning",
          name: "Reasoning",
          type: "object",
          values: "Any",
        },
      ],
      capabilities: [
        {
          key: "image.text-to-image",
          label: "Text to Image",
          outputModality: "image",
        },
      ],
      releaseDate: "2026-06-20T00:00:00.000Z",
      inputPrice: "$0.20/M tokens",
      outputPrice: "$1/image",
      pricingCatalog: [],
      benchmarks: emptyBenchmarks,
      averageP50Throughput: null,
      averageP50Latency: null,
      contextWindowSize: 32_000,
      maxOutputTokens: null,
    },
  ];

  it("caches the canonical source list across list calls", async () => {
    const source = createSource();
    const useCase = new ListModelCatalogModelsUseCase(source);

    await useCase.execute();
    await useCase.execute({ outputModalities: ["image"] });

    expect(source.listModels).toHaveBeenCalledTimes(1);
  });

  it("uses OR semantics within a filter category", async () => {
    const useCase = new ListModelCatalogModelsUseCase(createSource());

    await expect(
      useCase.execute({ providers: ["Anthropic", "OpenAI"] }),
    ).resolves.toMatchObject({
      data: [models[0], models[1]],
    });
  });

  it("uses AND semantics across filter categories", async () => {
    const useCase = new ListModelCatalogModelsUseCase(createSource());

    await expect(
      useCase.execute({
        inputModalities: ["image"],
        providers: ["Xiaomi"],
        supportedParameters: ["reasoning"],
      }),
    ).resolves.toMatchObject({
      data: [models[2]],
    });
  });

  it("filters by supported parameters", async () => {
    const useCase = new ListModelCatalogModelsUseCase(createSource());

    await expect(
      useCase.execute({ supportedParameters: ["response_format"] }),
    ).resolves.toMatchObject({
      data: [models[1]],
    });
  });

  it("loads a single model and enriches endpoint metadata", async () => {
    const source = createSource();
    const endpointCapabilities = [
      {
        key: "text.web-search",
        label: "Web Search",
        outputModality: "text",
      },
    ];
    const supportedParameterDetails = [
      {
        key: "web_search_options",
        name: "Web Search Options",
        type: "object",
        values: "Any",
      },
    ];
    const pricingCatalog = [
      {
        providerName: "Anthropic",
        providerSlug: "anthropic",
        rows: [
          {
            skuLabel: "Input Price",
            price: "$2",
            unitLabel: "/M tokens",
            condition: null,
            source: "display_pricing" as const,
          },
        ],
      },
    ];
    source.getModelEndpointMetadata.mockResolvedValue({
      averageP50Throughput: 55,
      averageP50Latency: 3104,
      benchmarks: emptyBenchmarks,
      capabilities: endpointCapabilities,
      pricingCatalog,
      supportedParameterDetails,
    });
    const useCase = new ListModelCatalogModelsUseCase(source);

    await expect(
      useCase.getModel("anthropic/claude-sonnet-5-20260630"),
    ).resolves.toMatchObject({
      permaslug: "anthropic/claude-sonnet-5-20260630",
      averageP50Throughput: 55,
      averageP50Latency: 3104,
      benchmarks: emptyBenchmarks,
      capabilities: endpointCapabilities,
      pricingCatalog,
      supportedParameterDetails,
    });
    expect(source.getModelEndpointMetadata).toHaveBeenCalledWith(models[0]);
  });

  it("loads a single model by mutable slug", async () => {
    const useCase = new ListModelCatalogModelsUseCase(createSource());

    await expect(useCase.getModel("openai/gpt-4o-mini")).resolves.toMatchObject(
      {
        permaslug: "openai/gpt-4o-mini-20260701",
      },
    );
  });

  it("builds filter metadata from the full cached list", async () => {
    const useCase = new ListModelCatalogModelsUseCase(createSource());

    await expect(
      useCase.execute({ providers: ["Anthropic"] }),
    ).resolves.toMatchObject({
      data: [models[0]],
      filters: {
        inputModalities: ["text", "image"],
        outputModalities: ["text", "image"],
        providers: ["Anthropic", "OpenAI", "Xiaomi"],
        supportedParameters: ["reasoning", "response_format", "tools"],
      },
    });
  });

  function createSource(): jest.Mocked<ModelCatalogSource> {
    return {
      listModels: jest.fn(async () => models),
      getModelEndpointMetadata: jest.fn(async (model) => ({
        averageP50Throughput: model.averageP50Throughput,
        averageP50Latency: model.averageP50Latency,
        benchmarks: model.benchmarks,
        capabilities: model.capabilities,
        pricingCatalog: model.pricingCatalog,
        supportedParameterDetails: model.supportedParameterDetails,
      })),
    };
  }
});
