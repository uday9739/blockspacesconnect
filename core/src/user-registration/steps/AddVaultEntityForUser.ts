import { UserRegistrationFailureReason } from "@blockspaces/shared/dtos/users";
import { Injectable } from "@nestjs/common";
import { VaultService } from "../../vault";
import { UserRegistrationData } from "../types";
import { BaseRegistrationStep, StepExecutionResult } from "./BaseRegistrationStep";

@Injectable()
export class AddVaultEntityForUser extends BaseRegistrationStep {

  constructor(private readonly vaultService: VaultService) {
    super();
  }

  protected async execute(registrationData: UserRegistrationData): Promise<StepExecutionResult> {
    const user = registrationData.user;

    if (!user?.email) {
      throw new Error("no email address was available");
    }

    if (!user.id) {
      throw new Error("no user ID was available");
    }

    let entity = await this.vaultService.createEntity(user.email);

    if (!entity) {
      entity = await this.vaultService.getEntityByName(user.email);
    }

    if (!entity || !entity.id) {
      return StepExecutionResult.failure(UserRegistrationFailureReason.VAULT_IDENTITY_CREATION_FAILED);
    }

    // add entity alias for Connect
    await this.vaultService.createEntityAlias(user.id, entity.id);

    return StepExecutionResult.success(registrationData);
  }
}