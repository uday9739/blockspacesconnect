/*
Merge Development (jenkins-dev) to Staging (jenkins-test) with a FF.
If the major version number in package.json matches the major version number deployed to Staging (Sandbox)

 */

import git from "simple-git"
import axios from "axios"
import semver from "semver"
import yargs from "yargs";
import {exec, spawn} from "child_process"
import path from 'path';
import {hideBin} from "yargs/helpers";
import * as scriptUtils from "./scriptUtils";

const {__dirname} = scriptUtils.getModulePaths(import.meta.url);
const PROJECT_BASE_DIR = path.resolve(__dirname, "../");

/** execute main script */
releaseToStaging();

/** wrap spawn into a promise */
function incrementPackageDotJsonVersion(releaseType: string, path: string, newVersion?: string): Promise<string | number | null | Error> {
  if(!newVersion) {
    return new Promise(function (resolve, reject) {
      const process = spawn(`npm`, ["version", "--no-git-tag-version", releaseType], {cwd: path});
      process.stdout.on('data', function (data) {
        resolve(data);
      });
      process.on('error', function (err) {
        reject(err);
      });
    });
  } else if(releaseType && path && newVersion) {
    return new Promise(function (resolve, reject) {
      const process = spawn(`npm`, ["version", newVersion], {cwd: path});
      process.stdout.on('data', function (data) {
        resolve(data);
      });
      process.on('error', function (err) {
        reject(err);
      });
    });
  }
}

async function releaseToStaging(): Promise<void> {

  let platformStatus:any = {}
  const argv: any = yargs(hideBin(process.argv)).argv;
  try {
    platformStatus = await axios.get("https://staging.np.blockspaces.com/api/platform/status/detailed", {timeout: 5000});
  } catch (err){
    console.log(`https://staging.np.blockspaces.com is unreachable. Are you connected to the VPN?`)
    return
  }
  let originDevelopmentHash = await git().revparse("origin/development");
  let developmentHash = await git().revparse("development");

  if (!argv.releaseType || !(argv.releaseType === 'minor' || argv.releaseType === 'major')) {
    console.log(`Parameter missing. You must pass --releaseType minor or --releaseType major`)
    return
  } else if (originDevelopmentHash !== developmentHash) {
    console.log(`development and origin/development are not pointing to the same commit. Please pull or merge changes as needed.`)
    return
  } else {

    let releaseType = argv.releaseType;
    console.log(`Initiating ${releaseType} release to staging`);

    let deployedStagingVersion = platformStatus["data"]["data"]["version"];
    let newVersion = semver.inc(deployedStagingVersion, releaseType);

    let gitActiveBranch = await git().revparse(['--abbrev-ref','HEAD'])
    if (!(gitActiveBranch === 'development')) {
      console.log(`Your active branch is ${gitActiveBranch}, you have to switch to development branch.`)
      return
    }

    let gitStatus = await git().status()
    let isClean = gitStatus.isClean()
    console.log(isClean)
    if (false === isClean) {
      console.log(`Your development branch is not clean. Please commit your changes to origin/development.`)
      return
    }


    if (semver.gte(newVersion, deployedStagingVersion)) {
      console.log(`Update ${releaseType} Version: ${deployedStagingVersion} => ${newVersion} `);
      // update the version in the package.json files
      let version1 = await incrementPackageDotJsonVersion(releaseType,PROJECT_BASE_DIR, newVersion);
      let version2 = await incrementPackageDotJsonVersion(releaseType,`${PROJECT_BASE_DIR}/core`,newVersion);
      let version3 = await incrementPackageDotJsonVersion(releaseType,`${PROJECT_BASE_DIR}/shared`,newVersion);
      let version4 = await incrementPackageDotJsonVersion(releaseType,`${PROJECT_BASE_DIR}/frontend/connect-ui`,newVersion);

      // Commit and push changes to development
      await git().checkout('development').add('.').commit(`Updated release ${releaseType} version to ${newVersion} in package.json`).push('origin', 'development')
      let newDevelopmentHash = await git().revparse("development");

      // Set staging to development commit, development and staging hash need to match
      await git().branch(['-f', 'staging', newDevelopmentHash]).push(['origin', 'staging'])

      // Tag the release
      await git().tag(["-a", newVersion, newDevelopmentHash, "-m", `${releaseType} ${newVersion} revision`]).pushTags('origin')
    } else {
      console.log(`Release halted. The version in staging ${deployedStagingVersion} is newer than your propose release candidate.`)
    }
  }
}
