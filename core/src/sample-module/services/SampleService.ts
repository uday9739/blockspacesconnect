import { Inject, Injectable } from "@nestjs/common";
import { BadRequestException, ValidationException, NotFoundException } from "../../exceptions/common";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { DEFAULT_LOGGER_TOKEN } from "../../logging/constants";


@Injectable()
export class SampleService {
  /**
   *
   */
  constructor(@Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger) {
    logger.setModule(SampleService.name);
  }



  testBadRequest() {
    this.logger.warn("testing warn() from SampleService");
    throw new BadRequestException("testing BadRequestException");
  }

  testBadRequestWithData() {
    throw new BadRequestException({ someObj: { id: 123 } }, "testing testBadRequestWithData");
  }


  testBadRequestWithError() {
    try {
      throw new Error("some unhanded error");
    } catch (error) {
      throw new BadRequestException("testBadRequestWithError", { cause: error });
    }
  }

  testNotFound() {
    throw new NotFoundException("testing NotFoundException");
  }

  testValidation() {
    // some log
    throw new ValidationException("testing ValidationException");
  }

  testGenericError() {
    throw new Error("testing testGenericError");
  }

  testNullReff(obj: any) {
    const nullReff = obj.something;

  }

}




