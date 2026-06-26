import { Injectable } from "@nestjs/common";
import type { HealthCheckResponse } from "@supagen/shared";

@Injectable()
export class AppService {
  getHealth(): HealthCheckResponse {
    return {
      status: "ok",
      service: "supagen-api",
    };
  }
}
