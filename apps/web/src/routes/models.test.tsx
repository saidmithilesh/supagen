import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ModelsCatalogPage } from "./models";

describe(ModelsCatalogPage.name, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the public models catalog table", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            {
              slug: "anthropic/claude-sonnet-5",
              permaslug: "anthropic/claude-sonnet-5-20260630",
              displayName: "Claude Sonnet 5",
              description: "Frontier Sonnet-class model.",
              authorName: "Anthropic",
              authorIconUrl: "https://openrouter.ai/images/icons/Anthropic.svg",
              inputModalities: ["text", "image"],
              outputModalities: ["text"],
              releaseDate: "2026-06-30T18:11:23.921Z",
              inputPrice: "$2/M tokens",
              outputPrice: "$10/M tokens*",
              contextWindowSize: 1_000_000,
            },
            {
              slug: "openai/gpt-4o-mini",
              permaslug: "openai/gpt-4o-mini-20260701",
              displayName: "GPT-4o Mini",
              description: "Small multimodal model.",
              authorName: "OpenAI",
              authorIconUrl: null,
              inputModalities: ["text"],
              outputModalities: ["text"],
              releaseDate: null,
              inputPrice: null,
              outputPrice: null,
              contextWindowSize: 65_536,
            },
            {
              slug: "mistral/small",
              permaslug: "mistral/small-20260701",
              displayName: "Mistral Small",
              description: null,
              authorName: "Mistral",
              authorIconUrl: null,
              inputModalities: ["text"],
              outputModalities: ["text"],
              releaseDate: null,
              inputPrice: null,
              outputPrice: null,
              contextWindowSize: 8_192,
            },
            {
              slug: "unknown/no-context",
              permaslug: "unknown/no-context-20260701",
              displayName: "No Context Model",
              description: null,
              authorName: null,
              authorIconUrl: null,
              inputModalities: ["text"],
              outputModalities: ["text"],
              releaseDate: null,
              inputPrice: null,
              outputPrice: null,
              contextWindowSize: 0,
            },
          ],
        }),
        { status: 200 },
      ),
    );

    renderWithQueryClient(<ModelsCatalogPage />);

    expect(
      screen.getByRole("heading", {
        name: "Models",
      }),
    ).toBeInTheDocument();

    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(screen.getByText("4 models")).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Provider" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Model" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Input Modalities" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Output Modalities" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Input Price" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Output Price" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Context Window" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Release Date" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Anthropic")).toBeInTheDocument();
    expect(screen.getByText("Claude Sonnet 5")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Input modalities: Text, Image"),
    ).toBeInTheDocument();
    expect(screen.getAllByLabelText("Output modalities: Text")).toHaveLength(4);
    expect(screen.getByText("$2/M tokens")).toBeInTheDocument();
    expect(screen.getByText("$10/M tokens*")).toBeInTheDocument();
    expect(screen.getByText("1M")).toBeInTheDocument();
    expect(screen.getByText("66K")).toBeInTheDocument();
    expect(screen.getByText("8K")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();
    expect(screen.getByText("Jun 30, 2026")).toBeInTheDocument();
  });

  it("renders a simple error state", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 502 }),
    );

    renderWithQueryClient(<ModelsCatalogPage />);

    expect(await screen.findByText("Models unavailable")).toBeInTheDocument();
  });
});

function renderWithQueryClient(children: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
  );
}
