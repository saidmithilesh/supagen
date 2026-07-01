import { Test } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";

import { configureApp } from "../../configure-app";
import { MODEL_CATALOG_SOURCE } from "./model-catalog.constants";
import { ModelCatalogModule } from "./model-catalog.module";
import type { ModelCatalogSource } from "./application/model-catalog-source";

describe("Model catalog API", () => {
  let app: INestApplication;

  const modelCatalogSource: ModelCatalogSource = {
    async listModels() {
      return [
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
          contextWindowSize: 1_000_000,
        },
      ];
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
        data: [
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
            contextWindowSize: 1_000_000,
          },
        ],
      });
  });
});
