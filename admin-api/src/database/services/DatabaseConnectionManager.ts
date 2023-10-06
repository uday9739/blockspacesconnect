import { Inject } from "@nestjs/common";
import { ENV_TOKEN, EnvironmentVariables } from "src/env";

export class DatabaseConnectionManager {
  constructor(
    @Inject(ENV_TOKEN) private readonly env: EnvironmentVariables,
    private readonly databaseEnv: string,
  ) {

  }

  getConnectionString(): string {
    return this.env[this.databaseEnv].mongoConnectString;
  }

}