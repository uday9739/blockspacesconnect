import { Injectable, OnModuleInit, Type } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import {
  AddVaultEntityForUser,
  AddVaultGroupForTenant,
  BaseRegistrationStep,
  CreateDefaultTenant,
  CreateUnregisteredUser,
  RegisterWithAppId,
  // RegisterWithWhmcs,
  SetUserToRegistered,
  CreateCrmContact
} from "../steps";
import { ValidateRecaptchaStep } from "../steps/ValidateRecaptchaStep";


/**
 * Allows registration steps to be injected
 */
@Injectable()
export class RegistrationStepProvider implements OnModuleInit {

  /**
   * Defines the execution order of the registration steps.
   */
  static readonly OrderedSteps: ReadonlyArray<Type<BaseRegistrationStep>> = [

    //
    ValidateRecaptchaStep,

    // step 1: find or create unregistered user
    CreateUnregisteredUser,

    // step 1.1: create contact in CRM
    CreateCrmContact,

    // step 2: register user with authentication platform (i.e. IBM App ID)
    RegisterWithAppId,

    // step 3: register user with customer support system (i.e. WHMCS) - removed due to sunsetting Pocket and WHMCS
    // RegisterWithWhmcs,

    // step 3: create default tenant
    CreateDefaultTenant,

    // step 4: create vault entity
    AddVaultEntityForUser,

    // step 5: create vault group
    AddVaultGroupForTenant,

    // step 6: convert user from unregistered to "registered" user
    SetUserToRegistered,
  ];

  private steps: BaseRegistrationStep[];

  constructor(private moduleRef: ModuleRef) {
  }

  /** Provides an instance of each registration step, in the order that they should be executed */
  getSteps(): BaseRegistrationStep[] {
    return this.steps;
  }

  // executed automatically by NestJS when the module is loaded
  onModuleInit() {
    this.steps = RegistrationStepProvider.OrderedSteps.map(x => this.moduleRef.get(x));
  }
}