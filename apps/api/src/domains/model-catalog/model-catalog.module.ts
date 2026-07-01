import { Module } from "@nestjs/common";

import { ListModelCatalogModelsUseCase } from "./application/list-model-catalog-models.use-case";
import { OpenRouterModelCatalogClient } from "./infrastructure/openrouter-model-catalog.client";
import { MODEL_CATALOG_SOURCE } from "./model-catalog.constants";
import { ModelCatalogController } from "./presentation/model-catalog.controller";

@Module({
  controllers: [ModelCatalogController],
  providers: [
    ListModelCatalogModelsUseCase,
    OpenRouterModelCatalogClient,
    {
      provide: MODEL_CATALOG_SOURCE,
      useExisting: OpenRouterModelCatalogClient,
    },
  ],
})
export class ModelCatalogModule {}
