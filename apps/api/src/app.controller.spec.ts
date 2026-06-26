import { Test } from "@nestjs/testing";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe(AppController.name, () => {
  it("returns the health response from the app service", async () => {
    const getHealth = jest
      .fn<
        ReturnType<AppService["getHealth"]>,
        Parameters<AppService["getHealth"]>
      >()
      .mockReturnValue({
        status: "ok",
        service: "supagen-api",
      });

    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: { getHealth },
        },
      ],
    }).compile();

    const controller = moduleRef.get(AppController);

    expect(controller.getHealth()).toEqual({
      status: "ok",
      service: "supagen-api",
    });
    expect(getHealth).toHaveBeenCalledTimes(1);
  });
});
