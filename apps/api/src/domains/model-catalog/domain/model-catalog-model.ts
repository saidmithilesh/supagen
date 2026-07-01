export type ModelCatalogModel = {
  slug: string;
  permaslug: string;
  displayName: string;
  description: string | null;
  warningMessage: string | null;
  authorName: string | null;
  authorIconUrl: string | null;
  inputModalities: string[];
  outputModalities: string[];
  supportedParameters: string[];
  supportedParameterDetails: ModelCatalogParameter[];
  capabilities: ModelCatalogCapability[];
  releaseDate: string | null;
  inputPrice: string | null;
  outputPrice: string | null;
  pricingCatalog: ModelCatalogPricingGroup[];
  benchmarks: ModelCatalogBenchmarks;
  averageP50Throughput: number | null;
  averageP50Latency: number | null;
  contextWindowSize: number | null;
  maxOutputTokens: number | null;
};

export type ModelCatalogCapability = {
  key: string;
  label: string;
  outputModality: string;
};

export type ModelCatalogParameter = {
  key: string;
  name: string;
  type: string;
  values: string;
};

export type ModelCatalogPricingGroup = {
  providerName: string | null;
  providerSlug: string | null;
  rows: ModelCatalogPricingRow[];
};

export type ModelCatalogPricingRow = {
  skuLabel: string;
  price: string;
  unitLabel: string;
  condition: string | null;
  source: "display_pricing" | "raw_token_pricing";
};

export type ModelCatalogBenchmarks = {
  genericScores: {
    lookbackDays: number | null;
    scores: ModelCatalogBenchmarkScore[];
  };
  artificialAnalysis: ModelCatalogArtificialAnalysisBenchmark[];
  designArena: {
    eloBounds: {
      min: number | null;
      max: number | null;
    };
    records: ModelCatalogDesignArenaBenchmark[];
  };
};

export type ModelCatalogBenchmarkScore = {
  name: string;
  value: string;
  rank: number | null;
};

export type ModelCatalogArtificialAnalysisBenchmark = {
  slug: string | null;
  name: string;
  modelType: string | null;
  elo: number | null;
  rank: number | null;
  ci95: string | null;
  appearances: number | null;
  percentiles: ModelCatalogArtificialAnalysisPercentile[];
  evaluations: ModelCatalogBenchmarkScore[];
  categories: ModelCatalogArtificialAnalysisCategory[];
};

export type ModelCatalogArtificialAnalysisPercentile = {
  name: string;
  value: number;
};

export type ModelCatalogArtificialAnalysisCategory = {
  name: string;
  categoryType: string;
  elo: number | null;
  ci95: string | null;
  appearances: number | null;
};

export type ModelCatalogDesignArenaBenchmark = {
  name: string;
  category: string | null;
  elo: number | null;
  eloPercentile: number | null;
  winRate: number | null;
  averageGenerationTimeMs: number | null;
  totalTournaments: number | null;
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
