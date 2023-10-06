export type RouteHopHints = [
  {
    hop_hints: [
      {
        node_id: string;
        chan_id: string;
        fee_base_msat: number;
        fee_proportional_millionths: number;
        cltv_expiry_delta: number;
      }
    ];
  }
];

export class FeeReport {
  channel_fees: Array<ChannelFees>;
  day_fee_sum: string;
  week_fee_sum: string;
  month_fee_sum: string;
}

export type ChannelFees = {
  chan_id: string;
  channel_point: string;
  base_fee_msat: string;
  fee_per_mil: string;
  fee_rate: number;
};

export type RecommendedFees = { 
  fastestFee: number; 
  halfHourFee: number; 
  hourFee: number; 
  economyFee: number; 
  minimumFee: number 
};
