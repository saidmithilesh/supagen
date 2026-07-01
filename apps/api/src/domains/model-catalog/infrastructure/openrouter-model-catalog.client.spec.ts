import { ModelCatalogSourceUnavailableError } from "../application/model-catalog.errors";
import type { ModelCatalogModel } from "../domain/model-catalog-model";
import { OpenRouterModelCatalogClient } from "./openrouter-model-catalog.client";

describe(OpenRouterModelCatalogClient.name, () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("falls back to catalog metadata when a warned model has no endpoints", async () => {
    const model = createModel({
      warningMessage: "**Access may be interrupted.**",
    });
    globalThis.fetch = jest.fn(async () => new Response("{}", { status: 404 }));
    const client = new OpenRouterModelCatalogClient();

    await expect(client.getModelEndpointMetadata(model)).resolves.toEqual({
      capabilities: model.capabilities,
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
    releaseDate: null,
    slug: "anthropic/claude-fable-5",
    supportedParameterDetails: [],
    supportedParameters: [],
    warningMessage: "**Access may be interrupted.**",
    ...overrides,
  };
}
