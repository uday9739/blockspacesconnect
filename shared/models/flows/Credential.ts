// TODO rename to UserSecret and move to models/secrets/UserSecret.ts
export interface ICredentialReference {
  credentialId: string;
  tenantId: string; // Passed in the Params of the endpoint or in the body of the create and Update calls..
  userId: string;
  label: string;
  description?: string;
  subPath?: string;
  credential?: {}; // For USE endpoint ONLY. Connector Credentails are never returned to the UI.
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: string;
}

// TODO archive/remove this class (along with rest of Flows stuff)
export class Credential implements ICredentialReference {
  credentialId: string;
  tenantId: string;
  userId: string;
  label: string;
  description?: string;
  credential?: {};
  "_id"?: string;
  createdAt?: string;
  updatedAt?: string;
  "__v"?: string;
  subPath?: string;

  constructor(credentialDefinition: ICredentialReference) {
    Object.assign(this, credentialDefinition);
  }

  get asJson() {
    return {
      credentialId: this.credentialId,
      tenantId: this.tenantId,
      userId: this.userId,
      label: this.label,
      description: this.description,
      credential: this.credential,
      subPath: this.subPath
    };
  }
}
