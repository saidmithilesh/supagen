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
