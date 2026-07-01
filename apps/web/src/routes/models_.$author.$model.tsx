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
import { PriceValue } from "../components/model-catalog/ModelCatalogDisplay";
import {
  formatContextWindow,
  formatModalityName,
  formatReleaseDate,
  getAuthorInitials,
  getPrimaryOutputModality,
  normalizeModalityKey,
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
  const primaryOutputModality = getPrimaryOutputModality(
    model.outputModalities,
  );
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
            <div className="min-w-0">
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
              <ModelDisplayNameHeading displayName={model.displayName} />
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

      <ModelParametersTable model={model} />

      <ModelModalityProfile
        model={model}
        primaryOutputModality={primaryOutputModality}
      />
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
    <section>
      <h2 className="mb-3 font-heading text-[20px] leading-7 font-semibold tracking-normal">
        Supported Parameters
      </h2>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
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
    </section>
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
  const hasConditionalPrices = hasConditionalDisplayPrice(model);

  return (
    <section className={getModelSummaryCardClassName(compact)}>
      <h2 className="text-xs font-medium text-muted-foreground uppercase">
        Price
      </h2>
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
      {hasConditionalPrices ? (
        <p className="text-xs leading-5 text-muted-foreground">
          See below for detailed prices.
        </p>
      ) : null}
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

function ModelModalityProfile({
  model,
  primaryOutputModality,
}: {
  model: ModelCatalogModel;
  primaryOutputModality: string;
}) {
  const profile = getModalityProfile(primaryOutputModality);

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)]">
      <div
        className={cn(
          "flex min-h-72 flex-col justify-between gap-8 rounded-lg border bg-card p-5 sm:p-6",
          profile.borderClassName,
        )}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">
                {profile.eyebrow}
              </p>
              <h2 className="mt-1 font-heading text-2xl leading-tight font-semibold tracking-normal">
                {profile.title}
              </h2>
            </div>
            <span
              className={cn(
                "inline-flex size-11 shrink-0 items-center justify-center rounded-lg border bg-background",
                profile.iconClassName,
              )}
            >
              <MaterialIcon aria-hidden="true" name={profile.icon} size={24} />
            </span>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {profile.description}
          </p>
        </div>

        <dl className="grid gap-3 sm:grid-cols-3">
          <ModelProfileMetric label="Primary Output">
            {formatModalityName(primaryOutputModality)}
          </ModelProfileMetric>
          <ModelProfileMetric label="Inputs">
            {formatModalityList(model.inputModalities)}
          </ModelProfileMetric>
          <ModelProfileMetric label="Parameters">
            {formatParameterCount(model.supportedParameters)}
          </ModelProfileMetric>
        </dl>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 sm:p-6">
        <h2 className="font-heading text-base leading-6 font-semibold tracking-normal">
          Catalog Signals
        </h2>
        <dl className="mt-5 flex flex-col divide-y divide-border">
          <CatalogSignal label="Supported Parameters">
            <ParameterList parameters={model.supportedParameters} />
          </CatalogSignal>
          <CatalogSignal label="Context Window">
            <span className="tabular-nums">
              {formatContextWindow(model.contextWindowSize)}
            </span>
          </CatalogSignal>
          <CatalogSignal label="Pricing">
            <span className="flex flex-col gap-1">
              <span>
                Input <PriceValue value={model.inputPrice} />
              </span>
              <span>
                Output <PriceValue value={model.outputPrice} />
              </span>
            </span>
          </CatalogSignal>
        </dl>
      </div>
    </section>
  );
}

function ModelProfileMetric({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-background/70 p-3">
      <dt className="text-xs font-medium text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-2 text-sm font-medium">{children}</dd>
    </div>
  );
}

function CatalogSignal({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="grid gap-2 py-4 first:pt-0 last:pb-0 sm:grid-cols-[9rem_minmax(0,1fr)]">
      <dt className="text-xs font-medium text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  );
}

function ParameterList({ parameters }: { parameters: string[] }) {
  if (parameters.length === 0) {
    return <span>-</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {parameters.map((parameter) => (
        <span
          className="rounded-md border border-border bg-background px-2 py-1 text-xs"
          key={parameter}
        >
          {formatParameterName(parameter)}
        </span>
      ))}
    </div>
  );
}

function formatModalityList(modalities: string[]) {
  if (modalities.length === 0) {
    return "-";
  }

  return modalities.map(formatModalityName).join(", ");
}

function formatParameterCount(parameters: string[]) {
  return parameters.length === 0
    ? "None listed"
    : `${parameters.length} ${parameters.length === 1 ? "parameter" : "parameters"}`;
}

function formatParameterName(parameter: string) {
  const normalized = parameter.trim().replace(/[_-]+/g, " ");

  if (!normalized) {
    return "Unknown";
  }

  return normalized.replace(/\b\w/g, (character) => character.toUpperCase());
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

function hasConditionalDisplayPrice(model: ModelCatalogModel) {
  return [model.inputPrice, model.outputPrice].some((price) =>
    price?.includes("*"),
  );
}

function hasValidContextWindow(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function getModalityProfile(primaryOutputModality: string): ModalityProfile {
  switch (normalizeModalityKey(primaryOutputModality)) {
    case "image":
      return {
        borderClassName: "border-fuchsia-200 dark:border-fuchsia-950",
        description:
          "Cataloged for image output, with input and pricing signals separated so visual generation models can be compared against text-first models.",
        eyebrow: "Image output",
        icon: "image",
        iconClassName: "text-fuchsia-500",
        title: "Image generation model",
      };
    case "audio":
    case "speech":
    case "transcription":
      return {
        borderClassName: "border-amber-200 dark:border-amber-950",
        description:
          "Cataloged for audio-oriented output, including speech and transcription variants when providers expose them through the same catalog surface.",
        eyebrow: "Audio output",
        icon: "graphic_eq",
        iconClassName: "text-amber-500",
        title: "Audio generation model",
      };
    case "video":
      return {
        borderClassName: "border-rose-200 dark:border-rose-950",
        description:
          "Cataloged for video output, with generation pricing and input modality support kept alongside the rest of the model record.",
        eyebrow: "Video output",
        icon: "movie",
        iconClassName: "text-rose-500",
        title: "Video generation model",
      };
    case "embedding":
    case "embeddings":
      return {
        borderClassName: "border-emerald-200 dark:border-emerald-950",
        description:
          "Cataloged for vector output, with context and parameter support surfaced for retrieval and ranking workflows.",
        eyebrow: "Vector output",
        icon: "hub",
        iconClassName: "text-emerald-500",
        title: "Embedding model",
      };
    case "rerank":
      return {
        borderClassName: "border-violet-200 dark:border-violet-950",
        description:
          "Cataloged for ranking output, with supported parameters shown as first-class comparison signals.",
        eyebrow: "Ranking output",
        icon: "sort",
        iconClassName: "text-violet-500",
        title: "Reranking model",
      };
    default:
      return {
        borderClassName: "border-sky-200 dark:border-sky-950",
        description:
          "Cataloged for text output, with context, pricing and parameter support grouped for quick comparison across language models.",
        eyebrow: "Text output",
        icon: "article",
        iconClassName: "text-sky-500",
        title: "Text generation model",
      };
  }
}

type ModalityProfile = {
  borderClassName: string;
  description: string;
  eyebrow: string;
  icon: string;
  iconClassName: string;
  title: string;
};

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
