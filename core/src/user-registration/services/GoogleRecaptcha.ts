
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { ValidationException } from "../../exceptions/common";
import { EnvironmentVariables, ENV_TOKEN } from "../../env";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { DEFAULT_LOGGER_TOKEN } from "../../logging/constants";
import { HttpResponse, HttpService } from "@blockspaces/shared/services/http";


interface RecaptchaResult {
  name: string;
  riskAnalysis?: {
    score?: number;
  },
  tokenProperties: {
    valid?: (boolean | null);
    invalidReason?: string;
    action?: string
  }
}
enum ReasonCodes {
  AUTOMATION = 'AUTOMATION',
  UNEXPECTED_ENVIRONMENT = 'UNEXPECTED_ENVIRONMENT',
  TOO_MUCH_TRAFFIC = 'TOO_MUCH_TRAFFIC',
  UNEXPECTED_USAGE_PATTERNS = 'UNEXPECTED_USAGE_PATTERNS',
  LOW_CONFIDENCE_SCORE = 'LOW_CONFIDENCE_SCORE'
}


@Injectable()
export class GoogleRecaptcha {
  constructor(private readonly httpService: HttpService, @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger) {


  }


  async ValidateRecaptcha(token: string): Promise<number> {
    const projectPath = "blockspaces-com--1678469479093";
    const recaptchaAction = 'LOGIN';

    const { data: response } = await this.httpService.request<RecaptchaResult>({
      baseURL: `https://recaptchaenterprise.googleapis.com/v1/projects/${projectPath}/assessments?key=${this.env.google.recaptchaSiteApiKey}`,
      method: "post",
      data: {
        "event": {
          "token": token,
          "siteKey": this.env.google.recaptchaSiteKey,
          "expectedAction": recaptchaAction
        }
      },
    });

    if (!response.tokenProperties.valid) {
      throw new ValidationException(response.tokenProperties.invalidReason);
    }

    if (response.tokenProperties.action === recaptchaAction) {
      //https://cloud.google.com/recaptcha-enterprise/docs/interpret-assessment

      if (response.riskAnalysis.score <= 0.2) {
        this.logger.error("recaptcha failed", new BadRequestException(response));
        throw new ValidationException("Unable to Login");
      }
      return response.riskAnalysis.score;
    } else {
      throw new ValidationException("Invalid reCAPTCHA tag");
    }
  }

}