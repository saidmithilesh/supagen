import { Injectable } from "@nestjs/common";

import { ModelCatalogSourceUnavailableError } from "../application/model-catalog.errors";
import type { ModelCatalogSource } from "../application/model-catalog-source";
import type { ModelCatalogModel } from "../domain/model-catalog-model";
import {
  mapOpenRouterCatalogModels,
  mapOpenRouterModelEndpointCapabilities,
} from "./openrouter-model-catalog.mapper";

const OPENROUTER_CATALOG_MODELS_URL =
  "https://openrouter.ai/api/frontend/v1/catalog/models";
const OPENROUTER_MODEL_ENDPOINTS_URL =
  "https://openrouter.ai/api/frontend/v1/stats/endpoint";

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

  async getModelCapabilities(model: ModelCatalogModel) {
    const url = new URL(OPENROUTER_MODEL_ENDPOINTS_URL);
    url.searchParams.set("permaslug", model.permaslug);

    let response: Response;

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

    if (!response.ok) {
      throw new ModelCatalogSourceUnavailableError(
        `OpenRouter model endpoints request failed with status ${response.status}.`,
      );
    }

    try {
      return mapOpenRouterModelEndpointCapabilities(
        model,
        await response.json(),
      );
    } catch (error) {
      throw new ModelCatalogSourceUnavailableError(
        getErrorMessage(
          "OpenRouter model endpoints response was invalid.",
          error,
        ),
      );
    }
  }
}

function getErrorMessage(prefix: string, error: unknown) {
  return error instanceof Error ? `${prefix} ${error.message}` : prefix;
}
