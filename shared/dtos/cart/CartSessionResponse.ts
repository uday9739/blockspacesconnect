import { NetworkOfferingDTO, NetworkPriceDto } from "../network-catalog/NetworkPrice";
import { UserCartDto } from "./UserCart";

export interface CartPaymentConfig {
  key: string;
  paymentToken?: string;
  amountDue: number;
  couponApplied: boolean;
  discountTotal: number;
}

export interface CartSessionResponseDto {
  network: {
    _id: string;
    name: string,
    description: string
  },
  cart: UserCartDto;
  paymentConfig?: CartPaymentConfig,
  catalog?: Array<NetworkOfferingDTO>
}