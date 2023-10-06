const { execSync } = require("child_process");

const windowsScript = `${__dirname}\\buildProtoFiles.cmd`;
const bashScript = `${__dirname}/buildProtoFiles.sh`;

execSync(process.platform === "win32" ? windowsScript : bashScript);