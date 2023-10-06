import logger from "@blockspaces/shared/loggers/bscLogger";
import ApiResult from "@blockspaces/shared/models/ApiResult";
import { CreateLightningNodeDto, LightningNodeReference } from "@blockspaces/shared/models/lightning/Node";
import { IUser } from "@blockspaces/shared/models/users";
import { HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { createMock } from "ts-auto-mock";
import { ConnectDbDataContext } from "../../../../../connect-db/services/ConnectDbDataContext";
import { LightningNodeController } from "../LightningNodeController";

// Make the logging quite for testing
logger.info = jest.fn();
logger.debug = jest.fn();
logger.error = jest.fn();
logger.trace = jest.fn();
logger.log = jest.fn();

describe(LightningNodeController, () => {
  let lightningNodeController: LightningNodeController;
  let mockServices: {
    db: ConnectDbDataContext
  };
  let mockResponse: {
    lightningNodeReference: LightningNodeReference
  };
  let mockRequests: {
    create: CreateLightningNodeDto,
    user: IUser,
    lightningNodeReference: LightningNodeReference,
  };
  // Document<unknown, any, LightningNodeReference>
  beforeAll(async () => {
    mockRequests = {
      create: createMock<CreateLightningNodeDto>(),
      user: createMock<IUser>({
        tenants: ["tenatId"]
      }),
      lightningNodeReference: createMock<CreateLightningNodeDto>(),
    };
    mockResponse = {
      lightningNodeReference: createMock<LightningNodeReference>({
        apiEndpoint: "endpoint",
        nodeId: "nodeId",
      }),
    };
    mockServices = {
      db: createMock<ConnectDbDataContext>(),
    };
    lightningNodeController = new LightningNodeController(mockServices.db);
  });

  it(`${LightningNodeController.name} should be defined`, () => {
    expect(lightningNodeController).toBeDefined();
  });

  describe(`LightningNodeController.prototype.create`, () => {
    it(`should create new Node`, async () => {
      mockServices.db.lightningNodes.create = jest.fn().mockResolvedValue(mockResponse.lightningNodeReference);
      const result = await lightningNodeController.create(mockRequests.create);
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(ApiResult);
      expect(result.status).toBe('success');
      expect(result.isSuccess).toBeTruthy();
    }, 10000);
    it(`should fail when error encountered`, async () => {
      mockServices.db.lightningNodes.create = async () => {throw new NotFoundException('Could not create the Node: ');};
      const result = await lightningNodeController.create(mockRequests.create);
      expect(result).toBeInstanceOf(ApiResult);
      expect(result.status).toBe('failed');
      expect(result.message).toBe('Could not create the Node: ');
      expect(result.data).toBeUndefined();
      expect(result.isFailure).toBeTruthy();
    }, 10000);
  });

  describe(`LightningNodeController.prototype.findByTenant`, () => {
    it(`should find Node using Tenant Id`, async () => {
      mockServices.db.lightningNodes.findOne = jest.fn().mockResolvedValue(mockResponse.lightningNodeReference);
      const result = await lightningNodeController.findByTenant("tenant-id");
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(ApiResult);
      expect(result.status).toBe('success');
      expect(result.isSuccess).toBeTruthy();
    }, 10000);
    it(`should NOT find Node using Tenant Id`, async () => {
      mockServices.db.lightningNodes.findOne = jest.fn().mockResolvedValue(null);
      try{
        await lightningNodeController.findByTenant("tenant-id");
        expect(1).toBe(2);
      } catch (err) {
        const error = err as HttpException;
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    }, 10000);
  });

  describe(`LightningNodeController.prototype.findAll`, () => {
    it(`should find all Nodes`, async () => {
      mockServices.db.lightningNodes.findAll = jest.fn().mockResolvedValue([mockResponse.lightningNodeReference]);
      const result = await lightningNodeController.findAll();
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(ApiResult);
      expect(result.status).toBe('success');
      expect(result.isSuccess).toBeTruthy();
    }, 10000);
    it(`should NOT find any Nodes`, async () => {
      mockServices.db.lightningNodes.findAll = jest.fn().mockResolvedValue(null);
      try{
        await lightningNodeController.findAll();
        expect(1).toBe(2);
      } catch (err) {
        const error = err as HttpException;
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    }, 10000);
  });

  describe(`LightningNodeController.prototype.update`, () => {
    it(`should update Node by Node Id`, async () => {
      mockServices.db.lightningNodes.findOneAndUpdate = jest.fn().mockResolvedValue(mockResponse.lightningNodeReference);
      const result = await lightningNodeController.update("some-node-id", mockRequests.lightningNodeReference);
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(ApiResult);
      expect(result.status).toBe('success');
      expect(result.isSuccess).toBeTruthy();
    }, 10000);
    it(`should NOT update Node`, async () => {
      mockServices.db.lightningNodes.findOneAndUpdate = jest.fn().mockResolvedValue(null);
      try {
        await lightningNodeController.update("some-node-id", mockRequests.lightningNodeReference);
        expect(1).toBe(2);
      } catch (err) {
        const error = err as HttpException;
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);  
      }
    }, 10000);
  });

  describe(`LightningNodeController.delete`, () => {
    it(`should Delete Node by Node Id`, async () => {
      mockServices.db.lightningNodes.findOneAndDelete = jest.fn().mockResolvedValue(mockResponse.lightningNodeReference);
      const result = await lightningNodeController.delete("some-node-id");
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(ApiResult);
      expect(result.status).toBe('success');
      expect(result.isSuccess).toBeTruthy();
    }, 10000);
    it(`should NOT Delete Node`, async () => {
      mockServices.db.lightningNodes.findOneAndDelete = jest.fn().mockResolvedValue(null);
      try {
        await lightningNodeController.delete("some-node-id");
        expect(1).toBe(2);
      } catch (err) {
        const error = err as HttpException;
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);  
      }
    }, 10000);
  });
});
