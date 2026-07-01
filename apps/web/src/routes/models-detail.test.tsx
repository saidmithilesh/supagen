import { fireEvent, render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ModelDetailsPage } from "./models_.$author.$model";

describe(ModelDetailsPage.name, () => {
  const emptyBenchmarks = {
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
          warningMessage:
            "This **model** may be [rate limited](https://example.com/warning).",
          authorName: "Anthropic",
          authorIconUrl: "https://openrouter.ai/images/icons/Anthropic.svg",
          inputModalities: ["text", "image"],
          outputModalities: ["text"],
          supportedParameters: ["tools", "reasoning"],
          supportedParameterDetails: [
            {
              key: "temperature",
              name: "Temperature",
              type: "number",
              values: "0 to 2",
            },
            {
              key: "tools",
              name: "Tools",
              type: "array",
              values: "Any",
            },
            {
              key: "tool_choice",
              name: "Tool Choice",
              type: "string or object",
              values: "auto, none, required",
            },
          ],
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
          pricingCatalog: [
            {
              providerName: "Anthropic",
              providerSlug: "anthropic",
              rows: [
                {
                  skuLabel: "Input Price",
                  price: "$2",
                  unitLabel: "/M tokens",
                  condition: null,
                  source: "display_pricing",
                },
                {
                  skuLabel: "Output Price",
                  price: "$10",
                  unitLabel: "/M tokens",
                  condition: "<= 200K context",
                  source: "display_pricing",
                },
                {
                  skuLabel: "Output Price",
                  price: "$15",
                  unitLabel: "/M tokens",
                  condition: "> 200K context",
                  source: "display_pricing",
                },
              ],
            },
            {
              providerName: "Amazon Bedrock",
              providerSlug: "bedrock",
              rows: [
                {
                  skuLabel: "Output Price",
                  price: "$15",
                  unitLabel: "/M tokens",
                  condition: "> 200K context",
                  source: "display_pricing",
                },
              ],
            },
          ],
          benchmarks: {
            genericScores: {
              lookbackDays: 32,
              scores: [
                {
                  name: "MMLU Pro",
                  value: "0.812",
                  rank: 4,
                },
              ],
            },
            artificialAnalysis: [
              {
                slug: "claude-sonnet-5",
                name: "Claude Sonnet 5",
                modelType: "llm",
                elo: null,
                rank: null,
                ci95: null,
                appearances: null,
                percentiles: [
                  {
                    name: "Intelligence",
                    value: 93,
                  },
                ],
                evaluations: [
                  {
                    name: "Artificial Analysis Intelligence Index",
                    value: "53.4",
                    rank: null,
                  },
                ],
                categories: [],
              },
            ],
            designArena: {
              eloBounds: {
                min: 529,
                max: 1503,
              },
              records: [
                {
                  name: "FLUX.2 [pro]",
                  category: "imageediting",
                  elo: 1157,
                  eloPercentile: 38,
                  winRate: 49.9,
                  averageGenerationTimeMs: 22380,
                  totalTournaments: 30148,
                },
              ],
            },
          },
          contextWindowSize: 1_000_000,
          maxOutputTokens: 65_536,
          averageP50Throughput: 55,
          averageP50Latency: 3104,
        }),
        { status: 200 },
      ),
    );

    renderWithQueryClient(
      <ModelDetailsPage modelRef="anthropic/claude-sonnet-5-20260630" />,
    );

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Claude Sonnet 5",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Avg throughput 55 tok/s")).toBeInTheDocument();
    expect(screen.getByText("Avg latency 3.1s")).toBeInTheDocument();
    expect(screen.getAllByText("Anthropic").length).toBeGreaterThan(0);
    const authorLogoContainer = document.querySelector("[data-slot='avatar']");
    expect(authorLogoContainer).toHaveClass(
      "bg-white",
      "rounded-full",
      "after:border-0",
    );
    expect(authorLogoContainer).not.toHaveClass("border");
    expect(screen.getByText("Frontier", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("Sonnet-class").tagName).toBe("STRONG");
    expect(screen.getByRole("link", { name: "docs" })).toHaveAttribute(
      "href",
      "https://example.com/claude",
    );
    expect(screen.getByText("model").tagName).toBe("STRONG");
    expect(screen.getByRole("link", { name: "rate limited" })).toHaveAttribute(
      "href",
      "https://example.com/warning",
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
    expect(screen.getByRole("heading", { name: "Price" })).toBeInTheDocument();
    expect(
      screen.getByText("(See below for detailed prices)"),
    ).toBeInTheDocument();

    const priceCard = getPriceCard();
    expect(within(priceCard).getByText("$2/M tokens")).toBeInTheDocument();
    expect(within(priceCard).getByText("$10/M tokens*")).toBeInTheDocument();

    expect(screen.getByText("May 01, 2026")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Context Window" }),
    ).toBeInTheDocument();
    expect(screen.getByText("1M")).toBeInTheDocument();
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
    const detailedPricing = getDetailedPricing();
    const parameters = getSupportedParametersTable();
    const benchmarks = getBenchmarks();
    expect(
      detailedPricing.compareDocumentPosition(parameters) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      parameters.compareDocumentPosition(benchmarks) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(detailedPricing).not.toHaveAttribute("open");
    expect(parameters).not.toHaveAttribute("open");
    expect(benchmarks).not.toHaveAttribute("open");
    fireEvent.click(within(detailedPricing).getByText("Detailed Pricing"));
    fireEvent.click(within(parameters).getByText("Supported Parameters"));
    fireEvent.click(within(benchmarks).getByText("Benchmarks"));
    expect(
      within(parameters).getByRole("columnheader", {
        name: "Parameter Name",
      }),
    ).toBeInTheDocument();
    expect(
      within(parameters).getByRole("columnheader", { name: "Key" }),
    ).toBeInTheDocument();
    expect(
      within(parameters).getByRole("columnheader", { name: "Type" }),
    ).toBeInTheDocument();
    expect(
      within(parameters).getByRole("columnheader", { name: "Values" }),
    ).toBeInTheDocument();
    expect(within(parameters).getByText("Temperature")).toBeInTheDocument();
    expect(within(parameters).getByText("temperature")).toBeInTheDocument();
    expect(within(parameters).getByText("number")).toBeInTheDocument();
    expect(within(parameters).getByText("0 to 2")).toBeInTheDocument();
    expect(within(parameters).getByText("Tool Choice")).toBeInTheDocument();
    expect(
      within(parameters).getByText("auto, none, required"),
    ).toBeInTheDocument();
    expect(
      within(detailedPricing).getByRole("columnheader", { name: "SKU" }),
    ).toBeInTheDocument();
    expect(
      within(detailedPricing).getByRole("columnheader", { name: "Provider" }),
    ).toBeInTheDocument();
    expect(
      within(detailedPricing).getByRole("columnheader", { name: "Price" }),
    ).toBeInTheDocument();
    expect(
      within(detailedPricing).getByRole("columnheader", {
        name: "Conditions",
      }),
    ).toBeInTheDocument();
    expect(
      within(detailedPricing).queryByRole("columnheader", { name: "Unit" }),
    ).not.toBeInTheDocument();
    expect(within(detailedPricing).getAllByText("$15/M tokens")).toHaveLength(
      1,
    );
    const [sharedTierRow] = within(detailedPricing)
      .getAllByText("> 200K context")
      .map((element) => element.closest("tr"));
    expect(sharedTierRow).not.toBeNull();
    expect(
      within(sharedTierRow as HTMLElement).getByText("Anthropic"),
    ).toBeInTheDocument();
    expect(
      within(sharedTierRow as HTMLElement).getByText("Amazon Bedrock"),
    ).toBeInTheDocument();
    expect(within(benchmarks).getAllByText(/Score:/).length).toBeGreaterThan(0);
    expect(
      within(benchmarks).getAllByText(/Percentile:/).length,
    ).toBeGreaterThan(0);
    expect(
      within(benchmarks).getByText("Artificial Analysis"),
    ).toBeInTheDocument();
    expect(
      within(benchmarks).getByText("Artificial Analysis Intelligence Index"),
    ).toBeInTheDocument();
    expect(within(benchmarks).getByText("93rd")).toBeInTheDocument();
    expect(within(benchmarks).getByText("Design Arena")).toBeInTheDocument();
    expect(within(benchmarks).getByText("Image Editing")).toBeInTheDocument();
    expect(within(benchmarks).getByText("1,157")).toBeInTheDocument();
    expect(within(benchmarks).getByText("38th")).toBeInTheDocument();
    expect(
      within(benchmarks).queryByText("Benchmark Scores"),
    ).not.toBeInTheDocument();
    expect(within(benchmarks).queryByText("MMLU Pro")).not.toBeInTheDocument();
    expect(within(benchmarks).queryByText("22s")).not.toBeInTheDocument();
    expect(
      within(benchmarks).queryByText("Last 32 days"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Text generation model")).not.toBeInTheDocument();
    expect(screen.queryByText("Catalog Signals")).not.toBeInTheDocument();
  });

  it("renders multimodal capabilities without modality profile cards", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          slug: "xiaomi/mi-vision-pro",
          permaslug: "xiaomi/mi-vision-pro-20260620",
          displayName: "Mi Vision Pro",
          description: "Image model.",
          warningMessage: null,
          authorName: "Xiaomi",
          authorIconUrl: "https://openrouter.ai/images/icons/Xiaomi.svg",
          inputModalities: ["text", "image"],
          outputModalities: ["text", "image"],
          supportedParameters: ["style"],
          supportedParameterDetails: [
            {
              key: "quality",
              name: "Quality",
              type: "enum",
              values: "auto, high",
            },
          ],
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
          pricingCatalog: [],
          benchmarks: emptyBenchmarks,
          averageP50Throughput: null,
          averageP50Latency: null,
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
      await screen.findByRole("heading", { name: "Mi Vision Pro" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Image generation model" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Text generation model")).not.toBeInTheDocument();
    expect(screen.queryByText("Catalog Signals")).not.toBeInTheDocument();
    const capabilities = getModelCapabilities();
    expect(within(capabilities).getByText("Text to Image")).toBeInTheDocument();
    expect(
      within(capabilities).getByText("Reference Images"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Text, Image")).toHaveLength(2);
  });

  it("omits the context window card when the model has no valid context window", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          slug: "unknown/no-context",
          permaslug: "unknown/no-context-20260701",
          displayName: "No Context Model",
          description: null,
          warningMessage: null,
          authorName: "Unknown",
          authorIconUrl: null,
          inputModalities: ["text"],
          outputModalities: ["text"],
          supportedParameters: [],
          supportedParameterDetails: [],
          capabilities: [],
          releaseDate: null,
          inputPrice: null,
          outputPrice: null,
          pricingCatalog: [],
          benchmarks: emptyBenchmarks,
          averageP50Throughput: null,
          averageP50Latency: null,
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

  it("splits long parenthesized model names on the detail page", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          slug: "example/long-name",
          permaslug: "example/long-name-20260701",
          displayName:
            "Example Ultra Detailed Generation Model (Experimental Preview)",
          description: null,
          warningMessage: null,
          authorName: "Example",
          authorIconUrl: null,
          inputModalities: ["text"],
          outputModalities: ["text"],
          supportedParameters: [],
          supportedParameterDetails: [],
          capabilities: [],
          releaseDate: null,
          inputPrice: null,
          outputPrice: null,
          pricingCatalog: [],
          benchmarks: emptyBenchmarks,
          averageP50Throughput: null,
          averageP50Latency: null,
          contextWindowSize: 0,
          maxOutputTokens: null,
        }),
        { status: 200 },
      ),
    );

    renderWithQueryClient(
      <ModelDetailsPage modelRef="example/long-name-20260701" />,
    );

    expect(
      await screen.findByRole("heading", {
        name: "Example Ultra Detailed Generation Model (Experimental Preview)",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Example Ultra Detailed Generation Model"),
    ).toHaveClass("text-[24px]");
    expect(screen.getByText("(Experimental Preview)")).toHaveClass(
      "text-[20px]",
    );
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

function getModelCapabilities() {
  const section = screen.getByText("Model Capabilities:").closest("section");

  expect(section).not.toBeNull();

  return section as HTMLElement;
}

function getPriceCard() {
  const section = screen
    .getByRole("heading", { name: "Price" })
    .closest("section");

  expect(section).not.toBeNull();

  return section as HTMLElement;
}

function getSupportedParametersTable() {
  const label = screen
    .getAllByText("Supported Parameters")
    .find((element) => element.tagName.toLowerCase() === "h2");
  const section = label?.closest("details");

  expect(section).not.toBeNull();

  return section as HTMLElement;
}

function getDetailedPricing() {
  const section = screen
    .getByRole("heading", { name: "Detailed Pricing" })
    .closest("details");

  expect(section).not.toBeNull();

  return section as HTMLElement;
}

function getBenchmarks() {
  const section = screen
    .getByRole("heading", { name: "Benchmarks" })
    .closest("details");

  expect(section).not.toBeNull();

  return section as HTMLElement;
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
