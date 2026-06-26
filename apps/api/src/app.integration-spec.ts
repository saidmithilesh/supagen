import { Test } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import request from "supertest";

import { AppModule } from "./app.module";

describe("App health endpoint", () => {
  let app: INestApplication;
  let config: ConfigService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    config = moduleRef.get(ConfigService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns the API health response", async () => {
    await request(app.getHttpServer()).get("/health").expect(200).expect({
      status: "ok",
      service: "supagen-api",
    });
  });

  it("loads the test environment", () => {
    expect(config.getOrThrow<string>("DATABASE_URL")).toContain(
      "localhost:15432",
    );
  });
});
