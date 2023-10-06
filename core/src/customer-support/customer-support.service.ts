import { IUser } from '@blockspaces/shared/models/users';
import { Injectable } from '@nestjs/common';

/**
 * Provides operations for interacting with BlockSpaces customer support systems
 */
@Injectable()
export class CustomerSupportService {

  constructor(
  ) { }

  /**
   * Update a user's profile (contact info) in any 3rd-party customer support system(s) where it's stored
   */
  async updateCustomerUserProfile(user: IUser): Promise<void> {
    // TODO add code here to sync user to WHMCS

    /*
      Technical notes for (eventual) implementation:
        - user data should only be synced to WHMCS is the user is determined to be the owner of the WHMCS client
          with ClientId matching user.whmcs.clientId

        - To determine if the user is the owner...
            1. fetch client from WHMCS (using client ID from passed in user)
            2. the user is the owner if the email associated with the WHMCS client matches user.email

        - If the user is the owner of the client, update the client info based on passed in user data
          - Otherwise, do nothing
     */
  }
}
