import { createMock } from "ts-auto-mock";
import { ConnectDbDataContext } from "../../../../../connect-db/services/ConnectDbDataContext";
import { SecretService } from "../../../../../secrets/services/SecretService";
import { LightningMacaroonService } from "../LightningMacaroonService";


describe(LightningMacaroonService, () => {
  let lightningSecret: LightningMacaroonService;
  let mockedSecretService: SecretService;
  let db: ConnectDbDataContext;

  beforeEach(() => {
    mockedSecretService = createMock<SecretService>();
    db = createMock<ConnectDbDataContext>();

    lightningSecret = new LightningMacaroonService(mockedSecretService, db);
  });

  it("stores lightning secret in vault", async () => {
    lightningSecret.storeMacaroon = jest.fn().mockResolvedValue("f22qw323-f23f3f2-2f2f");
    const macaroonId = await lightningSecret.storeMacaroon({ macaroon: "02f3443v4gg4" }, "tenant_id", "user_id", "access_token");
    expect(macaroonId).toMatch("f22qw323-f23f3f2-2f2f");
  });

  it("returns lightning secret from vaule", async () => {
    lightningSecret.getMacaroon = jest.fn().mockResolvedValue({
      macaroon: "02f3443v4gg4",
      seedPhrase: ["seed", "phrase"]
    });

    const secret = await lightningSecret.getMacaroon("tenant_id", "access_token");
    expect(secret.macaroon).toMatch("02f3443v4gg4");
  });
});
