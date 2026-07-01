import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import "../styles/homepage.css";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@supagen/ui/components/avatar";
import { Button } from "@supagen/ui/components/button";
import { MaterialIcon } from "@supagen/ui/components/material-icon";

import {
  listModelCatalogModels,
  type ModelCatalogFilterOptions,
  type ModelCatalogFilters,
  type ModelCatalogModel,
} from "../api/model-catalog";
import {
  ModalityIcons,
  PriceValue,
} from "../components/model-catalog/ModelCatalogDisplay";
import {
  formatContextWindow,
  formatModalityName,
  formatReleaseDate,
  getAuthorInitials,
} from "../components/model-catalog/ModelCatalogDisplay.utils";
import { HomepageNav } from "../components/marketing/HomepageNav";

const MODEL_CATALOG_QUERY_KEY = ["model-catalog", "models"] as const;
const MODEL_CATALOG_FILTER_SECTIONS = [
  { key: "inputModalities", label: "Input Modalities" },
  { key: "outputModalities", label: "Output Modalities" },
  { key: "providers", label: "Providers" },
  { key: "supportedParameters", label: "Supported Parameters" },
] as const;
const EMPTY_FILTER_OPTIONS: ModelCatalogFilterOptions = {
  inputModalities: [],
  outputModalities: [],
  providers: [],
  supportedParameters: [],
};
const EMPTY_SELECTED_FILTERS: SelectedModelCatalogFilters = {
  inputModalities: [],
  outputModalities: [],
  providers: [],
  supportedParameters: [],
};
const PREFERRED_AUTHOR_ORDER = [
  "anthropic",
  "google",
  "openai",
  "xai",
  "z.ai",
  "moonshot ai",
  "deepseek",
  "qwen",
] as const;
const PREFERRED_AUTHOR_SORT_KEYS = new Map<string, number>(
  PREFERRED_AUTHOR_ORDER.map((authorKey, index) => [authorKey, index]),
);
PREFERRED_AUTHOR_SORT_KEYS.set("x.ai", PREFERRED_AUTHOR_ORDER.indexOf("xai"));
PREFERRED_AUTHOR_SORT_KEYS.set("zai", PREFERRED_AUTHOR_ORDER.indexOf("z.ai"));
export const Route = createFileRoute("/models")({
  component: ModelsCatalogPage,
  head: () => ({
    meta: [
      { title: "Models | Supagen" },
      {
        name: "description",
        content:
          "Explore the Supagen model catalog for text, image, audio, and video generation providers.",
      },
    ],
  }),
});

export function ModelsCatalogPage() {
  const [selectedFilters, setSelectedFilters] =
    useState<SelectedModelCatalogFilters>(EMPTY_SELECTED_FILTERS);
  const modelsQuery = useQuery({
    queryKey: [
      ...MODEL_CATALOG_QUERY_KEY,
      selectedFilters.inputModalities,
      selectedFilters.outputModalities,
      selectedFilters.providers,
      selectedFilters.supportedParameters,
    ],
    queryFn: () => listModelCatalogModels(selectedFilters),
    placeholderData: (previousData) => previousData,
  });
  const models = modelsQuery.data?.data;
  const filterOptions = modelsQuery.data?.filters ?? EMPTY_FILTER_OPTIONS;
  const modelGroups = useMemo(
    () => groupModelsByAuthor(models ?? []),
    [models],
  );
  const modelCount = models?.length ?? 0;
  const authorCount = modelGroups.length;
  const activeFilterCount = countSelectedFilters(selectedFilters);

  return (
    <div className="homepage-root min-h-svh bg-background text-foreground">
      <HomepageNav />

      <main className="pt-16">
        <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className="font-heading text-3xl leading-tight font-semibold tracking-normal">
                Models
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Choose from over {modelCount} models across {authorCount}{" "}
              providers in Supagen for agentic workflows, image generation,
              speech synthesis, video creation and more...
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
            <ModelCatalogFiltersPanel
              activeFilterCount={activeFilterCount}
              filterOptions={filterOptions}
              onChange={setSelectedFilters}
              selectedFilters={selectedFilters}
            />

            <div className="min-w-0">
              {modelsQuery.isLoading ? (
                <ModelCatalogStatus
                  icon="progress_activity"
                  label="Loading models"
                />
              ) : null}

              {modelsQuery.isError ? (
                <ModelCatalogStatus
                  icon="error"
                  label="Models unavailable"
                  message="Supagen could not load the public model catalog."
                />
              ) : null}

              {modelsQuery.isSuccess && modelCount === 0 ? (
                <ModelCatalogStatus
                  icon="inventory_2"
                  label="No models available"
                />
              ) : null}

              {modelsQuery.isSuccess && modelCount > 0 ? (
                <GroupedModelsCatalog groups={modelGroups} />
              ) : null}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function ModelCatalogFiltersPanel({
  activeFilterCount,
  filterOptions,
  onChange,
  selectedFilters,
}: {
  activeFilterCount: number;
  filterOptions: ModelCatalogFilterOptions;
  onChange: (filters: SelectedModelCatalogFilters) => void;
  selectedFilters: SelectedModelCatalogFilters;
}) {
  return (
    <aside className="rounded-lg border border-border bg-card p-4 max-lg:max-h-72 max-lg:overflow-y-auto lg:sticky lg:top-24 lg:max-h-[calc(100svh-7rem)] lg:overflow-y-auto">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-heading text-base leading-6 font-semibold tracking-normal">
          Filters
        </h2>
        {activeFilterCount > 0 ? (
          <Button
            onClick={() => onChange({ ...EMPTY_SELECTED_FILTERS })}
            size="xs"
            type="button"
            variant="ghost"
          >
            Clear
          </Button>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        {MODEL_CATALOG_FILTER_SECTIONS.map((section) => (
          <fieldset key={section.key}>
            <legend className="sr-only">{section.label}</legend>
            <details className="group" open>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground uppercase hover:bg-muted/60 marker:text-muted-foreground">
                <span>{section.label}</span>
                <MaterialIcon
                  aria-hidden="true"
                  className="shrink-0 transition-transform group-open:rotate-180"
                  name="expand_more"
                  size={18}
                />
              </summary>
              <div className="mt-1 flex flex-col gap-0.5">
                {filterOptions[section.key].map((option) => (
                  <label
                    className="flex min-h-7 cursor-pointer items-center gap-2 rounded-md px-2 text-xs hover:bg-muted/60"
                    key={option}
                  >
                    <input
                      checked={selectedFilters[section.key].includes(option)}
                      className="size-4 accent-primary"
                      onChange={() =>
                        onChange(
                          toggleSelectedFilter(
                            selectedFilters,
                            section.key,
                            option,
                          ),
                        )
                      }
                      type="checkbox"
                    />
                    <span className="min-w-0 truncate">
                      {formatFilterOptionName(section.key, option)}
                    </span>
                  </label>
                ))}
              </div>
            </details>
          </fieldset>
        ))}
      </div>
    </aside>
  );
}

function GroupedModelsCatalog({
  groups,
}: {
  groups: ModelCatalogAuthorGroup[];
}) {
  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <details
          className="group rounded-lg border border-border bg-card"
          key={group.key}
          open
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 marker:text-muted-foreground">
            <div className="flex min-w-0 items-center gap-3">
              <AuthorAvatar
                authorIconUrl={group.authorIconUrl}
                authorName={group.authorName}
              />
              <div className="min-w-0">
                <h2 className="truncate font-heading text-base leading-6 font-semibold tracking-normal">
                  {group.authorName}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {group.models.length}{" "}
                  {group.models.length === 1 ? "model" : "models"}
                </p>
              </div>
            </div>
            <MaterialIcon
              aria-hidden="true"
              className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
              name="expand_more"
            />
          </summary>
          <ModelsTable models={group.models} />
        </details>
      ))}
    </div>
  );
}

function ModelsTable({ models }: { models: ModelCatalogModel[] }) {
  return (
    <div className="overflow-x-auto border-t border-border">
      <table className="w-full min-w-[820px] border-collapse text-left text-sm">
        <thead className="border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground uppercase">
          <tr>
            <th className="px-3 py-3 font-medium">Model</th>
            <th className="px-2 py-3 font-medium">Input Modalities</th>
            <th className="px-2 py-3 font-medium">Output Modalities</th>
            <th className="px-2 py-3 font-medium">Input Price</th>
            <th className="px-2 py-3 font-medium">Output Price</th>
            <th className="px-2 py-3 font-medium">Context Window</th>
            <th className="px-3 py-3 font-medium">Release Date</th>
          </tr>
        </thead>
        <tbody>
          {models.map((model) => (
            <tr
              className="border-b border-border last:border-b-0 hover:bg-muted/30"
              key={model.permaslug}
            >
              <td className="px-3 py-3">
                <a
                  className="font-medium hover:text-primary hover:underline"
                  href={`/models/${model.permaslug}`}
                >
                  {model.displayName}
                </a>
              </td>
              <td className="px-2 py-3">
                <ModalityIcons
                  label="Input modalities"
                  modalities={model.inputModalities}
                />
              </td>
              <td className="px-2 py-3">
                <ModalityIcons
                  label="Output modalities"
                  modalities={model.outputModalities}
                />
              </td>
              <td className="px-2 py-3 tabular-nums">
                <PriceValue value={model.inputPrice} />
              </td>
              <td className="px-2 py-3 tabular-nums">
                <PriceValue value={model.outputPrice} />
              </td>
              <td className="px-2 py-3 tabular-nums">
                {formatContextWindow(model.contextWindowSize)}
              </td>
              <td className="px-3 py-3 tabular-nums">
                {formatReleaseDate(model.releaseDate)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AuthorAvatar({
  authorIconUrl,
  authorName,
}: {
  authorIconUrl: string | null;
  authorName: string;
}) {
  return (
    <Avatar size="sm">
      {authorIconUrl ? <AvatarImage alt="" src={authorIconUrl} /> : null}
      <AvatarFallback>{getAuthorInitials(authorName)}</AvatarFallback>
    </Avatar>
  );
}

function groupModelsByAuthor(models: ModelCatalogModel[]) {
  const groups = new Map<string, ModelCatalogAuthorGroup>();

  for (const model of [...models].sort(compareModelsByReleaseDateDesc)) {
    const authorName = model.authorName?.trim() || "Unknown";
    const authorIconUrl = model.authorIconUrl?.trim() || null;
    const key = normalizeAuthorKey(authorName);
    const existingGroup = groups.get(key);

    if (existingGroup) {
      if (!existingGroup.authorIconUrl && authorIconUrl) {
        existingGroup.authorIconUrl = authorIconUrl;
      }

      existingGroup.models.push(model);
    } else {
      groups.set(key, {
        authorIconUrl,
        authorName,
        key,
        models: [model],
      });
    }
  }

  return [...groups.values()].sort(compareAuthorGroups);
}

type ModelCatalogAuthorGroup = {
  authorIconUrl: string | null;
  authorName: string;
  key: string;
  models: ModelCatalogModel[];
};
type ModelCatalogFilterKey = keyof ModelCatalogFilters;
type SelectedModelCatalogFilters = Required<ModelCatalogFilters>;

function toggleSelectedFilter(
  filters: SelectedModelCatalogFilters,
  key: ModelCatalogFilterKey,
  option: string,
): SelectedModelCatalogFilters {
  const selectedOptions = filters[key];
  const nextOptions = selectedOptions.includes(option)
    ? selectedOptions.filter((selectedOption) => selectedOption !== option)
    : [...selectedOptions, option];

  return {
    ...filters,
    [key]: nextOptions,
  };
}

function countSelectedFilters(filters: SelectedModelCatalogFilters) {
  return Object.values(filters).reduce(
    (count, values) => count + values.length,
    0,
  );
}

function formatFilterOptionName(key: ModelCatalogFilterKey, value: string) {
  return key === "providers" ? value : formatModalityName(value);
}

function normalizeAuthorKey(value: string | null) {
  return value?.trim().toLowerCase() || "unknown";
}

function compareAuthorGroups(
  left: ModelCatalogAuthorGroup,
  right: ModelCatalogAuthorGroup,
) {
  const leftPreferredIndex = getPreferredAuthorIndex(left.authorName);
  const rightPreferredIndex = getPreferredAuthorIndex(right.authorName);

  if (leftPreferredIndex !== rightPreferredIndex) {
    return leftPreferredIndex - rightPreferredIndex;
  }

  return 0;
}

function getPreferredAuthorIndex(authorName: string) {
  return (
    PREFERRED_AUTHOR_SORT_KEYS.get(normalizeAuthorKey(authorName)) ??
    Number.POSITIVE_INFINITY
  );
}

function compareModelsByReleaseDateDesc(
  left: ModelCatalogModel,
  right: ModelCatalogModel,
) {
  const leftTimestamp = getReleaseTimestamp(left.releaseDate);
  const rightTimestamp = getReleaseTimestamp(right.releaseDate);

  if (leftTimestamp !== rightTimestamp) {
    return rightTimestamp - leftTimestamp;
  }

  return left.displayName.localeCompare(right.displayName);
}

function getReleaseTimestamp(value: string | null) {
  if (!value) {
    return Number.NEGATIVE_INFINITY;
  }

  const timestamp = Date.parse(value);

  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
}

function ModelCatalogStatus({
  icon,
  label,
  message,
}: {
  icon: string;
  label: string;
  message?: string;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card p-6 text-center">
      <MaterialIcon
        aria-hidden="true"
        className={icon === "progress_activity" ? "animate-spin" : undefined}
        name={icon}
      />
      <p className="font-medium">{label}</p>
      {message ? (
        <p className="text-sm text-muted-foreground">{message}</p>
      ) : null}
    </div>
  );
}
