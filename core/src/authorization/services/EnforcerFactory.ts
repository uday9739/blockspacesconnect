import { env } from "../../env";
import path from "path";
import { Enforcer, newEnforcer } from "casbin";
import { CONFIG_DIR_PATH } from "../../constants";
import { MongoAdapter } from "casbin-mongodb-adapter";

export async function EnforcerFactory(): Promise<Enforcer> {
  // const adapter = await MongoAdapter.newAdapter({
  //   uri: env.database.casbinDbConnectString,
  //   collection: "policies",
  //   database: "connect",
  //   option: { useUnifiedTopology: true, useNewUrlParser: true },
  // });
  const adapter = await MongoAdapter.newAdapter({
    uri: env.database.casbinDbConnectString,
    collection: "policies",
    database: "connect",
    option: {},
  });
  return await newEnforcer(path.resolve(CONFIG_DIR_PATH, env.policyManager.casbinModel), adapter);
}
