import {
  BadGatewayException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from "@nestjs/common";

import { ListModelCatalogModelsUseCase } from "../application/list-model-catalog-models.use-case";
import {
  ModelCatalogModelNotFoundError,
  ModelCatalogSourceUnavailableError,
} from "../application/model-catalog.errors";

@Controller("model-catalog/models")
export class ModelCatalogController {
  constructor(
    private readonly listModelCatalogModels: ListModelCatalogModelsUseCase,
  ) {}

  @Get()
  async listModels(
    @Query("inputModalities") inputModalities?: string | string[],
    @Query("outputModalities") outputModalities?: string | string[],
    @Query("providers") providers?: string | string[],
    @Query("supportedParameters") supportedParameters?: string | string[],
  ) {
    try {
      return await this.listModelCatalogModels.execute({
        inputModalities: parseQueryList(inputModalities),
        outputModalities: parseQueryList(outputModalities),
        providers: parseQueryList(providers),
        supportedParameters: parseQueryList(supportedParameters),
      });
    } catch (error) {
      if (error instanceof ModelCatalogSourceUnavailableError) {
        throw new BadGatewayException({
          code: "MODEL_CATALOG_SOURCE_UNAVAILABLE",
        });
      }

      throw error;
    }
  }

  @Get(":author/:model")
  async getModel(
    @Param("author") author: string,
    @Param("model") model: string,
  ) {
    try {
      return await this.listModelCatalogModels.getModel(`${author}/${model}`);
    } catch (error) {
      if (error instanceof ModelCatalogModelNotFoundError) {
        throw new NotFoundException({
          code: "MODEL_CATALOG_MODEL_NOT_FOUND",
        });
      }

      if (error instanceof ModelCatalogSourceUnavailableError) {
        throw new BadGatewayException({
          code: "MODEL_CATALOG_SOURCE_UNAVAILABLE",
        });
      }

      throw error;
    }
  }
}

function parseQueryList(value: string | string[] | undefined) {
  if (!value) {
    return undefined;
  }

  const values = Array.isArray(value) ? value : [value];
  const parsedValues = values
    .flatMap((entry) => entry.split(","))
    .map((entry) => entry.trim())
    .filter(Boolean);

  return parsedValues.length > 0 ? [...new Set(parsedValues)] : undefined;
}
