import axios from "axios";

const oldVaultURL: string = "https://vault.blockspaces.dev/v1";
const oldVaultToken: string = "hvs.CAESIPK-YaK7pYKHly8VyB24nyMaKCvlb2H3MPNMuOZq9iMtGh4KHGh2cy5xaVhmT0VnVTE4NnozTzFCeUdjWU1iekc";

const newVaultUrl: string = "https://vault.blockspaces.dev/v1";
const newVaultToken: string = "hvs.CAESIPK-YaK7pYKHly8VyB24nyMaKCvlb2H3MPNMuOZq9iMtGh4KHGh2cy5xaVhmT0VnVTE4NnozTzFCeUdjWU1iekc";
const jwtAccessor: string = "mFfrAwfSbxF43yPLXEeYItV9";



processPolicies();
// #region Process Policies
async function processPolicies(): Promise<void> {
  const oldPolicies = await getPolicyList();
  console.log(`POLICIES: ${oldPolicies}`);
  for (let i = 0; i < oldPolicies.length; i++) {
    if (await createPolicies(oldPolicies[i])) {
      console.log(`success: ${oldPolicies[i]}`);
    } else {
      console.error(`FAILURE: ${oldPolicies[i]}`);
    }
  }
}
/**
 * Create Policies on the NEW Production Vault.
 *
 * @param policylist is a string array of policy names to create in the NEW production Vault.
 * @returns True or an error.
 */
async function createPolicies(policy: string): Promise<boolean> {

  const policyObject = {
    policy: `path \"connect/metadata/orgs/${policy}*\" {\n  capabilities = [\"read\",\"list\"]\n}\n\npath \"connect/data/orgs/${policy}*\" {\n  capabilities = [ \"create\",\"read\",\"update\",\"delete\",\"list\" ]\n}\n\npath \"connect/data/orgs/${policy}/{{identity.entity.aliases.${jwtAccessor}.metadata.sub}}*\" {\n  capabilities = [ \"create\",\"read\",\"update\",\"delete\",\"list\" ]\n}\n`
  };
  return await axios({
    baseURL: newVaultUrl,
    url: `/sys/policy/${policy}`,
    timeout: 1000 * 5, // Wait for 5 seconds
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Vault-Token": newVaultToken
    },
    data: policyObject
  })
    .then(() => {
      return true;
    })
    .catch(async (err: any) => {
      console.log(`policy: ${policy} threw error: ${err}`);
      return false;
    });
}
/**
 * Get a list of Policy names from the Old Production Vault.
 *
 * @returns String array of policy names (tenant Id's)
 */
async function getPolicyList(): Promise<string[]> {
  let result: string[];
  // eslint-disable-next-line prefer-const
  let arrPolicies: string[] = [];
  await axios({
    baseURL: oldVaultURL,
    url: "/sys/policies/acl",
    timeout: 1000 * 5, // Wait for 5 seconds
    method: "LIST",
    headers: {
      "Content-Type": "application/json",
      "X-Vault-Token": oldVaultToken
    }
  })
    .then((response) => {
      result = response.data.data.keys;
      for (let i = 0; i < result.length; i++) {
        if (!IGNORE_POLICIES.includes(result[i])) {
          arrPolicies.push(result[i].toString());
        }
      }
    })
    .catch(async (err: any) => {
      throw new Error(err);
    });
  return arrPolicies;
}
/** List of Policies to ignore */
const IGNORE_POLICIES: string[] = [
  "bsc-core-vault-inject-k8s",
  "chris_test",
  "connect_client",
  "connect_server",
  "connectapp",
  "default",
  "demo",
  "root",
  "admin",
  "jenkins",
  "justin_test",
  "test-455553a2-17d9-43b8-b129-a0491d28d1e5",
  "test-8f06737c-3db4-4293-b9f0-9c6b9452329f",
  "test-d70bf189-ea69-4279-9eff-f476bbe29d02",
  "test-f1e8bfe8-1be5-4570-ab9c-6c7cdeabdecc",
  "testpolicyname+004af0e7-5f66-4002-b2fb-110347d41a43",
  "testpolicyname+05f65c14-87e2-4ea8-a974-1404087fe2a8",
  "testpolicyname+11d6d7c5-c8e1-497f-89e1-829c077e494d",
  "testpolicyname+12cdd6ea-270d-4b74-a700-8bbfea0999f6",
  "testpolicyname+1acda53c-50e5-478e-8636-488b4ea27983",
  "testpolicyname+2717c1e2-aa6c-4d4e-aaf4-08189c92100b",
  "testpolicyname+2aff75b9-c776-46b2-880f-6a5e0b1f647a",
  "testpolicyname+41af70c7-4fe8-453c-ab5c-01c349febe1d",
  "testpolicyname+43bb6421-0198-4723-91a3-fdb623353065",
  "testpolicyname+4dde795e-8761-4775-b2f8-57211ff8b35c",
  "testpolicyname+69b0b8b0-16fb-4ea6-a4f6-39cce68616a2",
  "testpolicyname+7369f49f-ac27-431b-a01f-6f0fce63ad52",
  "testpolicyname+82204b65-4d2b-4a8a-b16d-859713c80060",
  "testpolicyname+906d7844-67d1-4695-a595-eaea5ada24e5",
  "testpolicyname+91d0cf38-5c85-4c50-9f26-5769502c474f",
  "testpolicyname+9c19c33a-8f95-4329-beae-0408c98550c2",
  "testpolicyname+a3954b98-4257-43e8-a2d6-23c9367d926b",
  "testpolicyname+a3fbf9e7-1b19-4a1c-b138-f3f1d0c21f06",
  "testpolicyname+c613c158-0f03-4b5c-8f18-b57d125ec85e",
  "testpolicyname+d52ef7c0-72f9-45ab-8ef6-a4fa5d4656c9",
  "testpolicyname+df89ae8a-1653-463f-b79c-853c412ebd29",
  "testpolicyname+dfc3999a-63c5-4397-b363-62023abd8695",
  "testpolicyname+e74055ce-395c-497d-b7b0-ccfea7525fa4",
  "testpolicyname+ea72a890-5863-404f-98e7-de84725192b1",
  "testpolicyname+f42ea931-802e-497b-9c52-0a96328f2bfd",
  "testpolicyname+f973506f-9204-40a7-be9e-fe94f45c4e90",
  "testpolicyname+ff2d0d59-2b0c-42fa-9c55-0cb3e28b3e27"
];
// #endregion

// processTotp();
// #region Process TOTP
async function processTotp(): Promise<void> {
  const totpList = await getTotpList();
  console.log(`TOTP: ${totpList}`);
  for (let i = 0; i < totpList.length; i++) {
    if (await createTOTPKey(totpList[i])) {
      console.log(`success: ${totpList[i]}`);
    } else {
      console.error(`FAILURE: ${totpList[i]}`);
    }
  }
}
async function getTotpList(): Promise<string[]> {
  let result: string[] = [];
  await axios({
    baseURL: oldVaultURL,
    url: "/totp/keys",
    timeout: 1000 * 5, // Wait for 5 seconds
    method: "LIST",
    headers: {
      "Content-Type": "application/json",
      "X-Vault-Token": oldVaultToken
    }
  })
    .then((response) => {
      result = response.data.data.keys;
    })
    .catch(async (err: any) => {
      throw new Error(err);
    });
  return result;
}
async function createTOTPKey(keyName: string): Promise<boolean> {
  const payload = {
    generate: true,
    issuer: "BlockSpaces Platform",
    account_name: "BlockSpaces Connect"
  };
  return await axios({
    baseURL: newVaultUrl,
    url: `/totp/keys/${keyName}`,
    timeout: 1000 * 5, // Wait for 5 seconds
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Vault-Token": newVaultToken
    },
    data: payload
  })
    .then(() => {
      return true;
    })
    .catch(async (err: any) => {
      console.log(err);
      return false;
    });
}

// #endregion
