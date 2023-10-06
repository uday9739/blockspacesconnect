import { Injectable } from "@nestjs/common";
import { MacaroonSecretDto } from "@blockspaces/shared/dtos/lightning";
import { SecretService } from "../../../../secrets/services/SecretService";
import { SecretType } from "../../../../secrets/types/secret";
import { ConnectDbDataContext } from "../../../../connect-db/services/ConnectDbDataContext";

@Injectable()
export class LightningMacaroonService {
  constructor(private readonly secretService: SecretService, private readonly db: ConnectDbDataContext) {}

  /**
   * Stores the macaroon and seed phrase in the vault.
   *
   * @param macaroon The encrypted macaroon we want to store.
   * @param tenantId The users tenant id.
   * @param userId The users id.
   * @param accessToken The active access token for the user.
   * @returns The macaroon id stored in the `usersecrets` collection.
   */
  storeMacaroon = async (macaroon: MacaroonSecretDto, tenantId: string, userId: string, accessToken: string): Promise<string> => {
    const secret = await this.secretService.create(
      {
        tenantId: tenantId,
        credential: macaroon,
        userId: userId,
        label: "LND Admin Macaroon",
        description: "Credentials granting access to make calls to an LND node to pay & open channels."
      },
      tenantId,
      userId,
      SecretType.Macaroon, // TASK:BSPLT-1241 Secrets that are saved now require a Secret Type to be created correctly.
      accessToken
    );
    const storedMacaroon = await this.db.lightningNodes.findOneAndUpdate({ tenantId: tenantId, decomissioned: {$exists: false} }, { macaroonId: secret.credentialId });
    return storedMacaroon.macaroonId;
  };

  /**
   * Retrieves the encrypted macaroon and seed phrase from the vault.
   *
   * @param tenantId The users tenant id.
   * @param accessToken The active access token for the user.
   * @returns The encrypted macaroon data to be decrypted on the frontend.
   */
  getMacaroon = async (tenantId: string, accessToken: string): Promise<MacaroonSecretDto> => {
    const nodeData = await this.db.lightningNodes.findOne({ tenantId: tenantId, decomissioned: {$exists: false} });
    if(!nodeData){
      return null;
    } else{
      const secret = await this.secretService.use(
        nodeData.macaroonId,
        tenantId,
        SecretType.Macaroon, // TASK:BSPLT-1241 Secrets that are saved now require a Secret Type to be created correctly.
        accessToken);
      return <MacaroonSecretDto>secret?.credential;
    }
  };
}
