export type ModelCatalogModel = {
  slug: string;
  permaslug: string;
  displayName: string;
  description: string | null;
  authorName: string | null;
  authorIconUrl: string | null;
  inputModalities: string[];
  outputModalities: string[];
  releaseDate: string | null;
  inputPrice: string | null;
  outputPrice: string | null;
  contextWindowSize: number | null;
};

export type ListModelCatalogModelsResponse = {
  data: ModelCatalogModel[];
};
