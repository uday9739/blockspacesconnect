import Agenda, {Job} from "agenda";
import {env} from "./env";
import {v4 as uuidv4} from "uuid";
import EngineClient from "./engineClient.service";
import {BscStatusReponse} from "./helpers/bscTypes";

class JobService {
  agenda: Agenda;
  client: EngineClient;
  private constructor(_agenda: Agenda, _client: EngineClient) {
    this.agenda = _agenda;
    this.client = _client;
  }
  public static newJobService = async (): Promise<JobService> => {
    const _client = await EngineClient.newEngineClient();
    const _agenda = new Agenda({
      db: {address: env.jobService.agendaDbConnectString, collection: "jobs"},
      processEvery: env.jobService.agendaProcessInterval,
    });
    await _agenda.start();
    return new JobService(_agenda, _client);
  };
  newFlowJob = async (blockFlowId: string, initialData: object, configuration: any): Promise<BscStatusReponse> => {
    const jobName = uuidv4();
    // TODO add error handling
    await this.agenda.define(jobName, async () => {
      await this.client.executeFlowJob(blockFlowId, initialData);
    });
    if (configuration.interval) {
      await this.agenda.every(configuration.interval, jobName);
    } else if (configuration.when) {
      await this.agenda.schedule(configuration.when, jobName, {});
    }
    return {status: "success", data: jobName};
  };
  cancelFlowJob = async (blockFlowId: string): Promise<BscStatusReponse> => {
    const numRemoved = await this.agenda.cancel({ name: blockFlowId});
    if (numRemoved !== 1) {
      return {status: "error", data: `Error removing ${blockFlowId} from jobs database`};
    }
    return {status: "success", data: `Removed ${blockFlowId} from jobs database`};
  };
}

export default JobService;
