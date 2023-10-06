import { ErpInvoiceDto } from "@blockspaces/shared/dtos/erp-data";
import { ErpObject } from "@blockspaces/shared/models/erp-integration/ErpObjects";
import { BadRequestException, UnprocessableEntityException } from "@nestjs/common";
import { createMock } from "ts-auto-mock";
import { ConnectDbDataContext } from "../../../../connect-db/services/ConnectDbDataContext";
import { ConnectLogger } from "../../../../logging/ConnectLogger";
import { ErpInvoicesService } from "../ErpInvoicesService";

describe(`${ErpInvoicesService.name}`, () => {
  let service: ErpInvoicesService;
  let mocks: {
    db: ConnectDbDataContext,
    logger: ConnectLogger
  };

  const mockInvoice = createMock<ErpObject>();
  const mockInvoiceDto = createMock<ErpInvoiceDto>();
  beforeEach(() => {
    mocks = {
      db: createMock<ConnectDbDataContext>(),
      logger: createMock<ConnectLogger>()
    };
    service = new ErpInvoicesService(mocks.db, mocks.logger);
  });

  describe(`${ErpInvoicesService.prototype.create.name}`, () => {
    it('should be successful', async () => {
      mocks.db.erpObjects.create = jest.fn().mockResolvedValue(mockInvoice);
      const response = service.create(mockInvoiceDto, 'ten');
      expect(response).resolves.toMatchObject(mockInvoice);
    });
    it('should fail if create finds duplicate', async () => {
      mocks.db.erpObjects.create = jest.fn().mockRejectedValue({ name: "MongoServerError", code: 11000 });
      const response = service.create(mockInvoiceDto, 'ten');
      expect(response).rejects.toBeInstanceOf(UnprocessableEntityException);
    });
    it('should fail if create fails', async () => {
      mocks.db.erpObjects.create = jest.fn().mockRejectedValue({ success: false });
      const response = service.create(mockInvoiceDto, 'ten');
      expect(response).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe(`${ErpInvoicesService.prototype.findAll.name}`, () => {
    it('should be successful', async () => {
      mocks.db.erpObjects.find = jest.fn().mockResolvedValue(Array.of(mockInvoice));
      const response = service.findAll('tenant', '');
      expect(response).resolves.toMatchObject(Array.of(mockInvoice));
    });
    it('should fail if findAll fails', async () => {
      mocks.db.erpObjects.find = jest.fn().mockRejectedValue({ success: false });
      const response = service.findAll('tenant', '');
      expect(response).rejects.toBeInstanceOf(UnprocessableEntityException);
    });
  });
  describe(`${ErpInvoicesService.prototype.findOne.name}`, () => {
    it('should be successful', async () => {
      mocks.db.erpObjects.findOne = jest.fn().mockResolvedValue(Array.of(mockInvoice));
      const response = service.findOne('tenant', 'externalId', 'domain');
      expect(response).resolves.toMatchObject(Array.of(mockInvoice));
    });
    it('should fail if findOne fails', async () => {
      mocks.db.erpObjects.findOne = jest.fn().mockRejectedValue({ success: false });
      const response = service.findOne('tenant', 'externalId', 'domain');
      expect(response).rejects.toBeInstanceOf(UnprocessableEntityException);
    });
  });
  describe(`${ErpInvoicesService.prototype.update.name}`, () => {
    it('should be successful', async () => {
      mocks.db.erpObjects.findOneAndUpdate = jest.fn().mockResolvedValue(mockInvoice);
      const response = service.update('tenant', 'externalId', 'domain', mockInvoiceDto);
      expect(response).resolves.toMatchObject(mockInvoice);
    });
    it('should fail if update fails', async () => {
      mocks.db.erpObjects.findOneAndUpdate = jest.fn().mockRejectedValue({ success: false });
      const response = service.update('tenant', 'externalId', 'domain', mockInvoiceDto);
      expect(response).rejects.toBeInstanceOf(UnprocessableEntityException);
    });
  });
  describe(`${ErpInvoicesService.prototype.remove.name}`, () => {
    it('should be successful', async () => {
      mocks.db.erpObjects.findOneAndDelete = jest.fn().mockResolvedValue(mockInvoice);
      const response = service.remove('tenant', 'externalId', 'domain');
      expect(response).resolves.toMatchObject(mockInvoice);
    });
    it('should fail if update fails', async () => {
      mocks.db.erpObjects.findOneAndDelete = jest.fn().mockRejectedValue({ success: false });
      const response = service.remove('tenant', 'externalId', 'domain');
      expect(response).rejects.toBeInstanceOf(UnprocessableEntityException);
    });
  });
});