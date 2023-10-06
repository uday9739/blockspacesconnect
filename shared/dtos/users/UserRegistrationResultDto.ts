export interface UserRegistrationResultDto {
  /** true, if the registration process completed successfully */
  success: boolean;

  /** if registration did not complete successfully, this indicate the reason why */
  failureReason?: UserRegistrationFailureReason;
}


/** defines the different reasons that the registration process could fail to complete successfully */


export enum UserRegistrationFailureReason {

  /** the user has already registered */
  ALREADY_REGISTERED = "already registered",
  APP_ID_ERROR = "There was an issue with the Identity Management system. Please try again in 5 minutes.",
  ACCOUNT_DEACTIVATED = "The account associated with this email has been deactivated. Please contact Customer Support.",
  WHMCS_API_ERROR = "There was a error finding the user in WHMCS.",
  FINAL_VALIDATION_AND_SAVE = "There was an error finalizing the User Registration Status.",
  /** A Vault identity (entity + entity alias) was not found or created */
  VAULT_IDENTITY_CREATION_FAILED = "failed to find or create a Vault identity for the user",
  ADD_INVITED_USER_TO_TENANT_FAILED = "Failed adding the invited user to the inviting tenant",
  CREATE_CRM_CONTACT_FAILED = "Failed creating a new Contact for the User in the CRM",
}