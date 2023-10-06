export class TrackInvoiceDto {
    payment_hash: string;
}

export class TrackInvoiceResponseDto {
    memo: string;
    value: number;
    settled: boolean;
    state: string;
    settle_date: number;
    payment_request: string;
    error?: boolean;
}