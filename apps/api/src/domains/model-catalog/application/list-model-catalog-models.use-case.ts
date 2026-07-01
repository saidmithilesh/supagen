import { Inject, Injectable } from "@nestjs/common";

import type {
  ListModelCatalogModelsResponse,
  ModelCatalogFilterOptions,
  ModelCatalogFilters,
  ModelCatalogModel,
} from "../domain/model-catalog-model";
import { MODEL_CATALOG_SOURCE } from "../model-catalog.constants";
import { ModelCatalogModelNotFoundError } from "./model-catalog.errors";
import type { ModelCatalogSource } from "./model-catalog-source";

const MODALITY_OPTION_ORDER = [
  "text",
  "image",
  "audio",
  "video",
  "file",
  "embeddings",
  "rerank",
  "speech",
  "transcription",
];
const MODALITY_OPTION_INDEX = new Map(
  MODALITY_OPTION_ORDER.map((value, index) => [value, index] as const),
);

@Injectable()
export class ListModelCatalogModelsUseCase {
  private cachedModelsPromise: Promise<ModelCatalogModel[]> | null = null;

  constructor(
    @Inject(MODEL_CATALOG_SOURCE)
    private readonly modelCatalogSource: ModelCatalogSource,
  ) {}

  async execute(
    filters: ModelCatalogFilters = {},
  ): Promise<ListModelCatalogModelsResponse> {
    const models = await this.loadModels();

    return {
      data: filterModels(models, filters),
      filters: buildFilterOptions(models),
    };
  }

  async getModel(modelRef: string): Promise<ModelCatalogModel> {
    const normalizedModelRef = normalizeModelRef(modelRef);
    const models = await this.loadModels();
    const model = models.find(
      (candidate) =>
        normalizeModelRef(candidate.permaslug) === normalizedModelRef ||
        normalizeModelRef(candidate.slug) === normalizedModelRef,
    );

    if (!model) {
      throw new ModelCatalogModelNotFoundError(modelRef);
    }

    const endpointMetadata =
      await this.modelCatalogSource.getModelEndpointMetadata(model);

    return {
      ...model,
      ...endpointMetadata,
    };
  }

  private loadModels() {
    if (!this.cachedModelsPromise) {
      this.cachedModelsPromise = this.modelCatalogSource
        .listModels()
        .catch((error: unknown) => {
          this.cachedModelsPromise = null;
          throw error;
        });
    }

    return this.cachedModelsPromise;
  }
}

function filterModels(
  models: ModelCatalogModel[],
  filters: ModelCatalogFilters,
) {
  const inputModalities = normalizeSelectedValues(filters.inputModalities);
  const outputModalities = normalizeSelectedValues(filters.outputModalities);
  const providers = normalizeSelectedValues(filters.providers);
  const supportedParameters = normalizeSelectedValues(
    filters.supportedParameters,
  );

  return models.filter(
    (model) =>
      matchesAny(model.inputModalities, inputModalities) &&
      matchesAny(model.outputModalities, outputModalities) &&
      matchesAny([getProviderName(model)], providers) &&
      matchesAny(model.supportedParameters, supportedParameters),
  );
}

function buildFilterOptions(
  models: ModelCatalogModel[],
): ModelCatalogFilterOptions {
  return {
    inputModalities: collectSortedOptions(
      models.flatMap((model) => model.inputModalities),
      compareModalityOptions,
    ),
    outputModalities: collectSortedOptions(
      models.flatMap((model) => model.outputModalities),
      compareModalityOptions,
    ),
    providers: collectSortedOptions(models.map(getProviderName)),
    supportedParameters: collectSortedOptions(
      models.flatMap((model) => model.supportedParameters),
    ),
  };
}

function collectSortedOptions(
  values: string[],
  compare: (left: string, right: string) => number = compareOptions,
) {
  const optionsByKey = new Map<string, string>();

  for (const value of values) {
    const option = value.trim();

    if (!option) {
      continue;
    }

    const key = normalizeFilterValue(option);

    if (!optionsByKey.has(key)) {
      optionsByKey.set(key, option);
    }
  }

  return [...optionsByKey.values()].sort(compare);
}

function matchesAny(values: string[], selectedValues: Set<string>) {
  if (selectedValues.size === 0) {
    return true;
  }

  return values.some((value) =>
    selectedValues.has(normalizeFilterValue(value)),
  );
}

function normalizeSelectedValues(values: string[] | undefined) {
  return new Set(
    (values ?? [])
      .map((value) => normalizeFilterValue(value))
      .filter((value) => value.length > 0),
  );
}

function getProviderName(model: ModelCatalogModel) {
  return model.authorName?.trim() || "Unknown";
}

function compareModalityOptions(left: string, right: string) {
  const leftIndex = MODALITY_OPTION_INDEX.get(normalizeFilterValue(left));
  const rightIndex = MODALITY_OPTION_INDEX.get(normalizeFilterValue(right));

  if (leftIndex !== undefined || rightIndex !== undefined) {
    return (
      (leftIndex ?? Number.MAX_SAFE_INTEGER) -
      (rightIndex ?? Number.MAX_SAFE_INTEGER)
    );
  }

  return compareOptions(left, right);
}

function compareOptions(left: string, right: string) {
  return left.localeCompare(right, "en-US", { sensitivity: "base" });
}

function normalizeFilterValue(value: string) {
  return value.trim().toLowerCase();
}

function normalizeModelRef(value: string) {
  return value
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();
}
