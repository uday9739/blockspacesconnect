export class CloseChannelDto {
  force: boolean
  target_conf: number
  max_fee_per_vbyte: string
}
export class CloseChannelParamsDto {
  fundingTxnStr: string
  channelPoint: string
  macaroon: string
}