import { ErpSalesReceiptDto } from "@blockspaces/shared/dtos/erp-data";
import { ErpObject } from "@blockspaces/shared/models/erp-integration/ErpObjects";
import { BadRequestException, UnprocessableEntityException } from "@nestjs/common";
import { createMock } from "ts-auto-mock";
import { ConnectDbDataContext } from "../../../../connect-db/services/ConnectDbDataContext";
import { ConnectLogger } from "../../../../logging/ConnectLogger";
import { ErpSalesReceiptsService } from "../ErpSalesReceiptsService";

describe(`${ErpSalesReceiptsService.name}`, () => {
  let service: ErpSalesReceiptsService;
  let mocks: {
    db: ConnectDbDataContext,
    logger: ConnectLogger
  };

  const mockSalesReceipt = createMock<ErpObject>();
  const mockSalesReceiptDto = createMock<ErpSalesReceiptDto>({jsonBlob: JSON.stringify({ln_payment_request: 'test'})});
  beforeEach(() => {
    mocks = {
      db: createMock<ConnectDbDataContext>(),
      logger: createMock<ConnectLogger>()
    };
    service = new ErpSalesReceiptsService(mocks.db, mocks.logger);
  });

  describe(`${ErpSalesReceiptsService.prototype.create.name}`, () => {
    it('should be successful', async () => {
      mocks.db.erpObjects.create = jest.fn().mockResolvedValue(mockSalesReceipt);
      mocks.db.lightningInvoices.findOneAndUpdate = jest.fn().mockResolvedValue(null);
      const response = service.create(mockSalesReceiptDto, 'ten');
      expect(response).resolves.toMatchObject(mockSalesReceipt);
    });
    it('should fail if create finds duplicate', async () => {
      mocks.db.erpObjects.create = jest.fn().mockRejectedValue({ name: "MongoServerError", code: 11000 });
      const response = service.create(mockSalesReceiptDto, 'ten');
      expect(response).rejects.toBeInstanceOf(UnprocessableEntityException);
    });
    it('should fail if create fails', async () => {
      mocks.db.erpObjects.create = jest.fn().mockRejectedValue({ success: false });
      const response = service.create(mockSalesReceiptDto, 'ten');
      expect(response).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe(`${ErpSalesReceiptsService.prototype.findAll.name}`, () => {
    it('should be successful', async () => {
      mocks.db.erpObjects.find = jest.fn().mockResolvedValue(Array.of(mockSalesReceipt));
      const response = service.findAll('tenant', '');
      expect(response).resolves.toMatchObject(Array.of(mockSalesReceipt));
    });
    it('should fail if findAll fails', async () => {
      mocks.db.erpObjects.find = jest.fn().mockRejectedValue({ success: false });
      const response = service.findAll('tenant', '');
      expect(response).rejects.toBeInstanceOf(UnprocessableEntityException);
    });
  });
  describe(`${ErpSalesReceiptsService.prototype.findOne.name}`, () => {
    it('should be successful', async () => {
      mocks.db.erpObjects.findOne = jest.fn().mockResolvedValue(Array.of(mockSalesReceipt));
      const response = service.findOne('tenant', 'externalId', 'domain');
      expect(response).resolves.toMatchObject(Array.of(mockSalesReceipt));
    });
    it('should fail if findOne fails', async () => {
      mocks.db.erpObjects.findOne = jest.fn().mockRejectedValue({ success: false });
      const response = service.findOne('tenant', 'externalId', 'domain');
      expect(response).rejects.toBeInstanceOf(UnprocessableEntityException);
    });
  });
  describe(`${ErpSalesReceiptsService.prototype.update.name}`, () => {
    it('should be successful', async () => {
      mocks.db.erpObjects.findOneAndUpdate = jest.fn().mockResolvedValue(mockSalesReceipt);
      const response = service.update('tenant', 'externalId', 'domain', mockSalesReceiptDto);
      expect(response).resolves.toMatchObject(mockSalesReceipt);
    });
    it('should fail if update fails', async () => {
      mocks.db.erpObjects.findOneAndUpdate = jest.fn().mockRejectedValue({ success: false });
      const response = service.update('tenant', 'externalId', 'domain', mockSalesReceiptDto);
      expect(response).rejects.toBeInstanceOf(UnprocessableEntityException);
    });
  });
  describe(`${ErpSalesReceiptsService.prototype.remove.name}`, () => {
    it('should be successful', async () => {
      mocks.db.erpObjects.findOneAndDelete = jest.fn().mockResolvedValue(mockSalesReceipt);
      const response = service.remove('tenant', 'externalId', 'domain');
      expect(response).resolves.toMatchObject(mockSalesReceipt);
    });
    it('should fail if update fails', async () => {
      mocks.db.erpObjects.findOneAndDelete = jest.fn().mockRejectedValue({ success: false });
      const response = service.remove('tenant', 'externalId', 'domain');
      expect(response).rejects.toBeInstanceOf(UnprocessableEntityException);
    });
  });
});