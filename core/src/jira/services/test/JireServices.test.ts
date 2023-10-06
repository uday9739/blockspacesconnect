import { EnvironmentVariables } from "../../../env";
import { ConnectLogger } from "../../../logging/ConnectLogger";
import { JiraService } from "../JiraService";
import { Version3Client } from 'jira.js';
import { createMock } from "ts-auto-mock";


describe(`${JiraService.name}`, () => {

  let service: JiraService;

  let mockServices: {
    env: EnvironmentVariables,
    logger: ConnectLogger,
    client: Version3Client
  };

  beforeEach(() => {
    mockServices = {
      env: createMock<EnvironmentVariables>({
        // jira: {
        //   apiToken: "",
        //   email: "",
        //   host: ""
        // }
      }),
      logger: createMock<ConnectLogger>(),
      client: createMock<Version3Client>(),
    };

    service = new JiraService(mockServices.env, mockServices.logger);
  });

  describe(`${JiraService.prototype.createInternalIssue.name}`, () => {
    it(`should be defined`, async () => {
      expect(service.createInternalIssue).toBeDefined();
    });
  });

});