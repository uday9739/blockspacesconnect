/** Reasons why poktservice could fail */
export enum PoktFailureReason {
  SUMMARY_DATA_UNAVAILABLE = "Pokt network summary data is unavailable.",
  POKT_DATA_UNAVAILABLE = "Pokt network data is unavailable.",
  CLIENT_DATA_UNAVAILABLE = "Pokt client data is unavailable.",
}

// TODO @Tate change this as needed to shared lib
export enum CustomerNodeServiceFailureReason {
  DATABASE_UNAVAILABLE= "Database is not available",
  INVALID_CID= "The client id is invalid",
}
