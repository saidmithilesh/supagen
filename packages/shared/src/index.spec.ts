import { expectTypeOf, it } from "vitest";

import type { HealthCheckResponse } from "./index";

it("defines the health check response contract", () => {
  expectTypeOf<HealthCheckResponse>().toEqualTypeOf<{
    status: "ok";
    service: string;
  }>();
});
