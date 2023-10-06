export class AddPeerDto {
  addr: {
      pubkey: string,
      host: string
  }
  perm: boolean
  timeout: string
}