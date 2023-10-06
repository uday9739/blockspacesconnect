import git from "simple-git"
import axios from "axios"
import SemVer from "semver"
import yargs from "yargs";
import {exec, spawn} from "child_process"
import path from 'path';
import {fileURLToPath} from 'url';
import {hideBin} from "yargs/helpers";

const DEVELOPMENT_LOCAL_BRANCH = "jenkins-dev";
const DEVELOPMENT_REMOTE_BRANCH = "origin/jenkins-dev";
const STAGING_LOCAL_BRANCH = "jenkins-test";
const STAGING_REMOTE_BRANCH = "origin/jenkins-test";
const STAGING_DOMAIN_NAME = "staging.blockspaces.dev";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_BASE_DIR = path.resolve(__dirname, "../");

main();

/** execute main script */
async function main(): Promise<void> {
  try {
    const version1 =  resetPackageDotJsonVersion(`${PROJECT_BASE_DIR}`)
    const version2 =  resetPackageDotJsonVersion(`${PROJECT_BASE_DIR}/core`)
    const version3 =  resetPackageDotJsonVersion(`${PROJECT_BASE_DIR}/shared`)
    const version4 =  resetPackageDotJsonVersion(`${PROJECT_BASE_DIR}/frontend/connect-ui`)
    const deleteLocalTag = git().raw('tag', '-d', '2.2.0')
    const deleteRemoteTag = git().raw('push', '--delete', 'origin', '2.2.0')
    Promise.all([version1,version2,version3,version4,deleteLocalTag,deleteRemoteTag]).then(async (values)=>{
     console.log(values);
    })
  }catch (err){
    console.error(err);
  }
}

/** wrap spawn into a promise */
function resetPackageDotJsonVersion(path: string,): Promise<string | number | null | Error> {
    return new Promise(function (resolve, reject) {
      console.log(path)
      const process = spawn(`npm`, ["version", '2.1.14', "--no-git-tag-version"], {cwd: path});
      process.stdout.on('data', function (data) {
        resolve(data);
      });
      process.on('error', function (err) {
        reject(err);
      });
    });
}

