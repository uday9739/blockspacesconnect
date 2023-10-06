/*  The purpose of this script is to ensure a smooth release from Development to Staging.
    Prior to running the script perform the following steps.
    1. Merge all feature branches intended for release into the Development branch.
    2. Merge all hotfix branches applied to Staging back onto the Development branch.
*/
import git from "simple-git"
import axios from "axios"
import SemVer from "semver"
import yargs from "yargs";
import {spawn} from "child_process"
import path from 'path';
import {fileURLToPath} from 'url';
import {hideBin} from "yargs/helpers";

const DEVELOPMENT_LOCAL_BRANCH = "development";
const DEVELOPMENT_REMOTE_BRANCH = "origin/development";
const STAGING_LOCAL_BRANCH = "staging";
const STAGING_REMOTE_BRANCH = "origin/staging";
const STAGING_DOMAIN_NAME = "staging.blockspaces.dev";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_BASE_DIR = path.resolve(__dirname, "../");

main();

/** execute main script */
async function main(): Promise<void> {

  const argv: any = yargs(hideBin(process.argv)).argv;

  if (!argv.releaseType || !(argv.releaseType === 'minor' || argv.releaseType === 'major')) {
    console.log("Release aborted!!!")
    console.log(`Parameter missing. You must pass --releaseType minor or --releaseType major`)
    return
  }

  console.log(`Starting ${argv.releaseType} to Staging`)
  await git().fetch(['--all'])
  await git().checkout(DEVELOPMENT_LOCAL_BRANCH)

  //Check for any modifications that have not been committed
  let gitStatus = await git().status()
  let modifications = gitStatus["modified"].length;
  console.log(`Check for any local modifications to ${DEVELOPMENT_LOCAL_BRANCH}`)
  console.log(`Modifications to ${DEVELOPMENT_LOCAL_BRANCH} status: `,gitStatus["modified"].length)
  if (0 !== modifications) {
    console.log("Release aborted!!!")
    console.log(`Your ${DEVELOPMENT_LOCAL_BRANCH} branch has modifications. Please commit your changes to ${DEVELOPMENT_REMOTE_BRANCH}.`)
    return
  }

  //Check that the active branch is set to Development
  console.log(`Confirm the active branch is set to ${DEVELOPMENT_LOCAL_BRANCH}`)
  let gitActiveBranch = await git().revparse(['--abbrev-ref','HEAD'])
  if (!(gitActiveBranch === DEVELOPMENT_LOCAL_BRANCH)) {
    console.log("Release aborted!!!")
    console.log(`Your active branch is ${gitActiveBranch}, you have to switch to ${DEVELOPMENT_LOCAL_BRANCH} branch.`)
    return
  }

  //Check for any changes to origin Development that need to be merged back into local Development
  console.log(`Confirm the active branch is set to ${DEVELOPMENT_LOCAL_BRANCH}`)
  if(await detectUnmergedChanges(DEVELOPMENT_REMOTE_BRANCH, DEVELOPMENT_LOCAL_BRANCH)){
    console.log("Release aborted!!!")
    console.log(`There are uncommitted changes on the local ${DEVELOPMENT_LOCAL_BRANCH} branch.`)
    console.log(`Merge changes from local ${DEVELOPMENT_LOCAL_BRANCH} branch to ${DEVELOPMENT_REMOTE_BRANCH} branch then reattempt release.`)
    return
  }

  //Check for any hotfix on Staging that needs to be merged back into Development
  console.log(`Confirm that any hotfix applied to Staging bas been merged back into ${DEVELOPMENT_LOCAL_BRANCH}`)
  if(await detectUnmergedChanges(DEVELOPMENT_REMOTE_BRANCH, STAGING_REMOTE_BRANCH)){
    console.log("Release aborted!!!")
    console.log(`There are hotfix changes on the ${STAGING_REMOTE_BRANCH} branch that need to be merged back into ${DEVELOPMENT_REMOTE_BRANCH}.`)
    console.log(`Merge changes from ${STAGING_REMOTE_BRANCH} to ${DEVELOPMENT_REMOTE_BRANCH} branch then reattempt release.`)
  }

  await releaseToStaging(argv.releaseType as string);
}

async function detectUnmergedChanges(destinationBranch: string, sourceBranch: string): Promise<boolean> {
  //Fetch changes from remote 'origin'
  //Determine if there are any changes to Staging branch that have not been merged into Development branch
  const result = await git().raw(['rev-list','--count', `${destinationBranch}..${sourceBranch}`])
  return (Number(result) !== 0)
}

/** wrap spawn into a promise */
function incrementPackageDotJsonVersion(releaseType: string, path: string, newVersion: string): Promise<string | number | null | Error> {
  return new Promise(function (resolve, reject) {
    console.log(`Setting version in ${path}/package.json`);
    const process = spawn(`npm`, ["version", newVersion, "--no-git-tag-version"], {cwd: path});
    process.on('exit', function (data) {
      resolve(data);
    });
    process.on('error', function (err) {
      reject(err);
    });
  });
}

async function releaseToStaging(releaseType: string): Promise<void> {

  let platformStatus:any = {}

  try {
    console.log(`Get the current version deployed to https://${STAGING_DOMAIN_NAME}/api/platform/status/detailed`)
    platformStatus = await axios.get(`https://${STAGING_DOMAIN_NAME}/api/platform/status/detailed`, {timeout: 10000});
  } catch (err){
    console.log("Release aborted!!!")
    console.log(`https://${STAGING_DOMAIN_NAME} is unreachable. Are you connected to the VPN?`)
    return
  }

  let originDevelopmentHash = await git().revparse(DEVELOPMENT_REMOTE_BRANCH);
  let developmentHash = await git().revparse(DEVELOPMENT_LOCAL_BRANCH);

  console.log(`Confirm the hash values for ${DEVELOPMENT_REMOTE_BRANCH} and ${DEVELOPMENT_LOCAL_BRANCH} match.`)
  if (originDevelopmentHash !== developmentHash) {
    console.log("Release aborted!!!")
    console.log(`${DEVELOPMENT_LOCAL_BRANCH} and ${DEVELOPMENT_REMOTE_BRANCH} are not pointing to the same commit. Please pull or merge changes as needed.`)
    return
  } else {

    console.log(`Initiating ${releaseType} release to ${STAGING_REMOTE_BRANCH}`);
    console.log(`Calculate the new version number.`)
    let deployedStagingVersion = platformStatus["data"]["data"]["version"];
    let newVersion = SemVer.inc(deployedStagingVersion, releaseType as  SemVer.ReleaseType);

    console.log(`Check for clash with existing version tags.`)
    let tagCheck = await git().raw('tag', '-l', newVersion as string);
    if(tagCheck === newVersion as string){
      console.log("Release aborted!!!")
      console.log(`A tag already exists for version ${newVersion}. Please review the version in package.json files and confirm the value is not from a prior release.`)
      return
    }

    if (SemVer.gt(newVersion as string, deployedStagingVersion)) {
      try {
        console.log(`Update ${releaseType} Version: ${deployedStagingVersion} => ${newVersion} `);
        console.log(`Updating version in package.json files.`);
        const promise1 = incrementPackageDotJsonVersion(releaseType, `${PROJECT_BASE_DIR}`, newVersion as string);
        const promise2 = incrementPackageDotJsonVersion(releaseType, `${PROJECT_BASE_DIR}/core`, newVersion as string);
        const promise3 = incrementPackageDotJsonVersion(releaseType, `${PROJECT_BASE_DIR}/shared`, newVersion as string);
        const promise4 = incrementPackageDotJsonVersion(releaseType, `${PROJECT_BASE_DIR}/frontend/connect-ui`, newVersion as string);
        const values = await Promise.all([promise1,promise2,promise3,promise4]);

        // Commit and push changes to development
        console.log(`Committing changes to the ${DEVELOPMENT_LOCAL_BRANCH} and pushing to origin/${DEVELOPMENT_LOCAL_BRANCH}.`);
        const result1 = await git().checkout(DEVELOPMENT_LOCAL_BRANCH)
        await git().add(`${PROJECT_BASE_DIR}/package.json`)
        await git().add(`${PROJECT_BASE_DIR}/package-lock.json`)
        await git().add(`${PROJECT_BASE_DIR}/core/package.json`)
        await git().add(`${PROJECT_BASE_DIR}/core/package-lock.json`)
        await git().add(`${PROJECT_BASE_DIR}/shared/package.json`)
        await git().add(`${PROJECT_BASE_DIR}/shared/package-lock.json`)
        await git().add(`${PROJECT_BASE_DIR}/frontend/connect-ui/package.json`)
        await git().add(`${PROJECT_BASE_DIR}/frontend/connect-ui/package-lock.json`)
        await git().commit(`Updated release ${releaseType} version to ${newVersion} in package.json`).push('origin', DEVELOPMENT_LOCAL_BRANCH)

        let newDevelopmentHash = await git().revparse(DEVELOPMENT_LOCAL_BRANCH);

        // Set staging to development commit, development and staging hash need to match
        console.log(`Fast-forward merge ${STAGING_LOCAL_BRANCH} to the same commit as ${DEVELOPMENT_LOCAL_BRANCH}.`);
        const result2 = await git().branch(['-f', STAGING_LOCAL_BRANCH, newDevelopmentHash]).push(['origin', STAGING_LOCAL_BRANCH])

        // Tag the release
        console.log(`Tagging the release to ${newVersion}.`);
        const result3 = await git().tag(["-a", newVersion as string, newDevelopmentHash, "-m", `${releaseType} ${newVersion} revision`]).push(['origin', newVersion as string])

      } catch (err){
        console.log(`ALERT!!! Release Failed during a critical phase`)
        console.log(`You must clean up local and remote branches, including tags, and retry the release`)
        console.error(err)
      }

    } else {
      console.log(`Release halted. The version in ${STAGING_LOCAL_BRANCH} ${deployedStagingVersion} is newer than your proposed release candidate.`)
    }
  }
}
