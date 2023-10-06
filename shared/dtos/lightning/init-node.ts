export class InitNodeDto {
    wallet_password: string
    cipher_seed_mnemonic: Array<string>
}

export class InitNodeResponseDto {
    admin_macaroon: string
}