import axios, { AxiosError, AxiosResponse } from "axios";
import * as https from "https";
import { PathLike, readdirSync, readFileSync } from "fs";
import ora from "ora";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as scriptUtils from "./scriptUtils";
import { URL } from "url";

type UserCredential = { email: string | undefined, password: string | undefined }

type AuthToken = { access_token: string, id_token: string };

class Options {
  adminEmail?: string;
  adminPassword?: string;
  baseUrl?: string;
  email?: string;
  password?: string;
  initUser?: boolean;

  constructor(otherOptions: Partial<Options>) {
    Object.assign(this, otherOptions);
  }

  get adminCredentials(): UserCredential {
    return { email: this.adminEmail, password: this.adminPassword };
  }

  get userCredentials(): UserCredential {
    return { email: this.email, password: this.password };
  }
}

const { __filename, __dirname } = scriptUtils.getModulePaths(import.meta.url);

const DEFAULT_PASSWORD = "passw0rd";
const DEFAULT_OPTIONS = new Options({
  baseUrl: "https://localhost",
  adminEmail: "admin@blockspaces.com",
  adminPassword: DEFAULT_PASSWORD,
  initUser: false
});

// allow axios to use HTTPS w/ self-signed cert
axios.defaults.httpsAgent = new https.Agent({ rejectUnauthorized: false });

const options: Options = await buildOptionsFromCommandLine();
await doPostBuild();

async function doPostBuild(): Promise<void> {
  // try to login as admin user
  const adminAuthToken = await login(options.adminCredentials);

  if (!adminAuthToken)
    throw new Error(`Failed to login as admin user (${options.adminEmail}`);

  // delete old core connectors
  console.log("\nDeleting old core connectors...");
  await deleteConnectors(adminAuthToken);

  // load new core connectors
  console.log("\nLoading new core connectors...");
  await loadConnectors(adminAuthToken);

  // load flows (will delete existing flows with same id first)
  console.log("\nLoading flows...");
  await loadFlows(adminAuthToken);
  console.log("");

  if (!options.initUser)
    return;

  // try to logging in as user
  let userAuthToken = await login(options.userCredentials);
  const shouldRegisterNewUser = !userAuthToken;

  // register a new user if login failed
  if (shouldRegisterNewUser) {
    const isRegistered = await registerUser(options.userCredentials);
    if (!isRegistered) {
      return;
    }

    userAuthToken = await login(options.userCredentials);

  } else if (!await scriptUtils.promptBoolean("Do you want to load default credentials?")) {
    return;
  }

  // load credentials
  console.log("\nLoading credentials...")
  await loadCredentials(<AuthToken>userAuthToken)
}

/** delete all connectors */
async function deleteConnectors(authToken: AuthToken): Promise<void> {
  await axios.delete(getApiUrl("/connectors"), { headers: buildAuthHeaders(authToken) });
}

/** load connectors in to DB */
async function loadConnectors(authToken: AuthToken): Promise<void> {
  const headers = buildAuthHeaders(authToken);

  await withJsonDataFiles("connectors", async (filename, data) => {
    const spinner = ora().start(`Loading connector "${filename}"`);

    await axios.post(getApiUrl("/connectors"), data, { headers })
      .catch(err => {
        spinner.fail();
        throw err.toString();
      });

    spinner.succeed();
  });
}

/** load credentials in to DB */
async function loadCredentials(authToken: AuthToken): Promise<void> {
  const headers = buildAuthHeaders(authToken);

  await withJsonDataFiles("credentials", async (filename, data) => {
    const fileInfo = path.parse(filename);
    const connectorName = fileInfo.dir;
    const credentialName = encodeURIComponent(fileInfo.name);
    const spinner = ora().start(`Loading credential "${connectorName}/${credentialName}"`);

    await axios.post(getApiUrl(`/clientcredentials/${connectorName}`), data, { headers })
      .catch(err => {
        spinner.fail();
        throw err.toString();
      });
    spinner.succeed();
  });
}

async function loadFlows(authToken: AuthToken): Promise<void> {
  const headers = buildAuthHeaders(authToken);

  await withJsonDataFiles("flows", async (filename, data) => {
    const spinner = ora().start(`Loading flow "${filename}"`);

    try {
      await axios.delete(getApiUrl(`/blockflow/${data.id}`), { headers });
    } catch (err: any) {
      switch (err.response?.status) {
        // ignore HTTP 404 (not found) error
        case 404:
          break;

        default:
          spinner.fail();
          throw err.toString();
      }
    }

    try {
      await axios.post(getApiUrl("/blockflow"), data, { headers });
    } catch (err: any) {
      spinner.fail();
      throw err.toString();
    }

    spinner.succeed();
  })
}

/** Logs in to the BSC api with the given credentials and returns the OAuth token if successful */
async function login({ email, password }: UserCredential): Promise<AuthToken|null> {
  const loginUrl = getApiUrl("/users/login");
  const spinner = ora(`Logging in as ${email}`).start();

  try {
    let response = await axios.post<UserCredential, AxiosResponse<{token: AuthToken}>> (loginUrl, { email, password });
    spinner.succeed(`Logged in as ${email}`);
    return response.data.token;
  } catch (err : any) {

    if (err?.response?.status === 500) {
      spinner.fail(`Login failed for ${email}.`);
      return null;
    }

    spinner.fail(`Login failed at ${loginUrl} for email ${email}`);
    throw new Error(err.toString());
  }
}

async function registerUser({ email, password }: UserCredential): Promise<boolean> {
  const registerUrl = getApiUrl("/users/register");
  const spinner = ora(`Registering new user account for ${email}`).start();

  try {
    await axios.post(registerUrl, { email, password, passwordConfirm: password });
    spinner.succeed(`Registered new user account for ${email}`);
    return true;
  } catch (err) {
    spinner.fail(`Registration failed. Contact the team about manually adding your account to IAM.`);
    return false;
  }
}

async function withJsonDataFiles(dataFileDirectoryName: string, asyncAction: (filename: string, data: any) => void)
  : Promise<void>
{
  const dataFileDirPath = path.join(__dirname, "data", dataFileDirectoryName);

  for (const jsonFilePath of getJsonFilePaths(dataFileDirPath)) {
    const dataFromFile = JSON.parse(readFileSync(jsonFilePath).toString());
    const filename = path.relative(dataFileDirPath, jsonFilePath)
    await asyncAction(filename, dataFromFile);
  }
}

function getJsonFilePaths(dirPath: string): string[] {
  const filesInDirectory = readdirSync(dirPath, { withFileTypes: true });
  const files: string[] = [];

  filesInDirectory.forEach((entry) => {
    let fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory())
      files.push(...getJsonFilePaths(fullPath));

    else if (entry.isFile() && (/\.json$/i).test(entry.name))
      files.push(fullPath);
  });

  return files;
}

function getApiUrl(resourcePath: string = ""): string {
  return new URL(path.posix.join("api", resourcePath), options.baseUrl).toString();
}

function buildAuthHeaders({ id_token = "", access_token = "" }: AuthToken) {
  return {
    "Authorization": `Bearer ${access_token}`,
    "Identity": id_token
  }
}

/**
 * Builds a new Options object by parsing the command line arguments
 * @returns {Options}
 */
async function buildOptionsFromCommandLine() : Promise<Options> {
  const argv = yargs(hideBin(process.argv))
    .usage("Usage: $0 [options]")
    .options({
      "base-url": {
        type: "string",
        description: "base URL to use for API communication",
        default: DEFAULT_OPTIONS.baseUrl
      },
      "init-user": {
        type: "boolean",
        description: "Register user, if needed, and load default credentials",
        default: DEFAULT_OPTIONS.initUser
      },
      "email": {
        type: "string",
        requiresArg: false,
        description: "Email address for user"
      },
      "password": {
        type: "string",
        requiresArg: false,
        description: "Password for user"
      },
      "admin-email": {
        type: "string",
        description: "Email address for admin user"
      },
      "admin-password": {
        type: "string",
        description: "Password for admin user"
      }
    })
    .strictCommands()
    .parse();

  const options: Options = Object.assign(new Options(DEFAULT_OPTIONS), argv);

  // parse URL and extract just the host and protocol
  options.baseUrl = new URL(options.baseUrl || "").origin;

  if (options.initUser) {
    const emailRegex = /[a-z0-9.-_]@blockspaces\.com/i;

    if (options.email === undefined || !emailRegex.test(options.email))
      options.email = await scriptUtils.prompt("Enter your BlockSpaces email address", { inputRegex: emailRegex });

    if (options.password === undefined)
      options.password = await scriptUtils.prompt("Enter your password", { defaultValue: DEFAULT_PASSWORD });
  }

  if (options.adminEmail === undefined)
    options.adminEmail = await scriptUtils.prompt("Enter the admin email address", { defaultValue: DEFAULT_OPTIONS.adminEmail });

  if (options.adminPassword === undefined)
    options.adminPassword = await scriptUtils.prompt("Enter the admin password", { defaultValue: DEFAULT_OPTIONS.adminPassword });

  return options;
}