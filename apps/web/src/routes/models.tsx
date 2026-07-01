import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@supagen/ui/components/avatar";
import { MaterialIcon } from "@supagen/ui/components/material-icon";

import {
  listModelCatalogModels,
  type ModelCatalogModel,
} from "../api/model-catalog";

const MODEL_CATALOG_QUERY_KEY = ["model-catalog", "models"] as const;
const MODALITY_ICON_BY_KEY = new Map([
  ["audio", "graphic_eq"],
  ["embedding", "hub"],
  ["embeddings", "hub"],
  ["file", "description"],
  ["image", "image"],
  ["rerank", "sort"],
  ["speech", "record_voice_over"],
  ["text", "article"],
  ["transcription", "subtitles"],
  ["video", "movie"],
]);

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
  const modelsQuery = useQuery({
    queryKey: MODEL_CATALOG_QUERY_KEY,
    queryFn: listModelCatalogModels,
  });
  const modelsCount = modelsQuery.data?.data.length ?? 0;

  return (
    <main className="min-h-svh bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="font-heading text-3xl leading-tight font-semibold tracking-normal">
              Models
            </h1>
            {modelsQuery.isSuccess ? (
              <span className="text-sm font-medium text-muted-foreground">
                {modelsCount} {modelsCount === 1 ? "model" : "models"}
              </span>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">Public model catalog</p>
        </header>

        {modelsQuery.isLoading ? (
          <ModelCatalogStatus icon="progress_activity" label="Loading models" />
        ) : null}

        {modelsQuery.isError ? (
          <ModelCatalogStatus
            icon="error"
            label="Models unavailable"
            message="Supagen could not load the public model catalog."
          />
        ) : null}

        {modelsQuery.isSuccess && modelsQuery.data.data.length === 0 ? (
          <ModelCatalogStatus icon="inventory_2" label="No models available" />
        ) : null}

        {modelsQuery.isSuccess && modelsQuery.data.data.length > 0 ? (
          <ModelsTable models={modelsQuery.data.data} />
        ) : null}
      </section>
    </main>
  );
}

function ModelsTable({ models }: { models: ModelCatalogModel[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full min-w-[980px] border-collapse text-left text-sm">
        <thead className="border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground uppercase">
          <tr>
            <th className="px-4 py-3 font-medium">Provider</th>
            <th className="px-4 py-3 font-medium">Model</th>
            <th className="px-4 py-3 font-medium">Input Modalities</th>
            <th className="px-4 py-3 font-medium">Output Modalities</th>
            <th className="px-4 py-3 font-medium">Input Price</th>
            <th className="px-4 py-3 font-medium">Output Price</th>
            <th className="px-4 py-3 font-medium">Context Window</th>
            <th className="px-4 py-3 font-medium">Release Date</th>
          </tr>
        </thead>
        <tbody>
          {models.map((model) => (
            <tr
              className="border-b border-border last:border-b-0 hover:bg-muted/30"
              key={model.permaslug}
            >
              <td className="px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar size="sm">
                    {model.authorIconUrl ? (
                      <AvatarImage alt="" src={model.authorIconUrl} />
                    ) : null}
                    <AvatarFallback>
                      {getAuthorInitials(model.authorName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate font-medium">
                    {model.authorName ?? "Unknown"}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="font-medium">{model.displayName}</span>
              </td>
              <td className="px-4 py-3">
                <ModalityIcons
                  label="Input modalities"
                  modalities={model.inputModalities}
                />
              </td>
              <td className="px-4 py-3">
                <ModalityIcons
                  label="Output modalities"
                  modalities={model.outputModalities}
                />
              </td>
              <td className="px-4 py-3 tabular-nums">
                {model.inputPrice ?? "—"}
              </td>
              <td className="px-4 py-3 tabular-nums">
                {model.outputPrice ?? "—"}
              </td>
              <td className="px-4 py-3 tabular-nums">
                {formatContextWindow(model.contextWindowSize)}
              </td>
              <td className="px-4 py-3 tabular-nums">
                {formatReleaseDate(model.releaseDate)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ModalityIcons({
  label,
  modalities,
}: {
  label: string;
  modalities: string[];
}) {
  if (modalities.length === 0) {
    return (
      <span
        aria-label={`${label}: none listed`}
        className="inline-flex h-7 w-7 items-center justify-center text-muted-foreground"
        title={`${label}: none listed`}
      >
        —
      </span>
    );
  }

  const accessibilityLabel = `${label}: ${modalities
    .map(formatModalityName)
    .join(", ")}`;

  return (
    <div
      aria-label={accessibilityLabel}
      className="flex min-h-7 items-center gap-1"
      title={accessibilityLabel}
    >
      {modalities.map((modality) => (
        <span
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground"
          key={modality}
        >
          <MaterialIcon
            aria-hidden="true"
            name={getModalityIconName(modality)}
            size={18}
          />
        </span>
      ))}
    </div>
  );
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

function formatContextWindow(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return "-";
  }

  if (value >= 1_000_000) {
    return `${Math.round(value / 1_000_000)}M`;
  }

  return `${Math.max(1, Math.round(value / 1_000))}K`;
}

function formatReleaseDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(timestamp);
}

function getAuthorInitials(value: string | null) {
  if (!value) {
    return "?";
  }

  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getModalityIconName(value: string) {
  return MODALITY_ICON_BY_KEY.get(normalizeModalityKey(value)) ?? "category";
}

function formatModalityName(value: string) {
  const normalized = value.trim().replace(/[_-]+/g, " ");

  if (!normalized) {
    return "Unknown";
  }

  return normalized.replace(/\b\w/g, (character) => character.toUpperCase());
}

function normalizeModalityKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");
}
