import type { ModelCatalogModel } from "../domain/model-catalog-model";

export interface ModelCatalogSource {
  listModels(): Promise<ModelCatalogModel[]>;
  getModelEndpointMetadata(
    model: ModelCatalogModel,
  ): Promise<
    Pick<ModelCatalogModel, "capabilities" | "supportedParameterDetails">
  >;
}
