import { Inject, Injectable } from "@nestjs/common";
import { ConnectLogger } from "../../logging/ConnectLogger";
import mongoose from "mongoose";
import { EnvironmentVariables, ENV_TOKEN } from "../../env";
import { DEFAULT_LOGGER_TOKEN } from "../../logging/constants";
import { BscStatusResponse } from "../../legacy/types/BscStatusResponse";
import { ApiResultStatus } from "@blockspaces/shared/models/ApiResult";

@Injectable()
export class ConnectDbConnectionManager {
  connection: mongoose.Connection;
  initialized = false;

  constructor(
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger,
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables,
    private readonly db: typeof mongoose = mongoose
  ) {
    logger.setModule(this.constructor.name);
  }

  async init() {
    if (this.initialized) return;

    await this.connect();

    this.initialized = true;
    this.connection = this.db.connection;
    this.connection.on("error", this.handleError);
    this.connection.on("disconnected", this.handleDisconnect);
    this.connection.on("connected", this.handleConnected);

    this.logger.info("ConnectMongooseAdapter Connected to the database");
  };

  private async connect(): Promise<void> {
    try {
      await this.db.connect(this.env.database.mongoConnectString, {
        keepAlive: this.env.database.keepAlive,
        keepAliveInitialDelay: this.env.database.keepAliveInitialDelay,
        maxPoolSize: 10
      });
    } catch (err) {
      this.logger.error("ConnectMongooseAdapter connection unsuccessful, retry after 5 seconds.", err);
      return new Promise<void>((resolve) => {
        setTimeout(async () => {
          await this.connect();
          resolve();
        }, 5000);
      });
    }
  }

  private reset() {
    this.initialized = false;

    if (this.connection) {
      this.connection.off("error", this.handleError);
      this.connection.off("disconnected", this.handleDisconnect);
      this.connection.off("connected", this.handleConnected);
    }
  }

  shutdown = async () => {
    try {
      await this.connection.close();
      this.reset();
      this.logger.info("message: ConnectDBAdapter shutdown without errors.");
      return { status: "success", data: "ConnectDBAdapter shutdown without errors." };
    } catch (e: any) {
      return { status: "failed", data: e.message };
    }
  };

  handleError = async (error: any) => {
    this.logger.error(`message: ConnectDBAdapter ${error.message}`, error);
    return { status: "failed", data: error.message };
  };

  handleDisconnect = async (error: any) => {
    this.logger.error("message: ConnectDBAdapter disconnected", error);
    this.initialized = false;
    await this.connect();
  };

  handleConnected = async (e: any) => {
    this.logger.info("message: ConnectDBAdapter connected", e);
  };

  getConnectionStatus = async (): Promise<BscStatusResponse> => {
    if (this.db.connection.readyState === 1) {
      return { status: ApiResultStatus.Success, data: "" };
    } else {
      return { status: ApiResultStatus.Failed, data: "" };
    }
  };
}
