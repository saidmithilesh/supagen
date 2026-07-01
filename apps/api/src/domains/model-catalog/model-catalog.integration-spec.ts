import { Test } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";

import { configureApp } from "../../configure-app";
import { MODEL_CATALOG_SOURCE } from "./model-catalog.constants";
import { ModelCatalogModule } from "./model-catalog.module";
import type { ModelCatalogSource } from "./application/model-catalog-source";

describe("Model catalog API", () => {
  let app: INestApplication;

  const models = [
    {
      slug: "anthropic/claude-sonnet-5",
      permaslug: "anthropic/claude-sonnet-5-20260630",
      displayName: "Claude Sonnet 5",
      description: "Frontier Sonnet-class model.",
      authorName: "Anthropic",
      authorIconUrl: "https://openrouter.ai/images/icons/Anthropic.svg",
      inputModalities: ["text", "image"],
      outputModalities: ["text"],
      supportedParameters: ["tools", "reasoning"],
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
      contextWindowSize: 1_000_000,
      maxOutputTokens: 65_536,
    },
    {
      slug: "openai/gpt-4o-mini",
      permaslug: "openai/gpt-4o-mini-20260701",
      displayName: "GPT-4o Mini",
      description: "Small multimodal model.",
      authorName: "OpenAI",
      authorIconUrl: null,
      inputModalities: ["text"],
      outputModalities: ["text"],
      supportedParameters: ["response_format"],
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
      contextWindowSize: 65_536,
      maxOutputTokens: 16_384,
    },
    {
      slug: "xiaomi/mi-vision-pro",
      permaslug: "xiaomi/mi-vision-pro-20260620",
      displayName: "Mi Vision Pro",
      description: "Image model.",
      authorName: "Xiaomi",
      authorIconUrl: "https://openrouter.ai/images/icons/Xiaomi.svg",
      inputModalities: ["text", "image"],
      outputModalities: ["image"],
      supportedParameters: ["reasoning"],
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
      contextWindowSize: 32_000,
      maxOutputTokens: null,
    },
  ];
  const modelCatalogSource: ModelCatalogSource = {
    async listModels() {
      return models;
    },
    async getModelCapabilities(model) {
      return model.permaslug === "anthropic/claude-sonnet-5-20260630"
        ? [
            ...model.capabilities,
            {
              key: "text.web-search",
              label: "Web Search",
              outputModality: "text",
            },
          ]
        : model.capabilities;
    },
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ModelCatalogModule],
    })
      .overrideProvider(MODEL_CATALOG_SOURCE)
      .useValue(modelCatalogSource)
      .compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("lists public model catalog models without authentication", async () => {
    await request(app.getHttpServer())
      .get("/api/v1/model-catalog/models")
      .expect(200)
      .expect({
        data: models,
        filters: {
          inputModalities: ["text", "image"],
          outputModalities: ["text", "image"],
          providers: ["Anthropic", "OpenAI", "Xiaomi"],
          supportedParameters: ["reasoning", "response_format", "tools"],
        },
      });
  });

  it("applies Supagen filter query params to the cached catalog", async () => {
    await request(app.getHttpServer())
      .get(
        "/api/v1/model-catalog/models?inputModalities=image&providers=Anthropic,Xiaomi&supportedParameters=reasoning",
      )
      .expect(200)
      .expect({
        data: [models[0], models[2]],
        filters: {
          inputModalities: ["text", "image"],
          outputModalities: ["text", "image"],
          providers: ["Anthropic", "OpenAI", "Xiaomi"],
          supportedParameters: ["reasoning", "response_format", "tools"],
        },
      });
  });

  it("returns a single model with endpoint-aggregated capabilities", async () => {
    await request(app.getHttpServer())
      .get("/api/v1/model-catalog/models/anthropic/claude-sonnet-5-20260630")
      .expect(200)
      .expect({
        ...models[0],
        capabilities: [
          ...models[0].capabilities,
          {
            key: "text.web-search",
            label: "Web Search",
            outputModality: "text",
          },
        ],
      });
  });

  it("returns not found for missing single models", async () => {
    await request(app.getHttpServer())
      .get("/api/v1/model-catalog/models/missing/model")
      .expect(404)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          code: "MODEL_CATALOG_MODEL_NOT_FOUND",
        });
      });
  });
});
