import { Injectable } from "@nestjs/common";

import { ModelCatalogSourceUnavailableError } from "../application/model-catalog.errors";
import type { ModelCatalogSource } from "../application/model-catalog-source";
import { mapOpenRouterCatalogModels } from "./openrouter-model-catalog.mapper";

const OPENROUTER_CATALOG_MODELS_URL =
  "https://openrouter.ai/api/frontend/v1/catalog/models";

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
}

function getErrorMessage(prefix: string, error: unknown) {
  return error instanceof Error ? `${prefix} ${error.message}` : prefix;
}
