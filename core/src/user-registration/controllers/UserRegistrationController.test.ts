import { UserRegistrationDto, UserRegistrationResultDto } from "@blockspaces/shared/dtos/users";
import ApiResult from "@blockspaces/shared/models/ApiResult";
import { HttpException, HttpStatus } from "@nestjs/common";
import { createMock } from "ts-auto-mock";
import { UserRegistrationService } from "../services/UserRegistrationService";
import { UserRegistrationController } from "./UserRegistrationController";

describe(UserRegistrationController, () => {

  let controller: UserRegistrationController;

  let mocks: {
    registrationService: UserRegistrationService,
    formData: UserRegistrationDto
  };

  beforeEach(() => {
    mocks = {
      registrationService: createMock<UserRegistrationService>(),
      formData: createMock<UserRegistrationDto>()
    };

    controller = new UserRegistrationController(
      mocks.registrationService
    );
  });


  // ####################
  // # register()
  // ####################
  describe(UserRegistrationController.prototype.register, () => {

    it('should return a successful result if registration is successful', async () => {
      const registrationResult = createMock<UserRegistrationResultDto>({ success: true });
      mocks.registrationService.register = async () => registrationResult;

      const result = await controller.register(mocks.formData);
      expect(result.isSuccess);
      expect(result.data).toBe(registrationResult);
    });

    it('should throw an HTTP 403 (Forbidden), with result data, when registration fails', async () => {
      const registrationResult = createMock<UserRegistrationResultDto>({ success: false });
      let actualError: HttpException;

      mocks.registrationService.register = async () => registrationResult;

      await controller.register(mocks.formData).catch(err => actualError = err);

      expect(actualError).toBeInstanceOf(HttpException);
      expect(actualError.getStatus()).toBe(HttpStatus.FORBIDDEN);

      const apiResult = actualError.getResponse() as ApiResult;
      expect(apiResult.isFailure);
      expect(apiResult.data).toBe(registrationResult);
    });
  });
});