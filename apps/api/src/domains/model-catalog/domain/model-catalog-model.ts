export type ModelCatalogModel = {
  slug: string;
  permaslug: string;
  displayName: string;
  description: string | null;
  authorName: string | null;
  authorIconUrl: string | null;
  inputModalities: string[];
  outputModalities: string[];
  supportedParameters: string[];
  capabilities: ModelCatalogCapability[];
  releaseDate: string | null;
  inputPrice: string | null;
  outputPrice: string | null;
  contextWindowSize: number | null;
  maxOutputTokens: number | null;
};

export type ModelCatalogCapability = {
  key: string;
  label: string;
  outputModality: string;
};

export type ModelCatalogFilters = {
  inputModalities?: string[];
  outputModalities?: string[];
  providers?: string[];
  supportedParameters?: string[];
};

export type ModelCatalogFilterOptions = {
  inputModalities: string[];
  outputModalities: string[];
  providers: string[];
  supportedParameters: string[];
};

export type ListModelCatalogModelsResponse = {
  data: ModelCatalogModel[];
  filters: ModelCatalogFilterOptions;
};
