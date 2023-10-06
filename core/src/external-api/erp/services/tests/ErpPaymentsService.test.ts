import { ErpPaymentDto } from "@blockspaces/shared/dtos/erp-data";
import { ErpObject } from "@blockspaces/shared/models/erp-integration/ErpObjects";
import { BadRequestException, UnprocessableEntityException } from "@nestjs/common";
import { createMock } from "ts-auto-mock";
import { ConnectDbDataContext } from "../../../../connect-db/services/ConnectDbDataContext";
import { ConnectLogger } from "../../../../logging/ConnectLogger";
import { ErpPaymentsService } from "../ErpPaymentsService";

describe(`${ErpPaymentsService.name}`, () => {
  let service: ErpPaymentsService;
  let mocks: {
    db: ConnectDbDataContext,
    logger: ConnectLogger
  };

  const mockPayment = createMock<ErpObject>();
  const mockPaymentDto = createMock<ErpPaymentDto>();
  beforeEach(() => {
    mocks = {
      db: createMock<ConnectDbDataContext>(),
      logger: createMock<ConnectLogger>()
    };
    service = new ErpPaymentsService(mocks.db, mocks.logger);
  });

  describe(`${ErpPaymentsService.prototype.create.name}`, () => {
    it('should be successful', async () => {
      mocks.db.erpObjects.create = jest.fn().mockResolvedValue(mockPayment);
      const response = service.create(mockPaymentDto, 'ten');
      expect(response).resolves.toMatchObject(mockPayment);
    });
    it('should fail if create finds duplicate', async () => {
      mocks.db.erpObjects.create = jest.fn().mockRejectedValue({ name: "MongoServerError", code: 11000 });
      const response = service.create(mockPaymentDto, 'ten');
      expect(response).rejects.toBeInstanceOf(UnprocessableEntityException);
    });
    it('should fail if create fails', async () => {
      mocks.db.erpObjects.create = jest.fn().mockRejectedValue({ success: false });
      const response = service.create(mockPaymentDto, 'ten');
      expect(response).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe(`${ErpPaymentsService.prototype.findAll.name}`, () => {
    it('should be successful', async () => {
      mocks.db.erpObjects.find = jest.fn().mockResolvedValue(Array.of(mockPayment));
      const response = service.findAll('tenant', '');
      expect(response).resolves.toMatchObject(Array.of(mockPayment));
    });
    it('should fail if findAll fails', async () => {
      mocks.db.erpObjects.find = jest.fn().mockRejectedValue({ success: false });
      const response = service.findAll('tenant', '');
      expect(response).rejects.toBeInstanceOf(UnprocessableEntityException);
    });
  });
  describe(`${ErpPaymentsService.prototype.findOne.name}`, () => {
    it('should be successful', async () => {
      mocks.db.erpObjects.findOne = jest.fn().mockResolvedValue(Array.of(mockPayment));
      const response = service.findOne('tenant', 'externalId', 'domain');
      expect(response).resolves.toMatchObject(Array.of(mockPayment));
    });
    it('should fail if findOne fails', async () => {
      mocks.db.erpObjects.findOne = jest.fn().mockRejectedValue({ success: false });
      const response = service.findOne('tenant', 'externalId', 'domain');
      expect(response).rejects.toBeInstanceOf(UnprocessableEntityException);
    });
  });
  describe(`${ErpPaymentsService.prototype.update.name}`, () => {
    it('should be successful', async () => {
      mocks.db.erpObjects.findOneAndUpdate = jest.fn().mockResolvedValue(mockPayment);
      const response = service.update('tenant', 'externalId', 'domain', mockPaymentDto);
      expect(response).resolves.toMatchObject(mockPayment);
    });
    it('should fail if update fails', async () => {
      mocks.db.erpObjects.findOneAndUpdate = jest.fn().mockRejectedValue({ success: false });
      const response = service.update('tenant', 'externalId', 'domain', mockPaymentDto);
      expect(response).rejects.toBeInstanceOf(UnprocessableEntityException);
    });
  });
  describe(`${ErpPaymentsService.prototype.remove.name}`, () => {
    it('should be successful', async () => {
      mocks.db.erpObjects.findOneAndDelete = jest.fn().mockResolvedValue(mockPayment);
      const response = service.remove('tenant', 'externalId', 'domain');
      expect(response).resolves.toMatchObject(mockPayment);
    });
    it('should fail if update fails', async () => {
      mocks.db.erpObjects.findOneAndDelete = jest.fn().mockRejectedValue({ success: false });
      const response = service.remove('tenant', 'externalId', 'domain');
      expect(response).rejects.toBeInstanceOf(UnprocessableEntityException);
    });
  });
});