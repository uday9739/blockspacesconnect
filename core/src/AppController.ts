import { Controller, Get } from '@nestjs/common';
import ApiResult from "@blockspaces/shared/models/ApiResult";
import { AllowAnonymous } from './auth';

@Controller('/')
export class AppController {

  @Get()
  @AllowAnonymous()
  getAppHeartbeat() {
    return ApiResult.success("Server is live");
  }
}
