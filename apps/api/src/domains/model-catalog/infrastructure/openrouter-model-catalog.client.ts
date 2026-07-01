import { Injectable } from "@nestjs/common";

import { ModelCatalogSourceUnavailableError } from "../application/model-catalog.errors";
import type { ModelCatalogSource } from "../application/model-catalog-source";
import type { ModelCatalogModel } from "../domain/model-catalog-model";
import {
  mapOpenRouterCatalogModels,
  mapOpenRouterModelBenchmarks,
  mapOpenRouterModelEndpointMetadata,
} from "./openrouter-model-catalog.mapper";

const OPENROUTER_CATALOG_MODELS_URL =
  "https://openrouter.ai/api/frontend/v1/catalog/models";
const OPENROUTER_MODEL_ENDPOINTS_URL =
  "https://openrouter.ai/api/frontend/v1/stats/endpoint";
const OPENROUTER_BENCHMARK_SCORES_URL =
  "https://openrouter.ai/api/frontend/v1/stats/benchmark-scores";
const OPENROUTER_ARTIFICIAL_ANALYSIS_BENCHMARKS_URL =
  "https://openrouter.ai/api/frontend/v1/private/artificial-analysis-benchmarks";
const OPENROUTER_DESIGN_ARENA_BENCHMARKS_URL =
  "https://openrouter.ai/api/frontend/v1/private/design-arena-benchmarks";

@Injectable()
export class OpenRouterModelCatalogClient implements ModelCatalogSource {
  async listModels() {
    let response: Response;

    try {
      response = await fetch(OPENROUTER_CATALOG_MODELS_URL, {
        headers: {
          Accept: "application/json",
        },
      });
    } catch (error) {
      throw new ModelCatalogSourceUnavailableError(
        getErrorMessage("OpenRouter catalog request failed.", error),
      );
    }

    if (!response.ok) {
      throw new ModelCatalogSourceUnavailableError(
        `OpenRouter catalog request failed with status ${response.status}.`,
      );
    }

    try {
      return mapOpenRouterCatalogModels(await response.json());
    } catch (error) {
      throw new ModelCatalogSourceUnavailableError(
        getErrorMessage("OpenRouter catalog response was invalid.", error),
      );
    }
  }

  async getModelEndpointMetadata(model: ModelCatalogModel) {
    const url = new URL(OPENROUTER_MODEL_ENDPOINTS_URL);
    url.searchParams.set("permaslug", model.permaslug);

    let response: Response;
    const benchmarksPromise = this.getModelBenchmarks(model.permaslug);

    try {
      response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      });
    } catch (error) {
      throw new ModelCatalogSourceUnavailableError(
        getErrorMessage("OpenRouter model endpoints request failed.", error),
      );
    }

    if (response.status === 404 && model.warningMessage) {
      return {
        averageP50Latency: model.averageP50Latency,
        averageP50Throughput: model.averageP50Throughput,
        benchmarks: await benchmarksPromise,
        capabilities: model.capabilities,
        pricingCatalog: model.pricingCatalog,
        supportedParameterDetails: model.supportedParameterDetails,
      };
    }

    if (!response.ok) {
      throw new ModelCatalogSourceUnavailableError(
        `OpenRouter model endpoints request failed with status ${response.status}.`,
      );
    }

    try {
      return {
        ...mapOpenRouterModelEndpointMetadata(model, await response.json()),
        benchmarks: await benchmarksPromise,
      };
    } catch (error) {
      throw new ModelCatalogSourceUnavailableError(
        getErrorMessage(
          "OpenRouter model endpoints response was invalid.",
          error,
        ),
      );
    }
  }

  private async getModelBenchmarks(permaslug: string) {
    const [genericScores, artificialAnalysis, designArena] = await Promise.all([
      fetchOptionalJson(
        getBenchmarkUrl(OPENROUTER_BENCHMARK_SCORES_URL, {
          permaslug,
        }),
      ),
      fetchOptionalJson(
        getBenchmarkUrl(OPENROUTER_ARTIFICIAL_ANALYSIS_BENCHMARKS_URL, {
          slug: permaslug,
        }),
      ),
      fetchOptionalJson(
        getBenchmarkUrl(OPENROUTER_DESIGN_ARENA_BENCHMARKS_URL, {
          slug: permaslug,
        }),
      ),
    ]);

    return mapOpenRouterModelBenchmarks({
      artificialAnalysis,
      designArena,
      genericScores,
    });
  }
}

function getBenchmarkUrl(baseUrl: string, params: Record<string, string>) {
  const url = new URL(baseUrl);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return url;
}

async function fetchOptionalJson(url: URL) {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

function getErrorMessage(prefix: string, error: unknown) {
  return error instanceof Error ? `${prefix} ${error.message}` : prefix;
}
