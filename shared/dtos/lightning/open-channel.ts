export class OpenChannelDto {
    node_pubkey_string: string
    sat_per_vbyte: string
    local_funding_amount: string
    push_sat?: string
    private: boolean
    commitment_type?: number
    zero_conf?: true
}