import { MacaroonSecretDto } from "@blockspaces/shared/dtos/lightning";
import logger from "@blockspaces/shared/loggers/bscLogger";
import ApiResult from "@blockspaces/shared/models/ApiResult";
import { IUser } from "@blockspaces/shared/models/users";
import { createMock } from "ts-auto-mock";
import { LightningMacaroonService } from "../../services/LightningMacaroonService";
import { LightningMacaroonController } from "../LightningMacaroonController";

// Make the logging quite for testing
logger.info = jest.fn();
logger.debug = jest.fn();
logger.error = jest.fn();
logger.trace = jest.fn();
logger.log = jest.fn();

describe(LightningMacaroonController, () => {
  let lightningMacaroonController: LightningMacaroonController;
  let mockServices: {
    authService: LightningMacaroonService
   };
  let mockResponse: { 
    macaroonSecretDto: MacaroonSecretDto,
   };
  let mockRequests: { 
    macaroonSecretDto: MacaroonSecretDto,
    user: IUser,
   };
  // Document<unknown, any, LightningNodeReference>
  beforeAll(async () => {
    mockRequests = {
      macaroonSecretDto: createMock<MacaroonSecretDto>(),
      user: createMock<IUser>(),
    };
    mockResponse = {
      macaroonSecretDto: createMock<MacaroonSecretDto>(),
    };
    mockServices = {
      authService: createMock<LightningMacaroonService>()
    };

    lightningMacaroonController = new LightningMacaroonController(mockServices.authService);
  });

  it(`${LightningMacaroonController.name} should be defined`, () => {
    expect(lightningMacaroonController).toBeDefined();
  });

  describe(LightningMacaroonController.prototype.storeMacaroon, () => {
    it(`${LightningMacaroonController.prototype.storeMacaroon} should store Macaroon`, async () => {
      mockServices.authService.storeMacaroon = jest.fn().mockResolvedValue("Macaroon");
      const result = await lightningMacaroonController.storeMacaroon(mockRequests.user, mockRequests.macaroonSecretDto);
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(ApiResult);
      expect(result.status).toBe('success');
      expect(result.isSuccess).toBeTruthy();
    }, 10000);
    it(`${LightningMacaroonController.prototype.storeMacaroon} should NOT Store the Macaroon`, async () => {
      mockServices.authService.storeMacaroon = jest.fn().mockResolvedValue(null);
      const result = await lightningMacaroonController.storeMacaroon(mockRequests.user, mockRequests.macaroonSecretDto);
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(ApiResult);
      expect(result.status).toBe('failed');
      expect(result.message).toBe(`Did not store secret.`);
      expect(result.data).toBeUndefined();
      expect(result.isFailure).toBeTruthy();
    }, 10000);
  });

  describe(LightningMacaroonController.prototype.getMacaroon, () => {
    it(`${LightningMacaroonController.prototype.getMacaroon} should find Macaroon`, async () => {
      mockServices.authService.getMacaroon = jest.fn().mockResolvedValue(mockResponse.macaroonSecretDto);
      const result = await lightningMacaroonController.getMacaroon(mockRequests.user);
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(ApiResult);
      expect(result.status).toBe('success');
      expect(result.isSuccess).toBeTruthy();
    }, 10000);
    it(`${LightningMacaroonController.prototype.getMacaroon} should NOT find the Macaroon`, async () => {
      mockServices.authService.getMacaroon = jest.fn().mockResolvedValue(null);
      const result = await lightningMacaroonController.getMacaroon(mockRequests.user);
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(ApiResult);
      expect(result.status).toBe('failed');
      expect(result.message).toBe(`Could not retrieve macaroon.`);
      expect(result.data).toBeUndefined();
      expect(result.isFailure).toBeTruthy();
    }, 10000);
  });
});