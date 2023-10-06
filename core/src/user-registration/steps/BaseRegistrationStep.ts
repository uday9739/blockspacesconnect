import { UserRegistrationFailureReason } from "@blockspaces/shared/dtos/users";
import { UserRegistrationData } from "../types";

/**
 * Abstract base class for defining steps in the registration process.
 * All registration steps should inherit from this class.
 */
export abstract class BaseRegistrationStep {

  /**
   * Run this step in the registration process
   *
   * @param registrationData the accumulated registration data
   * @returns a result containing either updated registration data (on success) or the reason why the execution failed (on failure)
   */
  async run(registrationData: UserRegistrationData): Promise<StepExecutionResult> {
    if (!registrationData) {
      throw new Error("registrationData is required");
    }

    return await this.execute(registrationData);
  }

  /**
   * Each step will implement this method to execute the registration step and return the execution result.
   *
   * Returning a result with `success` set to false indicates that the registration process should be aborted/short-circuited
   *
   * @param registrationData accumulated registration data
   * @returns a result containing either updated registration data or the reason why the execution failed
   */
  protected abstract execute(registrationData: UserRegistrationData): Promise<StepExecutionResult>;
}

export class StepExecutionResult {
  private constructor(json?: Partial<StepExecutionResult>) {
    Object.assign(this, json);
  }

  /** true if the step executed successfully */
  success: boolean;

  /** the updated registration data */
  registrationData?: UserRegistrationData;

  /** true if the step was skipped (i.e. shouldExecute returned false) */
  skipped?: boolean;

  /** if the step failed, provides a reason why */
  failureReason?: UserRegistrationFailureReason;

  /** Creates a success result */
  static success(registrationData: UserRegistrationData, skipped: boolean = false): StepExecutionResult {
    return new StepExecutionResult({ success: true, skipped, registrationData });
  }

  static failure(failureReason: UserRegistrationFailureReason) {
    return new StepExecutionResult({ success: false, failureReason });
  }
}