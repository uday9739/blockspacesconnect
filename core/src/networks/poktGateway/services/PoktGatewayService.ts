import crypto from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import { ConnectLogger } from "../../../logging/ConnectLogger";
import { HttpService, HttpRequestConfig } from "@blockspaces/shared/services/http";
import { EnvironmentVariables, ENV_TOKEN } from "../../../env";
import { DEFAULT_LOGGER_TOKEN } from "../../../logging/constants";
import { HttpStatus } from "@blockspaces/shared/types/http";
import { AuthenticateUserAccountResult, CreateApplicationResult, CreateUserAccountResult, GatewaySettings, PoktGatewayApplicationResponse, UpdateApplicationResult } from "../models";
import { GatewaySource } from "@blockspaces/shared/models/poktGateway";
/**
 * This class is used to communicate with POKT Gateway.
 */
@Injectable()
export default class GatewayProxyService {
  private readonly poktSource: GatewaySource = GatewaySource.POKT;
  private _poktGatewayApiBaseUri;
  constructor(
    private readonly httpService: HttpService,
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger
  ) {
    logger.setModule(this.constructor.name);
    this._poktGatewayApiBaseUri = env.poktGateway.poktGatewayApiBaseUrl;
  }

  public get Source(): GatewaySource {
    return this.poktSource;
  }

  /**
   * This method calls POKT Gateway `/api/users/signup` endpoint. returns true if successful
   */
  async CreateUserAccount(credentials: GatewayUserCredentials): Promise<CreateUserAccountResult> {
    if (credentials.isValid() === false) return AuthenticateUserAccountResult.failure("invalid credentials");
    const email = credentials.GetUserEmail();
    const createUserRequestConfig = this._getHttpRequestConfigHelper("POST", "/users/signup", { email, password: credentials.password }, null, [HttpStatus.BAD_REQUEST]);
    const response = await this.httpService.request(createUserRequestConfig);

    if (response.status === HttpStatus.BAD_REQUEST) {
      const msg = response.data?.errors?.length > 0 ? response.data.errors[0]?.message : "The email address already exist.";
      return CreateUserAccountResult.failure(msg);
    }
    return CreateUserAccountResult.success({ source: this.poktSource });
  }

  /**
   * This method calls POKT Gateway `/api/users/login` endpoint.
   * Returns successful if user email has been verified.
   */
  async AuthenticateUserAccount(credentials: GatewayUserCredentials): Promise<AuthenticateUserAccountResult> {
    if (credentials.isValid() === false) return AuthenticateUserAccountResult.failure("invalid credentials");
    const email = credentials.GetUserEmail();
    const userLoginRequestConfig = this._getHttpRequestConfigHelper("POST", "/users/login", { email, password: credentials.password }, null, [HttpStatus.BAD_REQUEST]);
    const response = await this.httpService.request(userLoginRequestConfig);

    if (response.status === HttpStatus.BAD_REQUEST) {
      const msg = response.data?.errors?.length > 0 ? response.data?.errors[0]?.message : "Error authenticating user";
      return AuthenticateUserAccountResult.failure(msg);
    }

    return AuthenticateUserAccountResult.success(response.data);
  }

  /**
   * This method calls POKT Gateway `/api/lb` as a POST
   */
  async CreateApplication(credentials: GatewayUserCredentials, name: string, gatewaySettings?: GatewaySettings): Promise<CreateApplicationResult> {
    const authResponse = await this.AuthenticateUserAccount(credentials);
    if (authResponse.isFailure || !authResponse.data?.token) {
      const msg = authResponse.message || authResponse.error || "Error authenticating user";
      return CreateApplicationResult.failure(msg);
    }

    const createAppRequestConfig = this._getHttpRequestConfigHelper("POST", "/lb", { name, gatewaySettings }, authResponse.data.token);
    const response = await this.httpService.request<PoktGatewayApplicationResponse>(createAppRequestConfig);

    return CreateApplicationResult.success(response.data);
  }
  /**
   * This method calls POKT Gateway `/api/lb` as a PUT
   */
  async UpdateApplication(credentials: GatewayUserCredentials, gatewaySettings: GatewaySettings): Promise<UpdateApplicationResult> {
    const authResponse = await this.AuthenticateUserAccount(credentials);
    if (authResponse.isFailure || !authResponse.data?.token) {
      const msg = authResponse.message || authResponse.error || "Error authenticating user";
      return UpdateApplicationResult.failure(msg);
    }

    const updateAppRequestConfig = this._getHttpRequestConfigHelper("PUT", "/lb", { gatewaySettings }, authResponse.data.token);
    await this.httpService.request(updateAppRequestConfig);
    return CreateApplicationResult.success(true);
  }

  // #region Helper Methods

  private _getHttpRequestConfigHelper(method: "GET" | "POST" | "PUT", path: string, data: any, token?: string, validErrorStatuses?: Array<number>): HttpRequestConfig {
    const requestConfig: HttpRequestConfig = {
      baseURL: `${this._poktGatewayApiBaseUri}${path}`,
      method: method,
      validErrorStatuses: validErrorStatuses,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    };

    if (data) {
      requestConfig.data = data;
    }
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }

    return requestConfig;
  }
  // #endregion
}

export class GatewayUserCredentials {
  private IS_DEBUG: boolean = false;
  public username: string;
  private _password: string = null;
  get password(): string {
    return this._password;
  }
  set password(value: string) {
    this._password = this.GenerateSaltedPassword(value);
  }

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }

  public GetUserEmail(): string {
    if (this.IS_DEBUG) {
      return `randy+${this.username}_2@blockspaces.com`;
    } else {
      return `devconnect+${this.username}@blockspaces.com`;
    }
  }

  public isValid(): boolean {
    return this._checkIfValidPassword(this.password);
  }

  private _checkIfValidPassword(str): boolean {
    if (this.IS_DEBUG) {
      return true;
    } else {
      const regexExp = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/;
      return regexExp.test(str);
    }
  }

  private GenerateSaltedPassword(str: string): string {
    if (this.IS_DEBUG) {
      return "p$&7@X4e1hWc";
    } else {
      return crypto.createHash("sha1").update(str).digest("base64");
    }
  }
}
