import { BadGatewayException, Controller, Get } from "@nestjs/common";

import { ListModelCatalogModelsUseCase } from "../application/list-model-catalog-models.use-case";
import { ModelCatalogSourceUnavailableError } from "../application/model-catalog.errors";

@Controller("model-catalog/models")
export class ModelCatalogController {
  constructor(
    private readonly listModelCatalogModels: ListModelCatalogModelsUseCase,
  ) {}

  @Get()
  async listModels() {
    try {
      return await this.listModelCatalogModels.execute();
    } catch (error) {
      if (error instanceof ModelCatalogSourceUnavailableError) {
        throw new BadGatewayException({
          code: "MODEL_CATALOG_SOURCE_UNAVAILABLE",
        });
      }

      throw error;
    }
  }
}
