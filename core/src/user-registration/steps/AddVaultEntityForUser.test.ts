import { UserRegistrationDto, UserRegistrationFailureReason } from "@blockspaces/shared/dtos/users";
import { UnregisteredUser } from "@blockspaces/shared/models/users";
import { HydratedDocument } from "mongoose";
import { createMock } from "ts-auto-mock";
import { VaultService } from "../../vault";
import { Entity, EntityAlias } from "../../vault/types";
import { UserRegistrationData } from "../types";
import { AddVaultEntityForUser } from "./AddVaultEntityForUser";

describe(AddVaultEntityForUser, () => {

  let mocks: {
    vaultService: VaultService
  };

  let registrationData: UserRegistrationData;
  let step: AddVaultEntityForUser;

  beforeEach(() => {
    mocks = {
      vaultService: createMock<VaultService>()
    };

    registrationData = {
      formData: createMock<UserRegistrationDto>({ email: "joe@shmo.com", password: "abcd1234" }),
      user: createMock<HydratedDocument<UnregisteredUser>>({
        registered: false,
        email: "joe@shmo/com",
        id: "1234567890",
        save: async () => registrationData.user
      })
    };

    step = new AddVaultEntityForUser(mocks.vaultService);
  });

  it("should throw if no email is provided", async () => {
    registrationData.user.email = "";
    expect(() => step.run(registrationData)).rejects.toThrow();
  });

  it("should throw if no user id is provided", async () => {
    registrationData.user.id = undefined;
    expect(() => step.run(registrationData)).rejects.toThrow();
  });

  it('should fail if no Vault entity is found', async () => {
    mocks.vaultService.createEntity = async () => undefined;
    mocks.vaultService.getEntityByName = async () => undefined;

    const result = await step.run(registrationData);

    expect(result.success).toBe(false);
    expect(result.failureReason).toBe(UserRegistrationFailureReason.VAULT_IDENTITY_CREATION_FAILED);
  });

  it('should succeed if entity and alias creation are successful', async () => {
    mocks.vaultService.createEntity = async () => createMock<Entity>({ id: "abc1243" });
    mocks.vaultService.createEntityAlias = async () => createMock<EntityAlias>();

    const result = await step.run(registrationData);

    expect(result.success).toBe(true);
  });

  it('should create entity named using email address', async () => {
    let actualEntityName = "";

    mocks.vaultService.createEntity = async (name) => {
      actualEntityName = name;
      return createMock<Entity>({ id: "1" });
    };

    await step.run(registrationData);

    expect(actualEntityName).toBe(registrationData.user.email);
  });

  it('should create entity alias using User ID and Entity ID', async () => {
    const entity = createMock<Entity>({ id: "abc123" });
    let actualEntityId = "";
    let actualAliasName = "";

    mocks.vaultService.createEntity = async () => entity;

    mocks.vaultService.createEntityAlias = async (name, entityId) => {
      actualEntityId = entityId;
      actualAliasName = name;

      return createMock<EntityAlias>();
    };

    await step.run(registrationData);

    expect(actualEntityId).toBe(entity.id);
    expect(actualAliasName).toBe(registrationData.user.id);
  });
});