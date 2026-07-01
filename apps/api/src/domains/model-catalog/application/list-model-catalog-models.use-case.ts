import { Inject, Injectable } from "@nestjs/common";

import type { ListModelCatalogModelsResponse } from "../domain/model-catalog-model";
import { MODEL_CATALOG_SOURCE } from "../model-catalog.constants";
import type { ModelCatalogSource } from "./model-catalog-source";

@Injectable()
export class ListModelCatalogModelsUseCase {
  constructor(
    @Inject(MODEL_CATALOG_SOURCE)
    private readonly modelCatalogSource: ModelCatalogSource,
  ) {}

  async execute(): Promise<ListModelCatalogModelsResponse> {
    return {
      data: await this.modelCatalogSource.listModels(),
    };
  }
}
