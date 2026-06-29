import { Test } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import request from "supertest";

import { AppModule } from "./app.module";
import { configureApp } from "./configure-app";

describe("App health endpoint", () => {
  let app: INestApplication;
  let config: ConfigService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    config = moduleRef.get(ConfigService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns the API health response", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/v1/health")
      .expect(200)
      .expect({
        status: "ok",
        service: "supagen-api",
      });

    expect(response.headers["x-request-id"]).toEqual(expect.any(String));
  });

  it("preserves a valid incoming request ID", async () => {
    await request(app.getHttpServer())
      .get("/api/v1/health")
      .set("x-request-id", "test-request-id")
      .expect(200)
      .expect("x-request-id", "test-request-id");
  });

  it("loads the test environment", () => {
    expect(config.getOrThrow<string>("DATABASE_URL")).toContain(
      "localhost:15432",
    );
  });
});
