import {PlatformStatusController} from "./PlatformStatusController";
import {PlatformStatusService} from "../services/PlatformStatusService";
import {createMock} from "ts-auto-mock";
import {ApiResultStatus} from "@blockspaces/shared/models/ApiResult";
import {PlatformApiResponse, PlatformStatus} from "@blockspaces/shared/models/platform";

describe(PlatformStatusController, () => {
  let platformStatusController: PlatformStatusController;
  let platformStatusService: PlatformStatusService;
  beforeEach(() => {
    platformStatusService = createMock<PlatformStatusService>({
      getStatus(): Promise<PlatformApiResponse> {
        return Promise.resolve({adminMessage: "Me OK!"});
      },
      getDetailedStatus(): Promise<PlatformApiResponse> {
        const testResponse: PlatformApiResponse = {
          timestamp: 1653339367033,
          adminMessage: "All systems are operational as of Monday, May 23, 2022, 4:56 PM",
          systemStatus: PlatformStatus.normal,
          appIdStatus: PlatformStatus.normal,
          vaultStatus: PlatformStatus.normal,
          databaseStatus: PlatformStatus.normal,
        };
        return Promise.resolve(testResponse);
      },
    });
    platformStatusController = new PlatformStatusController(platformStatusService);
  });
  it(`${PlatformStatusController} should respond to getStatus`, async () => {
    const response = await platformStatusController.getStatus();
    expect(response.status).toBe(ApiResultStatus.Success);
    expect(response.data.adminMessage).toBe("Me OK!");
  });
  it(`${PlatformStatusController} should respond to getDetailedStatus`, async () => {
    const response = await platformStatusController.getDetailedStatus();
    expect(response.status).toBe(ApiResultStatus.Success);
    expect(response.data.systemStatus).toBe(PlatformStatus.normal);
  });
});
