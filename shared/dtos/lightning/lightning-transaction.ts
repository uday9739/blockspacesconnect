import { IsBoolean, IsNumber } from "class-validator";

export class IncomingPaymentDto {
    @IsNumber()
    index_offset: number;
    @IsBoolean()
    pending_only: boolean;
    @IsNumber()
    num_max_invoices: number;
    @IsBoolean()
    reversed: boolean
}

export class OutgoingPaymentDto {
    @IsNumber()
    index_offset: number;
    @IsBoolean()
    reversed: boolean;
    @IsNumber()
    max_payments: number;
    @IsBoolean()
    include_incomplete: boolean;
}