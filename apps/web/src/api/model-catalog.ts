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

export class ModelCatalogApiError extends Error {
  constructor(readonly status: number) {
    super(`Model catalog request failed with status ${status}`);
  }
}

export async function listModelCatalogModels() {
  const response = await fetch(getApiUrl("/model-catalog/models"), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new ModelCatalogApiError(response.status);
  }

  return (await response.json()) as ListModelCatalogModelsResponse;
}

function getApiUrl(path: string) {
  const baseUrl = getConfiguredApiBaseUrl();

  return `${baseUrl}/api/v1${path}`;
}

function getConfiguredApiBaseUrl() {
  const value = import.meta.env.VITE_SUPAGEN_API_URL?.trim();

  return value ? value.replace(/\/$/, "") : "";
}
