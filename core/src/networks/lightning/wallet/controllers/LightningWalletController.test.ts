import ApiResult, { ApiResultStatus, ApiResultWithError, AsyncApiResult } from "@blockspaces/shared/models/ApiResult";
import { createMock } from "ts-auto-mock";
import { LightningWalletService } from "../services/LightningWalletService";
import { LightningWalletController } from "./LightningWalletController";
import WalletTestObject from "./LightningWallet.test.json";
import { IUser } from "@blockspaces/shared/models/users";
import { HttpException, HttpStatus } from "@nestjs/common";

describe(LightningWalletController, () => {
  jest.resetAllMocks();
  let walletController: LightningWalletController;
  let mockedWalletService: LightningWalletService;
  let user: IUser;

  beforeEach(() => {
    user = createMock<IUser>();
    mockedWalletService = createMock<LightningWalletService>();
    walletController = new LightningWalletController(mockedWalletService);
  });

  describe(LightningWalletController.prototype.getNewAddress, () => {
    it("should get a new address for bitcoin", async () => {
      mockedWalletService.getNewAddress = jest.fn().mockResolvedValue(WalletTestObject.getNewAddress);
      const response: ApiResult = await walletController.getNewAddress(user, { type: "WITNESS_PUBKEY_HASH", account: "" });
      expect(response.status).toBe(ApiResultStatus.Success);
      expect(response.data).toMatchObject(WalletTestObject.getNewAddress);
    });

    it("should throw error getting new address with wrong type", async () => {
      mockedWalletService.getNewAddress = jest.fn().mockResolvedValue(null);
      let actualError: HttpException
      await walletController.getNewAddress(user, { type: "BAD_ADDRESS_TYPE", account: "" }).catch(err => actualError = err);
      expect(actualError).toBeInstanceOf(HttpException)
      expect(actualError.getStatus()).toBe(HttpStatus.NOT_FOUND)

      const apiResult = actualError.getResponse() as ApiResult
      expect(apiResult.isFailure)
      expect(apiResult.message).toBe("Could not retrieve a new bitcoin deposit address.")
    });
  });
});
