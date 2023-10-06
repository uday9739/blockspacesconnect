

/** fetches the latest POKT token amounts and node count for a fleet (list of specific nodes) */
export const FLEET_POKT_TOKEN_AMOUNTS = `--sql
  SELECT sum(staked) staked, sum(unstaked) unstaked, count_distinct(address) nodeCount
  FROM network_POKT_NODE
  WHERE address in (\${clientNodes})
  LATEST ON timestamp
  PARTITION BY address;
`;

/** gets the latest node count of "healthy" nodes in a fleet (list of specific nodes) */
export const FLEET_HEALTHY_NODE_COUNT = `--sql
  SELECT count_distinct(address) as healthy
  FROM network_POKT_RELAY
  WHERE address in (\${clientNodes})
  LATEST ON timestamp
  PARTITION BY address;
`;

/** gets a breakdown of POKT token amounts for a fleet, at specified intervals, for a given date range */
export const FLEET_POKT_TOKENS_BY_INTERVAL = `--sql
  with summary as (
    with data as (
      SELECT to_str(timestamp,'\${interval}') aDate, address, staked, unstaked, timestamp
      FROM network_POKT_NODE
      WHERE address in (\${clientNodes})
      AND timestamp between $1 and $2
    )
    select aDate,staked,unstaked, address
    from data
    LATEST ON timestamp
    PARTITION BY aDate,address
  )
  select aDate, sum(staked) staked, sum(unstaked) unstaked, count_distinct(address) nodeCount
  from summary;
`

/** gets the latest POKT token amounts and node count for the entire Pocket Network */
export const NETWORK_POKT_TOKEN_AMOUNTS = `--sql
  SELECT sum(staked) staked, sum(unstaked) unstaked, count_distinct(address) nodeCount
  FROM network_POKT_NODE
  LATEST ON timestamp
  PARTITION BY address;
`

/** gets the latest node counts, broken out by status, for the entire Pocket Network  */
export const NETWORK_NODE_HEALTH = `--sql
  SELECT count_distinct(address) as 'healthy'
  FROM network_POKT_RELAY
  LATEST ON timestamp
  PARTITION BY address;
`

/** gets a breakdown of POKT token amounts for the entire Pocket Network, at specified intervals, for a given date */
export const NETWORK_POKT_TOKENS_BY_INTERVAL = `--sql
  with summary as (
    with data as (
      SELECT to_str(timestamp,'\${interval}') aDate, address, staked, unstaked, timestamp
      FROM network_POKT_NODE
      WHERE timestamp between $1 and $2
    )
    select aDate,staked,unstaked, address
    from data
    LATEST ON timestamp
    PARTITION BY aDate,address
  )
  select aDate, sum(staked) staked, sum(unstaked) unstaked, count_distinct(address) nodeCount
  from summary;
`

/** BlockSpace Network Relay data */
export const NETWORK_POKT_RELAYS = `--sql
WITH data AS (
  SELECT to_str(CAST(heightTimestamp as timestamp),'\${interval}') period, chain, sum(count) relays
  FROM network_POKT_RELAY
  WHERE CAST(heightTimestamp as timestamp) >= $1 
    AND CAST(heightTimestamp as timestamp) <= $2
  GROUP BY period,chain
) SELECT period, chain, relays, (relays * 1768 / 1000000) minted, (relays * 1768 / 1000000) * (.85) earned FROM data;
`

/** Client Fleet Network Relay Data */
export const FLEET_POKT_RELAYS = `--sql
WITH data AS (
    SELECT to_str(CAST(heightTimestamp as timestamp),'\${interval}') period, chain, sum(count) relays
    FROM network_POKT_RELAY
    WHERE address in (\${clientNodes}) 
      AND CAST(heightTimestamp as timestamp) >= $1 
      AND CAST(heightTimestamp as timestamp) <= $2
    GROUP BY period,chain
) SELECT period, chain, relays, (relays * 1768 / 1000000) minted, (relays * 1768 / 1000000) * (.85) earned FROM data;
`
