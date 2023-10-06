import { Injectable, OnModuleInit, Type } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import {
  AddInvitedUserToTenant,
  BaseRegistrationStep,
  CreateUnregisteredUser,
  CreateUnregisteredUserForInvitation,
  SendInviteToUser,
} from "../steps";
import { ValidateRecaptchaStep } from "../steps/ValidateRecaptchaStep";


/**
 * Allows registration steps to be injected
 */
@Injectable()
export class InvitationStepProvider implements OnModuleInit {

  /**
   * Defines the execution order of the registration steps.
   */
  static readonly OrderedSteps: ReadonlyArray<Type<BaseRegistrationStep>> = [

    // step 1: find or create unregistered user
    CreateUnregisteredUserForInvitation,
    SendInviteToUser,
    AddInvitedUserToTenant,
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
    this.steps = InvitationStepProvider.OrderedSteps.map(x => this.moduleRef.get(x));
  }
}