import { render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ModelDetailsPage } from "./models_.$author.$model";

describe(ModelDetailsPage.name, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders common model details from the catalog", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          slug: "anthropic/claude-sonnet-5",
          permaslug: "anthropic/claude-sonnet-5-20260630",
          displayName: "Claude Sonnet 5",
          description:
            "Frontier **Sonnet-class** model with [docs](https://example.com/claude).",
          authorName: "Anthropic",
          authorIconUrl: "https://openrouter.ai/images/icons/Anthropic.svg",
          inputModalities: ["text", "image"],
          outputModalities: ["text"],
          supportedParameters: ["tools", "reasoning"],
          capabilities: [
            {
              key: "text.reasoning",
              label: "Reasoning",
              outputModality: "text",
            },
            {
              key: "text.tool-calling",
              label: "Tool Calling",
              outputModality: "text",
            },
            {
              key: "text.structured-outputs",
              label: "Structured Outputs",
              outputModality: "text",
            },
          ],
          releaseDate: "2026-05-01T10:00:00.000Z",
          inputPrice: "$2/M tokens",
          outputPrice: "$10/M tokens*",
          contextWindowSize: 1_000_000,
          maxOutputTokens: 65_536,
        }),
        { status: 200 },
      ),
    );

    renderWithQueryClient(
      <ModelDetailsPage modelRef="anthropic/claude-sonnet-5-20260630" />,
    );

    expect(
      await screen.findByRole("heading", { name: "Claude Sonnet 5" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Anthropic")).toBeInTheDocument();
    expect(screen.getByText("Frontier", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("Sonnet-class").tagName).toBe("STRONG");
    expect(screen.getByRole("link", { name: "docs" })).toHaveAttribute(
      "href",
      "https://example.com/claude",
    );
    const supportedModalities = screen
      .getByText("Supported Modalities")
      .closest("section");

    expect(supportedModalities).not.toBeNull();
    expect(
      within(supportedModalities as HTMLElement).getByText("Input"),
    ).toBeInTheDocument();
    expect(
      within(supportedModalities as HTMLElement).getByText("Text, Image"),
    ).toBeInTheDocument();
    expect(
      within(supportedModalities as HTMLElement).getByText("Output"),
    ).toBeInTheDocument();
    expect(
      within(supportedModalities as HTMLElement).getByText("Text"),
    ).toBeInTheDocument();
    expect(screen.getByText("Price")).toBeInTheDocument();
    expect(
      screen.getByText("See below for detailed prices."),
    ).toBeInTheDocument();

    const inputPrice = getFirstByLabelText("$2/M tokens");
    expect(within(inputPrice).getByText("$2")).toBeInTheDocument();
    expect(within(inputPrice).getByText("M tokens")).toBeInTheDocument();

    const outputPrice = getFirstByLabelText("$10/M tokens*");
    expect(within(outputPrice).getByText("$10")).toBeInTheDocument();
    expect(within(outputPrice).getByText("M tokens*")).toBeInTheDocument();

    expect(screen.getByText("May 01, 2026")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Context Window" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("1M")).toHaveLength(2);
    expect(screen.getByText("Max Output Tokens")).toBeInTheDocument();
    expect(screen.getByText("66K")).toBeInTheDocument();
    const capabilities = getModelCapabilities();
    expect(
      within(capabilities).getByText("Model Capabilities:"),
    ).toBeInTheDocument();
    expect(within(capabilities).getByText("Reasoning")).toBeInTheDocument();
    expect(within(capabilities).getByText("Tool Calling")).toBeInTheDocument();
    expect(
      within(capabilities).queryByText("Parallel tool calls"),
    ).not.toBeInTheDocument();
    expect(
      within(capabilities).queryByText("Function calling"),
    ).not.toBeInTheDocument();
    expect(
      within(capabilities).queryByText("Tool choice"),
    ).not.toBeInTheDocument();
    expect(
      within(capabilities).getByText("Structured Outputs"),
    ).toBeInTheDocument();
    expect(
      within(capabilities).queryByText("Response format"),
    ).not.toBeInTheDocument();
    expect(
      within(capabilities).queryByText("Web Search"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Text generation model")).toBeInTheDocument();
    expect(screen.getByText("2 parameters")).toBeInTheDocument();
    expect(
      within(getCatalogSignals()).getByText("Reasoning"),
    ).toBeInTheDocument();
    expect(within(getCatalogSignals()).getByText("Tools")).toBeInTheDocument();
  });

  it("uses the first non-text output modality for the detail profile", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          slug: "xiaomi/mi-vision-pro",
          permaslug: "xiaomi/mi-vision-pro-20260620",
          displayName: "Mi Vision Pro",
          description: "Image model.",
          authorName: "Xiaomi",
          authorIconUrl: "https://openrouter.ai/images/icons/Xiaomi.svg",
          inputModalities: ["text", "image"],
          outputModalities: ["text", "image"],
          supportedParameters: ["style"],
          capabilities: [
            {
              key: "image.text-to-image",
              label: "Text to Image",
              outputModality: "image",
            },
            {
              key: "image.reference-images",
              label: "Reference Images",
              outputModality: "image",
            },
          ],
          releaseDate: "2026-06-20T00:00:00.000Z",
          inputPrice: "$0.20/M tokens",
          outputPrice: "$1/image",
          contextWindowSize: 32_000,
          maxOutputTokens: null,
        }),
        { status: 200 },
      ),
    );

    renderWithQueryClient(
      <ModelDetailsPage modelRef="xiaomi/mi-vision-pro-20260620" />,
    );

    expect(
      await screen.findByRole("heading", { name: "Image generation model" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Text generation model")).not.toBeInTheDocument();
    const capabilities = getModelCapabilities();
    expect(within(capabilities).getByText("Text to Image")).toBeInTheDocument();
    expect(
      within(capabilities).getByText("Reference Images"),
    ).toBeInTheDocument();
    expect(screen.getByText("Primary Output")).toBeInTheDocument();
    expect(screen.getByText("Image")).toBeInTheDocument();
  });

  it("omits the context window card when the model has no valid context window", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          slug: "unknown/no-context",
          permaslug: "unknown/no-context-20260701",
          displayName: "No Context Model",
          description: null,
          authorName: "Unknown",
          authorIconUrl: null,
          inputModalities: ["text"],
          outputModalities: ["text"],
          supportedParameters: [],
          capabilities: [],
          releaseDate: null,
          inputPrice: null,
          outputPrice: null,
          contextWindowSize: 0,
          maxOutputTokens: null,
        }),
        { status: 200 },
      ),
    );

    renderWithQueryClient(
      <ModelDetailsPage modelRef="unknown/no-context-20260701" />,
    );

    expect(
      await screen.findByRole("heading", { name: "No Context Model" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Context Window" }),
    ).not.toBeInTheDocument();
  });

  it("renders a not-found state for missing catalog models", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          code: "MODEL_CATALOG_MODEL_NOT_FOUND",
        }),
        { status: 404 },
      ),
    );

    renderWithQueryClient(<ModelDetailsPage modelRef="missing/model" />);

    expect(await screen.findByText("Model not found")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Supagen could not find this model in the public catalog.",
      ),
    ).toBeInTheDocument();
  });
});

function getFirstByLabelText(label: string) {
  const [element] = screen.getAllByLabelText(label);

  expect(element).toBeDefined();

  return element as HTMLElement;
}

function getModelCapabilities() {
  const section = screen.getByText("Model Capabilities:").closest("section");

  expect(section).not.toBeNull();

  return section as HTMLElement;
}

function getCatalogSignals() {
  const panel = screen.getByText("Catalog Signals").closest("div");

  expect(panel).not.toBeNull();

  return panel as HTMLElement;
}

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
