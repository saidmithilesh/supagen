export class ModelCatalogSourceUnavailableError extends Error {
  constructor(message = "Model catalog source is unavailable.") {
    super(message);
  }
}

export class ModelCatalogModelNotFoundError extends Error {
  constructor(readonly modelRef: string) {
    super(`Model catalog model not found: ${modelRef}`);
  }
}
