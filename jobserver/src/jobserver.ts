import express from "express";
import JobService from "./Job.service";
import {logger} from "@blockspaces/shared/loggers/bscLogger";
import {env} from "./env";

(async function () {
  const app = express();
  const port = env.jobService.port;
  app.use(express.json());
  const jobService = await JobService.newJobService();

  app.post("/job", (req, res) => {
    logger.debug(`started POST /job ${JSON.stringify(req.body)}`, {module: "jobserver.ts"});
    (async function () {
      if (req.body.blockFlowId && req.body.initialData && req.body.configuration) {
        const blockFlowId = req.body.flowId;
        const initialData = req.body.initialData;
        const configuration = req.body.configuration;
        const response = await jobService.newFlowJob(blockFlowId, {data: initialData}, configuration);
        res.status(200).send({status: "success", data: {jobId: response.data}});
      } else {
        res.status(500).send({status: "error", data: "Insufficient parameters provided."});
      }
    })();
  });

  app.delete("/job/:jobId", (req, res) => {
    logger.debug(`started DELETE /job:jobId ${req.params.jobId}`, {module: "jobserver.ts"});
    (async function () {
      if (req.params.jobId) {
        const response = await jobService.cancelFlowJob(req.params.jobId);
        if (response.status === "success") {
          res.status(200).send({status: "success", data: response.data});
        } else {
          res.status(500).send({status: "error", data: response.data});
        }
      } else {
        res.status(500).send({status: "error", data: "Insufficient parameters provided."});
      }
    })();
  });

  app.listen(port, () => {
    console.log(`The Job Server is listening on port ${port}!`);
  });
})();
