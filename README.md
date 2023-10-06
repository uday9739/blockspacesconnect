# BlockSpaces Connect

BlockSpaces Connect - the Blockchain Integration Platform as a Service

## Production environment can revert back to previous version
The following are the docker image revert/update commands for the production environment:
kubectl --context arn:aws:eks:us-east-1:278428321638:cluster/blockspaces-connect-production set image deployment/bsc-frontend-production bsc-frontend-production=blockspacesteam/bsc-frontend:${DOCKER_TAG}-production -n bsc-production
kubectl --context arn:aws:eks:us-east-1:278428321638:cluster/blockspaces-connect-production set image deployment/bsc-core-production bsc-core-production=blockspacesteam/bsc-core:${DOCKER_TAG}-production -n bsc-production
Please replace the ${DOCKER_TAG} with the actual version you want to update/revert.

## Setting up a development environment

_See [Confluence](<https://blockspaces.atlassian.net/wiki/spaces/BSC/pages/232685569/Local+Dev+Environment+Setup>) for detailed instructions_

---

## Starting the Connect App (command line)

1. Make sure that the MongoDB (bsc-mongo) and nginx reverse proxy (bsc-rproxy) Docker containers are running
1. Open a new command line (i.e. VS Code terminal) to the local repo root directory
1. cd to `ui-backend`
1. run `npm start`
1. Open a new command line to the local repo root directory
1. cd to `frontend/connect-ui`
1. run `npm run dev`
1. You should be able to access the frontend app via <https://localhost>
    * **Note**: you may get a certificate/security warning. If you do, accept the "unsafe" cert to continue

---

## Starting the Connect App (using VS Code tasks)

1. Use [this documentation](<https://blockspaces.atlassian.net/wiki/spaces/BSC/pages/233242627/Visual+Studio+Code+Tasks>) to setup the tasks for running the frontend and ui-backend apps
1. From the VS Code menu bar, select `Terminal` > `Run Task...`
1. Select the task to run the frontend
    * The ui-backend application will be started automatically
1. You should be able to access the frontend app via <https://localhost>
    * **Note**: you may get a certificate/security warning. If you do, accept the "unsafe" cert to continue

---

## Running the backend services (gRPC)

1. Make sure the MongoDB container (bsc-mongo) is running
1. cd to the `backend` directory
1. Start the backend server by running `npm start`

---

## Reloading base/sample data

1. Open a command line to the root of your local repo
1. Run `npm run bsc:postbuild`
