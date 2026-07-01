export class ModelCatalogSourceUnavailableError extends Error {
  constructor(message = "Model catalog source is unavailable.") {
    super(message);
  }
}
