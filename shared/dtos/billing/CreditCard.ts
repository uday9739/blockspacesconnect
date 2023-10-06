import { Address } from "../../models/Address";

export interface CreditCard {
  id: string;
  isDefault: boolean;
  billingDetails: {
    address: Address
  },
  card: {
    brand: string;
    country: string;
    expMonth: number;
    expYear: number;
    fingerprint: string;
    funding: string;
    last4: string;
  },
  created: number;
  type: string;
}