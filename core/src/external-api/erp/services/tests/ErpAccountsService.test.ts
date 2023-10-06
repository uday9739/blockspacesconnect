import { ErpAccountDto } from "@blockspaces/shared/dtos/erp-data";
import { ErpObject } from "@blockspaces/shared/models/erp-integration/ErpObjects";
import { BadRequestException, UnprocessableEntityException } from "@nestjs/common";
import { createMock } from "ts-auto-mock";
import { ConnectDbDataContext } from "../../../../connect-db/services/ConnectDbDataContext";
import { ConnectLogger } from "../../../../logging/ConnectLogger";
import { ErpAccountsService } from "../ErpAccountsService";

describe(`${ErpAccountsService.name}`, () => {
  let service: ErpAccountsService;
  let mocks: {
    db: ConnectDbDataContext,
    logger: ConnectLogger
  };

  const mockAccount = createMock<ErpObject>();
  const mockAccountDto = createMock<ErpAccountDto>();
  beforeEach(() => {
    mocks = {
      db: createMock<ConnectDbDataContext>(),
      logger: createMock<ConnectLogger>()
    };
    service = new ErpAccountsService(mocks.db, mocks.logger);
  });

  describe(`${ErpAccountsService.prototype.create.name}`, () => {
    it('should be successful', async () => {
      mocks.db.erpObjects.create = jest.fn().mockResolvedValue(mockAccount);
      const response = service.create(mockAccountDto, 'ten');
      expect(response).resolves.toMatchObject(mockAccount);
    });
    it('should fail if create finds duplicate', async () => {
      mocks.db.erpObjects.create = jest.fn().mockRejectedValue({ name: "MongoServerError", code: 11000 });
      const response = service.create(mockAccountDto, 'ten');
      expect(response).rejects.toBeInstanceOf(UnprocessableEntityException);
    });
    it('should fail if create fails', async () => {
      mocks.db.erpObjects.create = jest.fn().mockRejectedValue({ success: false });
      const response = service.create(mockAccountDto, 'ten');
      expect(response).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe(`${ErpAccountsService.prototype.findAll.name}`, () => {
    it('should be successful', async () => {
      mocks.db.erpObjects.find = jest.fn().mockResolvedValue(Array.of(mockAccount));
      const response = service.findAll('tenant', '');
      expect(response).resolves.toMatchObject(Array.of(mockAccount));
    });
    it('should fail if findAll fails', async () => {
      mocks.db.erpObjects.find = jest.fn().mockRejectedValue({ success: false });
      const response = service.findAll('tenant', '');
      expect(response).rejects.toBeInstanceOf(UnprocessableEntityException);
    });
  });
  describe(`${ErpAccountsService.prototype.findOne.name}`, () => {
    it('should be successful', async () => {
      mocks.db.erpObjects.findOne = jest.fn().mockResolvedValue(Array.of(mockAccount));
      const response = service.findOne('tenant', 'externalId', 'domain');
      expect(response).resolves.toMatchObject(Array.of(mockAccount));
    });
    it('should fail if findOne fails', async () => {
      mocks.db.erpObjects.findOne = jest.fn().mockRejectedValue({ success: false });
      const response = service.findOne('tenant', 'externalId', 'domain');
      expect(response).rejects.toBeInstanceOf(UnprocessableEntityException);
    });
  });
  describe(`${ErpAccountsService.prototype.update.name}`, () => {
    it('should be successful', async () => {
      mocks.db.erpObjects.findOneAndUpdate = jest.fn().mockResolvedValue(mockAccount);
      const response = service.update('tenant', 'externalId', 'domain', mockAccountDto);
      expect(response).resolves.toMatchObject(mockAccount);
    });
    it('should fail if update fails', async () => {
      mocks.db.erpObjects.findOneAndUpdate = jest.fn().mockRejectedValue({ success: false });
      const response = service.update('tenant', 'externalId', 'domain', mockAccountDto);
      expect(response).rejects.toBeInstanceOf(UnprocessableEntityException);
    });
  });
  describe(`${ErpAccountsService.prototype.remove.name}`, () => {
    it('should be successful', async () => {
      mocks.db.erpObjects.findOneAndDelete = jest.fn().mockResolvedValue(mockAccount);
      const response = service.remove('tenant', 'externalId', 'domain');
      expect(response).resolves.toMatchObject(mockAccount);
    });
    it('should fail if update fails', async () => {
      mocks.db.erpObjects.findOneAndDelete = jest.fn().mockRejectedValue({ success: false });
      const response = service.remove('tenant', 'externalId', 'domain');
      expect(response).rejects.toBeInstanceOf(UnprocessableEntityException);
    });
  });
});