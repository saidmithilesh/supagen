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
  percentiles: Array<{
    name: string;
    value: number;
  }>;
  evaluations: ModelCatalogBenchmarkScore[];
  categories: Array<{
    name: string;
    categoryType: string;
    elo: number | null;
    ci95: string | null;
    appearances: number | null;
  }>;
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

export class ModelCatalogApiError extends Error {
  constructor(readonly status: number) {
    super(`Model catalog request failed with status ${status}`);
  }
}

export class ModelCatalogModelNotFoundError extends Error {
  constructor(readonly modelRef: string) {
    super(`Model catalog model not found: ${modelRef}`);
  }
}

export async function listModelCatalogModels(
  filters: ModelCatalogFilters = {},
) {
  const response = await fetch(getApiUrl("/model-catalog/models", filters), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new ModelCatalogApiError(response.status);
  }

  return (await response.json()) as ListModelCatalogModelsResponse;
}

export async function getModelCatalogModel(modelRef: string) {
  const response = await fetch(getApiUrl(getModelCatalogModelPath(modelRef)), {
    headers: {
      Accept: "application/json",
    },
  });

  if (response.status === 404) {
    throw new ModelCatalogModelNotFoundError(modelRef);
  }

  if (!response.ok) {
    throw new ModelCatalogApiError(response.status);
  }

  return (await response.json()) as ModelCatalogModel;
}

function getApiUrl(path: string, filters: ModelCatalogFilters = {}) {
  const baseUrl = getConfiguredApiBaseUrl();
  const searchParams = new URLSearchParams();

  addFilterParam(searchParams, "inputModalities", filters.inputModalities);
  addFilterParam(searchParams, "outputModalities", filters.outputModalities);
  addFilterParam(searchParams, "providers", filters.providers);
  addFilterParam(
    searchParams,
    "supportedParameters",
    filters.supportedParameters,
  );

  const query = searchParams.toString();

  return `${baseUrl}/api/v1${path}${query ? `?${query}` : ""}`;
}

function getConfiguredApiBaseUrl() {
  const value = import.meta.env.VITE_SUPAGEN_API_URL?.trim();

  return value ? value.replace(/\/$/, "") : "";
}

function addFilterParam(
  searchParams: URLSearchParams,
  key: keyof ModelCatalogFilters,
  values: string[] | undefined,
) {
  const selectedValues = (values ?? [])
    .map((value) => value.trim())
    .filter(Boolean);

  if (selectedValues.length > 0) {
    searchParams.set(key, selectedValues.join(","));
  }
}

function normalizeModelRef(value: string) {
  return safelyDecodeURIComponent(value).replace(/^\/+|\/+$/g, "");
}

function getModelCatalogModelPath(modelRef: string) {
  const normalizedModelRef = normalizeModelRef(modelRef);
  const [author, ...modelParts] = normalizedModelRef.split("/");
  const model = modelParts.join("/");

  return `/model-catalog/models/${encodeURIComponent(author)}/${encodeURIComponent(model)}`;
}

function safelyDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
