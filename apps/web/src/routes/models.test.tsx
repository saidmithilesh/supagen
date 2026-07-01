import { render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
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
              slug: "anthropic/claude-haiku-5",
              permaslug: "anthropic/claude-haiku-5-20260501",
              displayName: "Claude Haiku 5",
              description: "Fast Haiku-class model.",
              authorName: "Anthropic",
              authorIconUrl: "https://openrouter.ai/images/icons/Anthropic.svg",
              inputModalities: ["text"],
              outputModalities: ["text"],
              supportedParameters: ["tools"],
              releaseDate: "2026-05-01T10:00:00.000Z",
              inputPrice: "$1/M tokens",
              outputPrice: "$5/M tokens",
              contextWindowSize: 200_000,
            },
            {
              slug: "anthropic/claude-sonnet-5",
              permaslug: "anthropic/claude-sonnet-5-20260630",
              displayName: "Claude Sonnet 5",
              description: "Frontier Sonnet-class model.",
              authorName: "Anthropic",
              authorIconUrl: "https://openrouter.ai/images/icons/Anthropic.svg",
              inputModalities: ["text", "image"],
              outputModalities: ["text"],
              supportedParameters: ["tools", "reasoning"],
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
              supportedParameters: ["response_format"],
              releaseDate: null,
              inputPrice: null,
              outputPrice: null,
              contextWindowSize: 65_536,
            },
            {
              slug: "xiaomi/mi-vision-pro",
              permaslug: "xiaomi/mi-vision-pro-20260620",
              displayName: "Mi Vision Pro",
              description: "Image model.",
              authorName: "Xiaomi",
              authorIconUrl: "https://openrouter.ai/images/icons/Xiaomi.svg",
              inputModalities: ["text", "image"],
              outputModalities: ["image"],
              supportedParameters: ["reasoning"],
              releaseDate: "2026-06-20T00:00:00.000Z",
              inputPrice: "$0.20/M tokens",
              outputPrice: "$1/image",
              contextWindowSize: 32_000,
            },
            {
              slug: "xiaomi/mi-speech",
              permaslug: "xiaomi/mi-speech-20260615",
              displayName: "Mi Speech",
              description: "Speech model.",
              authorName: " Xiaomi ",
              authorIconUrl: null,
              inputModalities: ["text"],
              outputModalities: ["speech"],
              supportedParameters: ["voice"],
              releaseDate: "2026-06-15T00:00:00.000Z",
              inputPrice: "$0.10/M tokens",
              outputPrice: "$0.50/M tokens",
              contextWindowSize: 16_000,
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
              supportedParameters: [],
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
              supportedParameters: [],
              releaseDate: null,
              inputPrice: null,
              outputPrice: null,
              contextWindowSize: 0,
            },
          ],
          filters: {
            inputModalities: ["text", "image"],
            outputModalities: ["text", "image", "speech"],
            providers: ["Anthropic", "Mistral", "OpenAI", "Unknown", "Xiaomi"],
            supportedParameters: [
              "reasoning",
              "response_format",
              "tools",
              "voice",
            ],
          },
        }),
        { status: 200 },
      ),
    );

    renderWithQueryClient(<ModelsCatalogPage />);

    const nav = screen.getByRole("navigation");
    expect(within(nav).getByRole("link", { name: "Supagen" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(within(nav).getByRole("link", { name: "Connect" })).toHaveAttribute(
      "href",
      "#how-it-works",
    );
    expect(within(nav).getByRole("link", { name: "Pricing" })).toHaveAttribute(
      "href",
      "/pricing",
    );
    expect(within(nav).getByRole("link", { name: "Models" })).toHaveAttribute(
      "href",
      "/models",
    );

    expect(
      screen.getByRole("heading", {
        name: "Models",
      }),
    ).toBeInTheDocument();

    expect(await screen.findAllByRole("table")).toHaveLength(5);
    expect(
      screen.getByText(
        "Choose from over 7 models across 5 providers in Supagen for agentic workflows, image generation, speech synthesis, video creation and more...",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Filters" })).toBeVisible();
    expect(
      within(getFilterSection("Input Modalities")).getByRole("checkbox", {
        name: "Image",
      }),
    ).toBeInTheDocument();
    expect(
      within(getFilterSection("Output Modalities")).getByRole("checkbox", {
        name: "Speech",
      }),
    ).toBeInTheDocument();
    expect(
      within(getFilterSection("Providers")).getByRole("checkbox", {
        name: "Anthropic",
      }),
    ).toBeInTheDocument();
    expect(
      within(getFilterSection("Supported Parameters")).getByRole("checkbox", {
        name: "Response Format",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("columnheader", { name: "Provider" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Anthropic" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "OpenAI" })).toBeVisible();
    expect(screen.getAllByRole("heading", { name: "Xiaomi" })).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Mistral" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Unknown" })).toBeVisible();
    expect(
      within(getAuthorSection("Anthropic")).getByText("2 models"),
    ).toBeInTheDocument();
    expect(
      within(getAuthorSection("Xiaomi")).getByText("2 models"),
    ).toBeInTheDocument();
    expect(getAuthorSection("Anthropic")).toHaveAttribute("open");
    expect(screen.getAllByRole("columnheader", { name: "Model" })).toHaveLength(
      5,
    );
    expect(
      screen.getAllByRole("columnheader", { name: "Input Modalities" }),
    ).toHaveLength(5);
    expect(
      screen.getAllByRole("columnheader", { name: "Output Modalities" }),
    ).toHaveLength(5);
    expect(
      screen.getAllByRole("columnheader", { name: "Input Price" }),
    ).toHaveLength(5);
    expect(
      screen.getAllByRole("columnheader", { name: "Output Price" }),
    ).toHaveLength(5);
    expect(
      screen.getAllByRole("columnheader", { name: "Context Window" }),
    ).toHaveLength(5);
    expect(
      screen.getAllByRole("columnheader", { name: "Release Date" }),
    ).toHaveLength(5);
    expect(screen.getByText("Claude Sonnet 5")).toBeInTheDocument();
    expect(screen.getByText("Claude Haiku 5")).toBeInTheDocument();
    expect(
      within(getAuthorSection("Anthropic")).getAllByRole("row"),
    ).toHaveLength(3);
    expect(
      screen.getByRole("link", { name: "Claude Sonnet 5" }),
    ).toHaveAttribute("href", "/models/anthropic/claude-sonnet-5-20260630");
    expect(getAuthorSection("Anthropic").textContent).toMatch(
      /Claude Sonnet 5[\s\S]*Claude Haiku 5/,
    );
    expect(within(getAuthorSection("Xiaomi")).getAllByRole("row")).toHaveLength(
      3,
    );
    expect(getAuthorSection("Xiaomi").textContent).toMatch(
      /Mi Vision Pro[\s\S]*Mi Speech/,
    );
    expect(
      screen.getAllByLabelText("Input modalities: Text, Image"),
    ).toHaveLength(2);
    expect(getModalityIconContainers("Input modalities: Text, Image")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          className: expect.stringContaining("text-sky-500"),
        }),
        expect.objectContaining({
          className: expect.stringContaining("text-fuchsia-500"),
        }),
      ]),
    );
    expect(screen.getAllByLabelText("Output modalities: Text")).toHaveLength(5);
    expect(
      screen.getByLabelText("Output modalities: Image"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Output modalities: Speech"),
    ).toBeInTheDocument();
    expect(getModalityIconContainers("Output modalities: Speech")).toEqual([
      expect.objectContaining({
        className: expect.stringContaining("text-orange-500"),
      }),
    ]);
    const sonnetInputPrice = screen.getByLabelText("$2/M tokens");
    expect(within(sonnetInputPrice).getByText("$2")).toBeInTheDocument();
    expect(within(sonnetInputPrice).getByText("M tokens")).toBeInTheDocument();
    const sonnetOutputPrice = screen.getByLabelText("$10/M tokens*");
    expect(within(sonnetOutputPrice).getByText("$10")).toBeInTheDocument();
    expect(
      within(sonnetOutputPrice).getByText("M tokens*"),
    ).toBeInTheDocument();
    expect(screen.getByText("1M")).toBeInTheDocument();
    expect(screen.getByText("200K")).toBeInTheDocument();
    expect(screen.getByText("32K")).toBeInTheDocument();
    expect(screen.getByText("16K")).toBeInTheDocument();
    expect(screen.getByText("66K")).toBeInTheDocument();
    expect(screen.getByText("8K")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();
    expect(screen.getByText("Jun 30, 2026")).toBeInTheDocument();
    expect(screen.getByText("Jun 20, 2026")).toBeInTheDocument();
    expect(screen.getByText("Jun 15, 2026")).toBeInTheDocument();
    expect(screen.getByText("May 01, 2026")).toBeInTheDocument();
    expect(screen.queryByText("May 1, 2026")).not.toBeInTheDocument();
  });

  it("renders a simple error state", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 502 }),
    );

    renderWithQueryClient(<ModelsCatalogPage />);

    expect(await screen.findByText("Models unavailable")).toBeInTheDocument();
  });

  it("orders preferred author groups before fallback authors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            modelFixture({
              authorName: "Mistral",
              displayName: "Mistral Latest",
              permaslug: "mistral/latest-20261201",
              releaseDate: "2026-12-01T00:00:00.000Z",
              slug: "mistral/latest",
            }),
            modelFixture({
              authorName: "Qwen",
              displayName: "Qwen Older",
              permaslug: "qwen/older-20260101",
              releaseDate: "2026-01-01T00:00:00.000Z",
              slug: "qwen/older",
            }),
            modelFixture({
              authorName: "OpenAI",
              displayName: "OpenAI Newer",
              permaslug: "openai/newer-20261101",
              releaseDate: "2026-11-01T00:00:00.000Z",
              slug: "openai/newer",
            }),
            modelFixture({
              authorName: "DeepSeek",
              displayName: "DeepSeek Recent",
              permaslug: "deepseek/recent-20261001",
              releaseDate: "2026-10-01T00:00:00.000Z",
              slug: "deepseek/recent",
            }),
            modelFixture({
              authorName: " Moonshot AI ",
              displayName: "Moonshot Trimmed",
              permaslug: "moonshot/trimmed-20260201",
              releaseDate: "2026-02-01T00:00:00.000Z",
              slug: "moonshot/trimmed",
            }),
            modelFixture({
              authorName: "X.ai",
              displayName: "xAI Variant",
              permaslug: "xai/variant-20260901",
              releaseDate: "2026-09-01T00:00:00.000Z",
              slug: "xai/variant",
            }),
            modelFixture({
              authorName: "Google",
              displayName: "Google Older",
              permaslug: "google/older-20260301",
              releaseDate: "2026-03-01T00:00:00.000Z",
              slug: "google/older",
            }),
            modelFixture({
              authorName: "Z.ai",
              displayName: "Z.ai Middle",
              permaslug: "zai/middle-20260401",
              releaseDate: "2026-04-01T00:00:00.000Z",
              slug: "zai/middle",
            }),
            modelFixture({
              authorName: "anthropic",
              displayName: "Anthropic Oldest",
              permaslug: "anthropic/oldest-20251201",
              releaseDate: "2025-12-01T00:00:00.000Z",
              slug: "anthropic/oldest",
            }),
          ],
          filters: {
            inputModalities: ["text"],
            outputModalities: ["text"],
            providers: [
              "Anthropic",
              "DeepSeek",
              "Google",
              "Mistral",
              "Moonshot AI",
              "OpenAI",
              "Qwen",
              "X.ai",
              "Z.ai",
            ],
            supportedParameters: [],
          },
        }),
        { status: 200 },
      ),
    );

    renderWithQueryClient(<ModelsCatalogPage />);

    expect(await screen.findByText("Mistral Latest")).toBeInTheDocument();
    expect(getAuthorGroupNames()).toEqual([
      "anthropic",
      "Google",
      "OpenAI",
      "X.ai",
      "Z.ai",
      "Moonshot AI",
      "DeepSeek",
      "Qwen",
      "Mistral",
    ]);
  });

  it("requests filtered Supagen models when a filter is selected", async () => {
    const user = userEvent.setup();
    const filters = {
      inputModalities: ["text", "image"],
      outputModalities: ["text", "image"],
      providers: ["Anthropic", "Xiaomi"],
      supportedParameters: ["reasoning", "tools"],
    };
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [
              {
                slug: "anthropic/claude-sonnet-5",
                permaslug: "anthropic/claude-sonnet-5-20260630",
                displayName: "Claude Sonnet 5",
                description: "Frontier Sonnet-class model.",
                authorName: "Anthropic",
                authorIconUrl:
                  "https://openrouter.ai/images/icons/Anthropic.svg",
                inputModalities: ["text", "image"],
                outputModalities: ["text"],
                supportedParameters: ["tools", "reasoning"],
                releaseDate: "2026-06-30T18:11:23.921Z",
                inputPrice: "$2/M tokens",
                outputPrice: "$10/M tokens*",
                contextWindowSize: 1_000_000,
              },
              {
                slug: "xiaomi/mi-vision-pro",
                permaslug: "xiaomi/mi-vision-pro-20260620",
                displayName: "Mi Vision Pro",
                description: "Image model.",
                authorName: "Xiaomi",
                authorIconUrl: "https://openrouter.ai/images/icons/Xiaomi.svg",
                inputModalities: ["text", "image"],
                outputModalities: ["image"],
                supportedParameters: ["reasoning"],
                releaseDate: "2026-06-20T00:00:00.000Z",
                inputPrice: "$0.20/M tokens",
                outputPrice: "$1/image",
                contextWindowSize: 32_000,
              },
            ],
            filters,
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [
              {
                slug: "xiaomi/mi-vision-pro",
                permaslug: "xiaomi/mi-vision-pro-20260620",
                displayName: "Mi Vision Pro",
                description: "Image model.",
                authorName: "Xiaomi",
                authorIconUrl: "https://openrouter.ai/images/icons/Xiaomi.svg",
                inputModalities: ["text", "image"],
                outputModalities: ["image"],
                supportedParameters: ["reasoning"],
                releaseDate: "2026-06-20T00:00:00.000Z",
                inputPrice: "$0.20/M tokens",
                outputPrice: "$1/image",
                contextWindowSize: 32_000,
              },
            ],
            filters,
          }),
          { status: 200 },
        ),
      );

    renderWithQueryClient(<ModelsCatalogPage />);

    await screen.findByText("Claude Sonnet 5");

    await user.click(
      within(getFilterSection("Output Modalities")).getByRole("checkbox", {
        name: "Image",
      }),
    );

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenLastCalledWith(
        expect.stringContaining("outputModalities=image"),
        expect.any(Object),
      );
    });
    await waitFor(() => {
      expect(screen.queryByText("Claude Sonnet 5")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Mi Vision Pro")).toBeInTheDocument();
    expect(screen.getAllByRole("table")).toHaveLength(1);
    expect(
      screen.queryByRole("columnheader", { name: "Provider" }),
    ).not.toBeInTheDocument();
  });
});

function getAuthorSection(authorName: string) {
  const section = screen
    .getByRole("heading", {
      name: authorName,
    })
    .closest("details");

  expect(section).not.toBeNull();

  return section as HTMLElement;
}

function getAuthorGroupNames() {
  return screen
    .getAllByRole("heading", { level: 2 })
    .filter((heading) => heading.closest("details"))
    .map((heading) => heading.textContent);
}

function getModalityIconContainers(label: string) {
  const modalityGroup = screen.getAllByLabelText(label)[0];

  expect(modalityGroup).toBeDefined();

  return Array.from(
    modalityGroup.querySelectorAll<HTMLElement>("[data-slot='material-icon']"),
  ).flatMap((icon) => (icon.parentElement ? [icon.parentElement] : []));
}

function getFilterSection(label: string) {
  const legend = screen
    .getAllByText(label)
    .find((element) => element.tagName.toLowerCase() === "legend");
  const section = legend?.closest("fieldset");

  expect(section).not.toBeNull();

  return section as HTMLElement;
}

function modelFixture(
  overrides: Partial<{
    authorName: string | null;
    displayName: string;
    permaslug: string;
    releaseDate: string | null;
    slug: string;
  }>,
) {
  return {
    authorIconUrl: null,
    authorName: "Example",
    contextWindowSize: 8_192,
    description: null,
    displayName: "Example Model",
    inputModalities: ["text"],
    inputPrice: null,
    outputModalities: ["text"],
    outputPrice: null,
    permaslug: "example/model",
    releaseDate: null,
    slug: "example/model",
    supportedParameters: [],
    ...overrides,
  };
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
