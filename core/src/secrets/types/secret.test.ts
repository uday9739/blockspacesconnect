import { SecretType, UserSecret } from "./secret";

describe("Secret", () => {
  beforeEach(() => {

  });

  it(`should implement a UserSecret`, async () => {
    const userSecret: UserSecret = new UserSecret(
      SecretType.QUICKBOOKS, 
      "some-tenant-id", 
      "some-user-id", {
        secretId: "some-mongo-secret-id",
        subpath: SecretType.QUICKBOOKS.toLocaleLowerCase()
      });
    userSecret.data = {
      x_refresh_token_expires_in: 0,
      refresh_token: "",
      access_token: "",
      token_type: "",
      expires_in: 0,
      realmId: ""
    };
    expect(userSecret).toBeDefined();
    // expect(quickbooksSecret).toBe(mockResponse.results);
  });

  it(`should implement a Quickbooks User Secret`, async () => {
    const tenantSecret = vaultSecrets(
      SecretType.QUICKBOOKS, 
      "some-tenant-id",
      "some-user-id",
      "some-mongo-secret-id"
    );
    tenantSecret.data = {
      x_refresh_token_expires_in: 0,
      refresh_token: "",
      access_token: "",
      token_type: "",
      expires_in: 0,
      realmId: ""
    };
    expect(tenantSecret).toBeDefined();
    expect(tenantSecret.path).toBe('connect/data/tenant/some-tenant-id/user/some-user-id/quickbooks/some-mongo-secret-id');
  });
});

function vaultSecrets(secretType: SecretType, tenantId: string, userId: string, secretId: string): UserSecret {
  const secretPath = new UserSecret(
    secretType,
    tenantId,
    userId, {
      secretId: secretId,
      subpath: secretType.toLocaleLowerCase()
    });
  return secretPath;
}
