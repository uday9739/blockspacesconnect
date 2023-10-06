import { createMock } from "ts-auto-mock";
import { ConnectDbDataContext } from "../../../../connect-db/services/ConnectDbDataContext";
import { ConnectLogger } from "../../../../logging/ConnectLogger";
import { ErpPurchasesService } from "../ErpPurchasesService";
import { ErpObject } from "@blockspaces/shared/models/erp-integration/ErpObjects";
import { ErpPurchaseDto } from "@blockspaces/shared/dtos/erp-data";
import { BadRequestException, UnprocessableEntityException } from "@nestjs/common";

describe(`${ErpPurchasesService.name}`, () => {
  let purchaseService: ErpPurchasesService;
  let mocks: {
    db: ConnectDbDataContext,
    logger: ConnectLogger
  }

  const mockPurchase = createMock<ErpObject>();
  const mockPurchaseDto = createMock<ErpPurchaseDto>();

  beforeEach(() => {
    mocks = {
      db: createMock<ConnectDbDataContext>(),
      logger: createMock<ConnectLogger>()
    }

    purchaseService = new ErpPurchasesService(mocks.db, mocks.logger);
  })

  describe(`${ErpPurchasesService.prototype.create.name}`, () => {
    it (`should be successful`, async () => {
      mocks.db.erpObjects.create = jest.fn().mockResolvedValue(mockPurchase);
      const response = await purchaseService.create(mockPurchaseDto, 'ten');
      expect(response).toMatchObject(mockPurchase);
    })

    it(`should fail if create finds duplicate`, async () => {
      mocks.db.erpObjects.create = jest.fn().mockRejectedValue({ name: "MongoServerError", code: 11000 });
      const response = purchaseService.create(mockPurchaseDto, 'ten');
      expect(response).rejects.toBeInstanceOf(UnprocessableEntityException);
    })

    it(`should fail if create fails`, async () => {
      mocks.db.erpObjects.create = jest.fn().mockRejectedValue({ success: false });
      const response = purchaseService.create(mockPurchaseDto, 'ten');
      expect(response).rejects.toBeInstanceOf(BadRequestException);
    })
  })
})