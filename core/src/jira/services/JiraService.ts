import { Inject, Injectable } from "@nestjs/common";
import { EnvironmentVariables, ENV_TOKEN } from "../../env";
import { ConnectLogger } from "../../logging/ConnectLogger";
import { DEFAULT_LOGGER_TOKEN } from "../../logging/constants";
import { Version3Client } from 'jira.js';

@Injectable()
export class JiraService {
  private readonly BLOCKSPACES_INTERNAL_SUPPORT_PROJECT_KEY = 'BSIS';
  private readonly client: Version3Client;
  constructor(@Inject(ENV_TOKEN) private readonly env: EnvironmentVariables, @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger) {

    logger.setModule(this.constructor.name);
    this.client = new Version3Client({
      host: env.jira.host,
      newErrorHandling: true,
      authentication: {
        basic: {
          email: env.jira.email,
          apiToken: env.jira.apiToken,
        },
      },
    });
  }



  /**
   * Creates a Jira issue in the BlockSpaces Internal Support Project, Key BSIS
   * @param summary 
   * @param description 
   * @returns Id of created issue
   */
  async createInternalIssue(summary: string, description: string): Promise<string> {
    const createdIssue = await this.client.issues.createIssue({
      fields: {
        summary: summary,
        issuetype: {
          name: this.env.isProduction ? 'Task' : 'Test'
        },
        description: description,
        project: {
          key: this.BLOCKSPACES_INTERNAL_SUPPORT_PROJECT_KEY,
        },
      }
    });
    return createdIssue.id;
  }
}

