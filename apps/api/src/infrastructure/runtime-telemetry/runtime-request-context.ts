import { AsyncLocalStorage } from "node:async_hooks";

import { Injectable } from "@nestjs/common";

export type RuntimeRequestContextStore = {
  requestId: string;
};

@Injectable()
export class RuntimeRequestContext {
  private readonly storage =
    new AsyncLocalStorage<RuntimeRequestContextStore>();

  run<T>(store: RuntimeRequestContextStore, work: () => T): T {
    return this.storage.run(store, work);
  }

  getRequestId() {
    return this.storage.getStore()?.requestId;
  }
}
