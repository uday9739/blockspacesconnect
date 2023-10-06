import { InitialLoginResultDto } from '@blockspaces/shared/dtos/authentication/initial-login';
import { IUser, TwoFactorSetupStatus } from '@blockspaces/shared/models/users';
import { AuthFailureReason } from '@blockspaces/shared/types/authentication';
import { Inject, Injectable } from '@nestjs/common';
import { DEFAULT_LOGGER_TOKEN } from '../../logging/constants';
import { GetJwtResult, JwtService } from './JwtService';
import { ConnectLogger } from "../../logging/ConnectLogger";
import { UserDataService } from '../../users/services/UserDataService';
import { DateTime } from 'luxon';
import { EnvironmentVariables, ENV_TOKEN } from '../../env';

@Injectable()
export class LoginService {

  constructor(
    private readonly jwtService: JwtService,
    private readonly userDataService: UserDataService,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger,
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables
  ) {
    logger.setModule(this.constructor.name);
  }

  /**
   * Perform the initial login process, validating a user's email address and password,
   * and determining whether they are able to proceed with 2-factor authentication
   *
   * A user is not considered fully authenticated after the initial login process completes successfully.
   * Users must complete 2-factor authentication before they will be fully authenticated.
   */
  async doInitialLogin(email: string, password: string): Promise<InitialLoginResult> {

    if (!email || !password) {
      return { success: false, failureReason: AuthFailureReason.INVALID_CREDENTIALS };
    }

    const user: IUser = await this.userDataService.findByEmail(email);

    if (!user || user.registered === false) {
      return { success: false, failureReason: AuthFailureReason.NOT_REGISTERED };
    }


    if (this.env.appId.enableEmailConfirmation === false) {
      const userEmailVerificationExpiryDate = DateTime.fromJSDate(new Date(user.createdAt)).plus({ days: 2 }).toMillis();
      const today = DateTime.now().toMillis();
      if (user.emailVerified === false && (userEmailVerificationExpiryDate < today)) {
        return { success: false, failureReason: AuthFailureReason.EMAIL_NOT_VERIFIED };
      }
    }


    const jwtResult = await this.jwtService.getJwt(email, password);

    const result = <InitialLoginResult>{
      jwtResult,
      success: jwtResult.success,
      failureReason: jwtResult.failureReason,
      dto: new InitialLoginResultDto({ email, failureReason: jwtResult.failureReason })
    };

    if (jwtResult.success) {
      result.dto.userId = jwtResult.payload.sub;
      result.dto.twoFactorSetupComplete = jwtResult.payload.twofastatus === TwoFactorSetupStatus.Confirmed;
    }

    return result;
  }

  async doTwoFactorLogin() {
    // TODO implement me!
    throw new Error('Method not implemented.');
  }

  private logError(errorMessage: string, ...args: any[]) {
    this.logger.error(errorMessage, null, args);
  }
}

export interface InitialLoginResult {
  success: boolean;

  failureReason?: AuthFailureReason;

  /** data that will be returned to frontend */
  dto?: InitialLoginResultDto;

  /** the results of retrieving a JWT access token */
  jwtResult?: GetJwtResult;
}
