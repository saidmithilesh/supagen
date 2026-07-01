import type { ModelCatalogModel } from "../domain/model-catalog-model";

export interface ModelCatalogSource {
  listModels(): Promise<ModelCatalogModel[]>;
  getModelCapabilities(
    model: ModelCatalogModel,
  ): Promise<ModelCatalogModel["capabilities"]>;
}
