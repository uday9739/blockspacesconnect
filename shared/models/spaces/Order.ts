// Need to define the shared model for Orders
import { ConfigOption } from "./Catalog";
import { IProduct } from "./Product";

export interface IOrder {
    selectedNetwork: IProduct
    selectNetwork: IProduct
    qty: number
    configOptions: Record<string,ConfigOption>
};