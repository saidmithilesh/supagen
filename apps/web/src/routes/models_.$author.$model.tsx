import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import "../styles/homepage.css";

import { Alert, AlertDescription } from "@supagen/ui/components/alert";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@supagen/ui/components/avatar";
import { MaterialIcon } from "@supagen/ui/components/material-icon";
import { cn } from "@supagen/ui/lib/utils";

import {
  getModelCatalogModel,
  ModelCatalogModelNotFoundError,
  type ModelCatalogModel,
} from "../api/model-catalog";
import {
  formatContextWindow,
  formatModalityName,
  formatReleaseDate,
  getAuthorInitials,
} from "../components/model-catalog/ModelCatalogDisplay.utils";
import { HomepageNav } from "../components/marketing/HomepageNav";

const MODEL_DETAIL_QUERY_KEY = ["model-catalog", "model"] as const;

export const Route = createFileRoute("/models_/$author/$model")({
  component: ModelDetailsRoute,
  head: () => ({
    meta: [
      { title: "Model Details | Supagen" },
      {
        name: "description",
        content: "Explore Supagen model catalog details.",
      },
    ],
  }),
});

function ModelDetailsRoute() {
  const { author, model } = Route.useParams();

  return <ModelDetailsPage modelRef={`${author}/${model}`} />;
}

export function ModelDetailsPage({ modelRef }: { modelRef: string }) {
  const modelQuery = useQuery({
    queryKey: [...MODEL_DETAIL_QUERY_KEY, modelRef],
    queryFn: () => getModelCatalogModel(modelRef),
  });

  return (
    <div className="homepage-root min-h-svh bg-background text-foreground">
      <HomepageNav />

      <main className="pt-16">
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <a
            className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            href="/models"
          >
            <MaterialIcon aria-hidden="true" name="arrow_back" size={18} />
            Models
          </a>

          {modelQuery.isLoading ? (
            <ModelDetailsStatus
              icon="progress_activity"
              label="Loading model"
            />
          ) : null}

          {modelQuery.isError ? (
            <ModelDetailsStatus
              icon={
                modelQuery.error instanceof ModelCatalogModelNotFoundError
                  ? "search_off"
                  : "error"
              }
              label={
                modelQuery.error instanceof ModelCatalogModelNotFoundError
                  ? "Model not found"
                  : "Model unavailable"
              }
              message={
                modelQuery.error instanceof ModelCatalogModelNotFoundError
                  ? "Supagen could not find this model in the public catalog."
                  : "Supagen could not load this model from the public catalog."
              }
            />
          ) : null}

          {modelQuery.isSuccess ? (
            <ModelDetails model={modelQuery.data} />
          ) : null}
        </section>
      </main>
    </div>
  );
}

function ModelDetails({ model }: { model: ModelCatalogModel }) {
  const hasContextWindow = hasValidContextWindow(model.contextWindowSize);

  return (
    <article className="flex flex-col gap-6">
      <ModelWarningMessage warningMessage={model.warningMessage} />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(18rem,3fr)]">
        <header className="flex flex-col gap-5 rounded-lg border border-border bg-card p-5 sm:p-6">
          <div className="flex min-w-0 items-start gap-4">
            <AuthorAvatar
              authorIconUrl={model.authorIconUrl}
              authorName={model.authorName}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {model.authorName?.trim() || "Unknown"}
                </p>
                {model.releaseDate ? (
                  <span className="rounded-md border border-border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">
                    {formatReleaseDate(model.releaseDate)}
                  </span>
                ) : null}
              </div>
              <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                <ModelDisplayNameHeading displayName={model.displayName} />
                <ModelPerformanceChips model={model} />
              </div>
            </div>
          </div>

          {model.description ? (
            <ModelDescriptionMarkdown description={model.description} />
          ) : (
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              No description is available for this model yet.
            </p>
          )}

          <ModelCapabilitiesRow model={model} />
        </header>

        <div className="grid gap-4">
          <ModelModalityMapCard compact={hasContextWindow} model={model} />
          <ModelDisplayPricesCard compact={hasContextWindow} model={model} />
          {hasContextWindow ? (
            <ModelContextWindowCard compact={hasContextWindow} model={model} />
          ) : null}
        </div>
      </section>

      <ModelDetailedPricing model={model} />
      <ModelParametersTable model={model} />
      <ModelBenchmarksSection model={model} />
    </article>
  );
}

function ModelDisplayNameHeading({ displayName }: { displayName: string }) {
  const displayNameParts = getDisplayNameParts(displayName);

  return (
    <h1
      aria-label={displayName}
      className="font-heading leading-tight font-semibold tracking-normal"
    >
      <span className="block text-[24px]">{displayNameParts.name}</span>
      {displayNameParts.parenthesized ? (
        <span className="mt-0.5 block text-[20px] text-muted-foreground">
          {displayNameParts.parenthesized}
        </span>
      ) : null}
    </h1>
  );
}

function ModelPerformanceChips({ model }: { model: ModelCatalogModel }) {
  const chips = [
    model.averageP50Throughput && model.averageP50Throughput > 0
      ? {
          key: "throughput",
          label: `Avg throughput ${formatThroughput(model.averageP50Throughput)}`,
        }
      : null,
    model.averageP50Latency && model.averageP50Latency > 0
      ? {
          key: "latency",
          label: `Avg latency ${formatLatency(model.averageP50Latency)}`,
        }
      : null,
  ].filter((chip): chip is { key: string; label: string } => chip !== null);

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex shrink-0 flex-wrap justify-end gap-1.5 pt-1">
      {chips.map((chip) => (
        <span
          className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
          key={chip.key}
        >
          {chip.label}
        </span>
      ))}
    </div>
  );
}

function ModelWarningMessage({
  warningMessage,
}: {
  warningMessage: string | null;
}) {
  if (!warningMessage) {
    return null;
  }

  return (
    <Alert className="border-warning/30 bg-warning-light text-warning-foreground">
      <AlertDescription className="text-warning-foreground">
        <ReactMarkdown
          components={{
            a: ({ children, href }) => (
              <a
                className="font-medium underline underline-offset-4 hover:text-warning"
                href={href}
                rel="noreferrer"
                target="_blank"
              >
                {children}
              </a>
            ),
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            strong: ({ children }) => (
              <strong className="font-semibold">{children}</strong>
            ),
          }}
          remarkPlugins={[remarkGfm]}
        >
          {warningMessage}
        </ReactMarkdown>
      </AlertDescription>
    </Alert>
  );
}

function ModelParametersTable({ model }: { model: ModelCatalogModel }) {
  if (model.supportedParameterDetails.length === 0) {
    return null;
  }

  return (
    <details className="group rounded-lg border border-border bg-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:hidden">
        <h2 className="font-heading text-[20px] leading-7 font-semibold tracking-normal">
          Supported Parameters
        </h2>
        <MaterialIcon
          aria-hidden="true"
          className="text-muted-foreground transition-transform group-open:rotate-180"
          name="expand_more"
        />
      </summary>
      <div className="border-t border-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground uppercase">
              <tr>
                <th className="w-[24%] px-3 py-3 font-medium whitespace-nowrap">
                  Parameter Name
                </th>
                <th className="w-[24%] px-2 py-3 font-medium whitespace-nowrap">
                  Key
                </th>
                <th className="w-[14%] px-2 py-3 font-medium whitespace-nowrap">
                  Type
                </th>
                <th className="px-3 py-3 font-medium whitespace-nowrap">
                  Values
                </th>
              </tr>
            </thead>
            <tbody>
              {model.supportedParameterDetails.map((parameter) => (
                <tr
                  className="border-b border-border last:border-b-0 hover:bg-muted/30"
                  key={parameter.key}
                >
                  <td className="px-3 py-3 font-medium">{parameter.name}</td>
                  <td className="px-2 py-3 font-mono text-xs text-muted-foreground">
                    {parameter.key}
                  </td>
                  <td className="px-2 py-3 text-muted-foreground">
                    {parameter.type}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {parameter.values}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </details>
  );
}

function ModelDetailedPricing({ model }: { model: ModelCatalogModel }) {
  const pricingGroups = getDetailedPricingSkuGroups(model);

  if (pricingGroups.length === 0) {
    return null;
  }

  return (
    <details className="group rounded-lg border border-border bg-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:hidden">
        <h2 className="font-heading text-[20px] leading-7 font-semibold tracking-normal">
          Detailed Pricing
        </h2>
        <MaterialIcon
          aria-hidden="true"
          className="text-muted-foreground transition-transform group-open:rotate-180"
          name="expand_more"
        />
      </summary>
      <div className="border-t border-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground uppercase">
              <tr>
                <th className="w-[18%] px-3 py-3 font-medium whitespace-nowrap">
                  SKU
                </th>
                <th className="w-[44%] px-2 py-3 font-medium whitespace-nowrap">
                  Provider
                </th>
                <th className="w-[18%] px-2 py-3 font-medium whitespace-nowrap">
                  Price
                </th>
                <th className="px-3 py-3 font-medium whitespace-nowrap">
                  Conditions
                </th>
              </tr>
            </thead>
            <tbody>
              {pricingGroups.flatMap((group) =>
                group.offerings.map((offering, offeringIndex) => (
                  <tr
                    className="border-b border-border last:border-b-0 hover:bg-muted/30"
                    key={`${group.skuLabel}-${offering.price}-${offering.unitLabel}-${offering.condition ?? "base"}-${offeringIndex}`}
                  >
                    {offeringIndex === 0 ? (
                      <td
                        className="border-r border-border bg-muted/15 px-3 py-3 align-middle font-medium"
                        rowSpan={group.offerings.length}
                      >
                        {group.skuLabel}
                      </td>
                    ) : null}
                    <td className="px-2 py-3">
                      <div className="flex min-w-0 flex-wrap gap-1.5">
                        {offering.providers.map((provider) => (
                          <span
                            className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
                            key={provider}
                          >
                            {provider}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-2 py-3 font-medium tabular-nums">
                      {formatDetailedPrice(offering)}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {offering.condition ?? "Base price"}
                    </td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      </div>
    </details>
  );
}

function ModelBenchmarksSection({ model }: { model: ModelCatalogModel }) {
  const benchmarks = getModelBenchmarks(model);
  const benchmarkGroups = getBenchmarkDisplayGroups(benchmarks);

  if (benchmarkGroups.length === 0) {
    return null;
  }

  return (
    <details className="group rounded-lg border border-border bg-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:hidden">
        <h2 className="font-heading text-[20px] leading-7 font-semibold tracking-normal">
          Benchmarks
        </h2>
        <MaterialIcon
          aria-hidden="true"
          className="text-muted-foreground transition-transform group-open:rotate-180"
          name="expand_more"
        />
      </summary>
      <div className="flex flex-col gap-5 border-t border-border p-4">
        {benchmarkGroups.map((group) => (
          <BenchmarkSourceGroup key={group.title} title={group.title}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item) => (
                <BenchmarkCard item={item} key={item.key} />
              ))}
            </div>
          </BenchmarkSourceGroup>
        ))}
      </div>
    </details>
  );
}

function BenchmarkSourceGroup({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline gap-2">
        <h3 className="text-xs font-medium text-muted-foreground uppercase">
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

function BenchmarkCard({ item }: { item: BenchmarkDisplayItem }) {
  return (
    <article className="flex min-w-0 flex-col gap-3 rounded-lg border border-border bg-background p-4">
      <h4 className="min-w-0 truncate text-sm leading-5 font-semibold">
        {item.name}
      </h4>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <p className="min-w-0 truncate text-muted-foreground">
          Score:{" "}
          <span className="font-semibold text-foreground tabular-nums">
            {item.score}
          </span>
        </p>
        <p className="min-w-0 truncate text-muted-foreground">
          Percentile:{" "}
          <span className="font-semibold text-foreground tabular-nums">
            {item.percentile}
          </span>
        </p>
      </div>
    </article>
  );
}

function ModelCapabilitiesRow({ model }: { model: ModelCatalogModel }) {
  if (model.capabilities.length === 0) {
    return null;
  }

  return (
    <section className="mt-auto grid grid-cols-[20%_minmax(0,1fr)] gap-3 pt-1">
      <h2 className="text-xs leading-7 font-medium text-muted-foreground uppercase">
        Model Capabilities:
      </h2>
      <div className="flex min-w-0 flex-wrap gap-1.5">
        {model.capabilities.map((capability) => (
          <span
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
            key={capability.key}
          >
            <MaterialIcon aria-hidden="true" name="check_circle" size={16} />
            {capability.label}
          </span>
        ))}
      </div>
    </section>
  );
}

function getDetailedPricingSkuGroups(model: ModelCatalogModel) {
  const groups = new Map<
    string,
    {
      skuLabel: string;
      offerings: Array<{
        condition: string | null;
        price: string;
        providers: string[];
        unitLabel: string;
      }>;
    }
  >();

  for (const group of model.pricingCatalog) {
    const provider = getPricingProviderLabel(group);

    for (const row of group.rows) {
      const existing = groups.get(row.skuLabel);

      if (existing) {
        addPricingOfferingProvider(existing.offerings, row, provider);
        continue;
      }

      const offerings: Array<{
        condition: string | null;
        price: string;
        providers: string[];
        unitLabel: string;
      }> = [];
      addPricingOfferingProvider(offerings, row, provider);
      groups.set(row.skuLabel, {
        offerings,
        skuLabel: row.skuLabel,
      });
    }
  }

  return [...groups.values()];
}

function formatDetailedPrice(input: { price: string; unitLabel: string }) {
  return input.unitLabel ? `${input.price}${input.unitLabel}` : input.price;
}

function formatThroughput(value: number) {
  return `${formatMetricNumber(value)} tok/s`;
}

function formatLatency(value: number) {
  return value >= 1000
    ? `${formatMetricNumber(value / 1000)}s`
    : `${formatMetricNumber(value)}ms`;
}

function formatBenchmarkNumber(value: number) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: value > 0 && value < 10 ? 1 : 0,
    minimumFractionDigits: 0,
  });
}

function formatOrdinal(value: number) {
  const roundedValue = Math.round(value);
  const mod100 = roundedValue % 100;

  if (mod100 >= 11 && mod100 <= 13) {
    return `${roundedValue}th`;
  }

  switch (roundedValue % 10) {
    case 1:
      return `${roundedValue}st`;
    case 2:
      return `${roundedValue}nd`;
    case 3:
      return `${roundedValue}rd`;
    default:
      return `${roundedValue}th`;
  }
}

function formatMetricNumber(value: number) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: value < 10 ? 1 : 0,
    minimumFractionDigits: 0,
  });
}

function getModelBenchmarks(model: ModelCatalogModel) {
  return model.benchmarks ?? EMPTY_MODEL_BENCHMARKS;
}

function getBenchmarkDisplayGroups(
  benchmarks: ModelCatalogModel["benchmarks"],
): BenchmarkDisplayGroup[] {
  return [
    {
      title: "Benchmark Scores",
      items: benchmarks.genericScores.scores.map((score) => ({
        key: `generic-${score.name}`,
        name: formatBenchmarkDisplayName(score.name),
        score: score.value,
        percentile: "-",
      })),
    },
    {
      title: "Artificial Analysis",
      items: benchmarks.artificialAnalysis.flatMap((benchmark) => {
        const headlineItems: BenchmarkDisplayItem[] = [];
        const primaryPercentile = benchmark.percentiles[0];

        if (benchmark.elo !== null) {
          headlineItems.push({
            key: `aa-${benchmark.slug ?? benchmark.name}-overall`,
            name: formatBenchmarkDisplayName(benchmark.name),
            score: formatBenchmarkNumber(benchmark.elo),
            percentile: primaryPercentile
              ? formatOrdinal(primaryPercentile.value)
              : "-",
          });
        }

        return [
          ...headlineItems,
          ...benchmark.evaluations.map((score) => ({
            key: `aa-${benchmark.slug ?? benchmark.name}-evaluation-${score.name}`,
            name: formatBenchmarkDisplayName(score.name),
            score: score.value,
            percentile: formatMatchedBenchmarkPercentile(
              score.name,
              benchmark.percentiles,
            ),
          })),
          ...benchmark.categories.map((category) => ({
            key: `aa-${benchmark.slug ?? benchmark.name}-category-${category.categoryType}-${category.name}`,
            name: `${category.categoryType}: ${formatBenchmarkDisplayName(category.name)}`,
            score:
              category.elo !== null ? formatBenchmarkNumber(category.elo) : "-",
            percentile: "-",
          })),
        ];
      }),
    },
    {
      title: "Design Arena",
      items: benchmarks.designArena.records.map((record) => ({
        key: `design-arena-${record.name}-${record.category ?? "overall"}`,
        name: formatBenchmarkDisplayName(record.category ?? record.name),
        score: record.elo !== null ? formatBenchmarkNumber(record.elo) : "-",
        percentile:
          record.eloPercentile !== null
            ? formatOrdinal(record.eloPercentile)
            : "-",
      })),
    },
  ]
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.percentile !== "-"),
    }))
    .filter((group) => group.items.length > 0);
}

type BenchmarkDisplayGroup = {
  title: string;
  items: BenchmarkDisplayItem[];
};

type BenchmarkDisplayItem = {
  key: string;
  name: string;
  percentile: string;
  score: string;
};

function formatMatchedBenchmarkPercentile(
  scoreName: string,
  percentiles: ModelCatalogModel["benchmarks"]["artificialAnalysis"][number]["percentiles"],
) {
  const normalizedScoreName = scoreName.toLowerCase();
  const matchedPercentile = percentiles.find((percentile) =>
    normalizedScoreName.includes(percentile.name.toLowerCase()),
  );

  return matchedPercentile ? formatOrdinal(matchedPercentile.value) : "-";
}

function formatBenchmarkDisplayName(value: string) {
  const normalizedValue = value.trim().toLowerCase();
  const displayName = BENCHMARK_DISPLAY_NAMES.get(normalizedValue);

  if (displayName) {
    return displayName;
  }

  const spaced = value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!spaced) {
    return "Benchmark";
  }

  return spaced.split(" ").map(formatBenchmarkDisplayWord).join(" ");
}

function formatBenchmarkDisplayWord(word: string) {
  const normalized = word.toLowerCase();
  const acronym = BENCHMARK_DISPLAY_ACRONYMS.get(normalized);

  if (acronym) {
    return acronym;
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

const BENCHMARK_DISPLAY_NAMES = new Map([
  ["graphicdesign", "Graphic Design"],
  ["imageediting", "Image Editing"],
]);

const BENCHMARK_DISPLAY_ACRONYMS = new Map([
  ["aa", "AA"],
  ["ai", "AI"],
  ["elo", "ELO"],
  ["gpqa", "GPQA"],
  ["hle", "HLE"],
  ["ifbench", "IFBench"],
  ["lcr", "LCR"],
  ["mmlu", "MMLU"],
  ["scicode", "SciCode"],
  ["ui", "UI"],
  ["ux", "UX"],
]);

const EMPTY_MODEL_BENCHMARKS: ModelCatalogModel["benchmarks"] = {
  artificialAnalysis: [],
  designArena: {
    eloBounds: {
      max: null,
      min: null,
    },
    records: [],
  },
  genericScores: {
    lookbackDays: null,
    scores: [],
  },
};

function addPricingOfferingProvider(
  offerings: Array<{
    condition: string | null;
    price: string;
    providers: string[];
    unitLabel: string;
  }>,
  row: ModelCatalogModel["pricingCatalog"][number]["rows"][number],
  provider: string,
) {
  const existingOffering = offerings.find(
    (offering) =>
      offering.price === row.price &&
      offering.unitLabel === row.unitLabel &&
      offering.condition === row.condition,
  );

  if (existingOffering) {
    if (!existingOffering.providers.includes(provider)) {
      existingOffering.providers.push(provider);
    }

    return;
  }

  offerings.push({
    condition: row.condition,
    price: row.price,
    providers: [provider],
    unitLabel: row.unitLabel,
  });
}

function getPricingProviderLabel(
  group: ModelCatalogModel["pricingCatalog"][number],
) {
  return group.providerName?.trim() || group.providerSlug?.trim() || "Provider";
}

function ModelDescriptionMarkdown({ description }: { description: string }) {
  return (
    <div className="max-w-3xl text-sm leading-6 text-muted-foreground">
      <ReactMarkdown
        components={{
          a: ({ children, href }) => (
            <a
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
              href={href}
              rel="noreferrer"
              target="_blank"
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">
              {children}
            </code>
          ),
          li: ({ children }) => <li className="ml-4 list-disc">{children}</li>,
          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),
        }}
        remarkPlugins={[remarkGfm]}
      >
        {description}
      </ReactMarkdown>
    </div>
  );
}

function ModelContextWindowCard({
  compact,
  model,
}: {
  compact: boolean;
  model: ModelCatalogModel;
}) {
  return (
    <section className={getModelSummaryCardClassName(compact)}>
      <h2 className="text-xs font-medium text-muted-foreground uppercase">
        Context Window
      </h2>
      <dl className="grid gap-2 text-sm font-medium">
        <div className="grid grid-cols-2 gap-3">
          <dt className="text-muted-foreground">Context Window</dt>
          <dd className="min-w-0 text-left tabular-nums">
            {formatContextWindow(model.contextWindowSize)}
          </dd>
        </div>
        {hasValidContextWindow(model.maxOutputTokens) ? (
          <div className="grid grid-cols-2 gap-3">
            <dt className="text-muted-foreground">Max Output Tokens</dt>
            <dd className="min-w-0 text-left tabular-nums">
              {formatContextWindow(model.maxOutputTokens)}
            </dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}

function ModelModalityMapCard({
  compact,
  model,
}: {
  compact: boolean;
  model: ModelCatalogModel;
}) {
  return (
    <section className={getModelSummaryCardClassName(compact)}>
      <h2 className="text-xs font-medium text-muted-foreground uppercase">
        Supported Modalities
      </h2>
      <dl className="grid gap-1 text-sm font-medium">
        <div className="grid grid-cols-[20%_80%] gap-3">
          <dt className="text-muted-foreground">Input</dt>
          <dd className="min-w-0 text-left">
            {formatModalityList(model.inputModalities)}
          </dd>
        </div>
        <div className="grid grid-cols-[20%_80%] gap-3">
          <dt className="text-muted-foreground">Output</dt>
          <dd className="min-w-0 text-left">
            {formatModalityList(model.outputModalities)}
          </dd>
        </div>
      </dl>
    </section>
  );
}

function ModelDisplayPricesCard({
  compact,
  model,
}: {
  compact: boolean;
  model: ModelCatalogModel;
}) {
  return (
    <section className={getModelSummaryCardClassName(compact)}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h2
          aria-label="Price"
          className="text-xs font-medium text-muted-foreground uppercase"
        >
          Price
        </h2>
        <span className="text-xs leading-5 text-muted-foreground normal-case">
          (See below for detailed prices)
        </span>
      </div>
      <dl className="grid gap-2 text-sm font-medium">
        <div className="grid grid-cols-[20%_80%] gap-3">
          <dt className="text-muted-foreground">Input</dt>
          <dd className="min-w-0 text-left tabular-nums">
            <InlinePriceValue value={model.inputPrice} />
          </dd>
        </div>
        <div className="grid grid-cols-[20%_80%] gap-3">
          <dt className="text-muted-foreground">Output</dt>
          <dd className="min-w-0 text-left tabular-nums">
            <InlinePriceValue value={model.outputPrice} />
          </dd>
        </div>
      </dl>
    </section>
  );
}

function getModelSummaryCardClassName(compact: boolean) {
  return cn(
    "flex flex-col rounded-lg border border-border bg-card p-4",
    compact ? "min-h-0 justify-start gap-3" : "min-h-32 justify-between gap-4",
  );
}

function InlinePriceValue({ value }: { value: string | null }) {
  if (!value) {
    return "—";
  }

  return value;
}

function formatModalityList(modalities: string[]) {
  if (modalities.length === 0) {
    return "-";
  }

  return modalities.map(formatModalityName).join(", ");
}

function getDisplayNameParts(displayName: string) {
  if (displayName.length <= 40) {
    return { name: displayName, parenthesized: null };
  }

  const openingParenthesisIndex = displayName.indexOf("(");
  const closingParenthesisIndex = displayName.indexOf(
    ")",
    openingParenthesisIndex + 1,
  );

  if (
    openingParenthesisIndex <= 0 ||
    closingParenthesisIndex <= openingParenthesisIndex
  ) {
    return { name: displayName, parenthesized: null };
  }

  const name = displayName.slice(0, openingParenthesisIndex).trim();
  const parenthesized = displayName.slice(openingParenthesisIndex).trim();

  return name && parenthesized
    ? { name, parenthesized }
    : { name: displayName, parenthesized: null };
}

function hasValidContextWindow(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function AuthorAvatar({
  authorIconUrl,
  authorName,
}: {
  authorIconUrl: string | null;
  authorName: string | null;
}) {
  return (
    <Avatar className="size-14" style={{ height: "3.5rem", width: "3.5rem" }}>
      {authorIconUrl ? (
        <AvatarImage
          alt=""
          className="size-full max-h-full max-w-full object-contain"
          src={authorIconUrl}
        />
      ) : null}
      <AvatarFallback className="text-3xl">
        {getAuthorInitials(authorName)}
      </AvatarFallback>
    </Avatar>
  );
}

function ModelDetailsStatus({
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
