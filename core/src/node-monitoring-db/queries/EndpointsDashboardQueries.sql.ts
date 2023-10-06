/** Get a client's usage for the current selected network protocol across all their endpoints */
export const NETWORK_USAGE_BY_INTERVAL = `--sql
select to_str(to_timestamp(accept_date, 'dd/MMM/yyyy:HH:mm:ss.SSS'), '\${interval}') "aDate"
  , http_request "endpoint"
  , count(*) "usage"
from 'protocol_router_logs'
where http_request in (\${endpoints})
  and to_timestamp(accept_date, 'dd/MMM/yyyy:HH:mm:ss.SSS') between $1 and $2
  and http_status_code in ('200','201','202','203','204')
group by "aDate",
  "endpoint"
`;
