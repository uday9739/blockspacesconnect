import { createMock } from "ts-auto-mock";
import { ConnectDbDataContext } from "../../../../connect-db/services/ConnectDbDataContext";
import { LightningNodeReference } from "@blockspaces/shared/models/lightning/Node";
import { NewAddressDto, WalletBalanceResponse } from "@blockspaces/shared/dtos/lightning";
import { LightningWalletService } from "./LightningWalletService";
import { Logger } from 'log4js';
import { LightningHttpService } from "../../lnd/services/LightningHttpService";
import WalletTestObject from "../controllers/LightningWallet.test.json";
import { ConnectLogger } from "../../../../logging/ConnectLogger";


describe(LightningWalletService, () => { 
  let walletService: LightningWalletService;

  let mocks: {
    logger: ConnectLogger;
    nodes: ConnectDbDataContext;
    http: LightningHttpService;
  };

  beforeEach(() => {
    mocks = {
      http: createMock<LightningHttpService>(),
      nodes: createMock<ConnectDbDataContext>(),
      logger: createMock<ConnectLogger>({
        // Make the logging quite for testing
        // info:jest.fn(),
        // debug:jest.fn(),
        // error:jest.fn(),
        // trace:jest.fn(),
        // log:jest.fn(),
      })
    };

    walletService = new LightningWalletService(mocks.logger, mocks.nodes, mocks.http);
  });

  /**
   * getNewAddress()
   */
  describe(LightningWalletService.prototype.getNewAddress, () => {
    it("should return throw error when node does not exist", async () => {
      mocks.nodes.lightningNodes.findOne = jest.fn().mockResolvedValue(null);
      const dto = createMock<NewAddressDto>();
      const response = await walletService.getNewAddress(dto, 'tenant-id');
      expect(response).toBe(null);
    });
    it("should return throw error status is error", async () => {
      mocks.nodes.lightningNodes.findOne = jest.fn().mockResolvedValue(createMock<LightningNodeReference>());
      const dto = createMock<NewAddressDto>();
      mocks.http.get = jest.fn().mockResolvedValue({status: 400, data: ''});
      const response = await walletService.getNewAddress(dto, 'tenant-id');
      expect(response).toBe(null);
    });
    it("should return an address when http call succeeds", async () => {
      const res = WalletTestObject.getNewAddress;
      mocks.http.get = jest.fn().mockResolvedValue(res);
      mocks.nodes.lightningNodes.findOne = jest.fn().mockResolvedValue(createMock<LightningNodeReference>());
      const dto = createMock<NewAddressDto>();
      const response = await walletService.getNewAddress(dto, 'tenant-id');
      expect(response).toBe(res.data);
    });
  });
  /**
   * getWalletBalance()
   */
  describe(LightningWalletService.prototype.getWalletBalance, () => {
    it("should throw an error when node doesn't exist", async () => {
      mocks.nodes.lightningNodes.findOne = jest.fn().mockResolvedValue(null)
      const response = await walletService.getWalletBalance('tenant-id')
      expect(response).toBe(null)
    })
    it("should return null when status is error", async () => {
      mocks.nodes.lightningNodes.findOne = jest.fn().mockResolvedValue(createMock<LightningNodeReference>())
      mocks.http.get = jest.fn().mockResolvedValue({status: 400, data: ''})
      const response = await walletService.getWalletBalance('tenant-id')
      expect(response).toBe(null)
    })
    it("should return wallet balance", async () => {
      mocks.nodes.lightningNodes.findOne = jest.fn().mockResolvedValue(createMock<LightningNodeReference>())
      const walletResponse = createMock<WalletBalanceResponse>()
      mocks.http.get = jest.fn().mockResolvedValue({status: 200, data: walletResponse})
      const response = await walletService.getWalletBalance('tenant-id')
      expect(response).toBe(walletResponse)
    })
  })
});