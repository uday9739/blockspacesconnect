import axios from "axios"
import { isErrorStatus } from "@blockspaces/shared/helpers/http";
import ApiResult, { ApiResultStatus } from "@blockspaces/shared/models/ApiResult";
import { LightningNodeReference, LightningNodeTier } from "@blockspaces/shared/models/lightning/Node";
import { getApiUrl } from "@src/platform/utils";
import { GenSeedResponseDto } from "@blockspaces/shared/dtos/lightning";
import { UnlockNodeResponse } from "@blockspaces/shared/dtos/lightning/unlock-node";
import { InitNodeResponseDto } from "@blockspaces/shared/dtos/lightning/init-node";
import { getMacaroonFromStorage, setMacaroonToStorage } from "../utils/macaroon";
import { ChannelPoint, Payment } from "@blockspaces/shared/proto/lnrpc/lightning_pb";
import { SendCoinsResponse } from "@blockspaces/shared/models/lightning/Wallet"
import { encrypt, decrypt } from "@blockspaces/shared/encryption/AesLibraryWrapper"
import { getRecommendedFees } from "./transport";
import * as lndAxios from "@lightning/utils/http"
import { PayInvoiceBody } from "@blockspaces/shared/models/lightning/Invoice";
import { PaymentErrors } from "@blockspaces/shared/models/lightning/Payments"

/**
 * Queries MongoDB for a node in the `lightningnodes` collection for a node with only the `apiEndpoint` and `nodeId` properties.
 * This then claims the node for the user with their tenant id to continue the onboarding process.
 *
 * @throws Returns null if there is no node available.
 * @returns A node document that is now tied to the users tenant id.
 */
export async function claimNodeForUser(): Promise<LightningNodeReference> {
  const response = await axios.get(
    getApiUrl("networks/lightning/onboard/claim-node"),
  );
  if (isErrorStatus(response.status)) return null;
  return response.data?.data;
}

/**
 * Add new LightningNode to mongo
 *
 * @param tenantId
 * @returns Promise<LightningNodeReference>
 */
export async function createNodeDoc(tenantId: string): Promise<ApiResult<LightningNodeReference>> {
  // Get node from pool collection and use to create node (api url, cert?)
  // GET nodeData where taken = false
  // UPDATE Node that it is taken

  const body = { tenantId /**, the rest from pool collection */ };

  // Assign node to tenant
  const result = await axios.post<ApiResult<LightningNodeReference>>(getApiUrl("/networks/lightning/node"), body);
  return ApiResult.fromJson(result.data);
}

/**
 * Update a node document when information of type @link `LightningNodeReference` needs updated.
 *
 * @param query An object to update a node document
 */
export async function updateNodeDoc(nodeId: string, patch: Partial<LightningNodeReference>): Promise<ApiResult<LightningNodeReference>> {
  const result = await axios.request<ApiResult<LightningNodeReference>>({
    method: 'PUT',
    url: getApiUrl(`/networks/lightning/node/${nodeId}`),
    data: patch,
  }
  );
  return ApiResult.fromJson(result.data);
}

/**
 * Generates a 24 word seed phrase to be used to initialize a node.
 *
 * @returns A 24 word mnemonic.
 */
export async function generateSeedPhrase(url: string, cert: string): Promise<GenSeedResponseDto> {
  const seed = await lndAxios.get<GenSeedResponseDto>(url, "/v1/genseed", cert, "")
  return seed.data
}

/**
 * Attempts to unlock a node (takes place after a restart).
 *
 * @returns Promise<UnlockNodeResponse>.
 */
export async function unlockNode(url: string, password: string, nodeId: string, cert: string): Promise<UnlockNodeResponse> {
  const passBase64 = Buffer.from(password).toString("base64")
  const body = {
    wallet_password: passBase64,
    stateless_init: true
  }
  try {
    await lndAxios.post(url, "/v1/unlockwallet", cert, "", body)

    // Check for admin macaroon, if we don't have it get from vault.
    const macaroon = getMacaroonFromStorage(nodeId);

    // If we have the mac from local storage, double check if it's actually in vault;
    if (macaroon && !await isMacaroonInVault(password, nodeId)) {
      // const storeMacInVault = await storeMacaroonInVault(result.data.admin_macaroon, password);
      const encodedMac = Buffer.from(macaroon, 'hex').toString('base64');
      const res = await storeMacaroonInVault(encodedMac, password);

      // Validate it's in vault properly
      await getMacaroonFromVault(password, nodeId);
    }

    // if we have the mac, but it's not in vault, add it to vault
    if (!macaroon) getMacaroonFromVault(password, nodeId)

    return { status: 'unlocked' };
  } catch (e) {
    if (e.response?.data?.message.startsWith('wallet already unlocked')) {
      return { status: 'unlocked' }
    } else {
      return { status: "locked" }
    }
  }
}

export async function isMacaroonInVault(password: string, nodeId: string): Promise<boolean> {
  const res = await getMacaroonFromVault(password, nodeId).catch(_ => {
    console.error('Mac NOT in vault');
    return null
  });
  return res !== null;
}

export async function getMacaroon(password: string, nodeId: string, connect?:boolean): Promise<{macaroon: string, seed: string[]}> {
  // If we are calling from connect, check storage.
  if (!connect) {
    const mac = getMacaroonFromStorage(nodeId);
    if (mac) return {macaroon: mac, seed: []};
  }
  if (!password) {
    console.warn('Password Missing, Call will fail');
  }
  const result = await getMacaroonFromVault(password, nodeId, connect);
  return result;
}
/**
 * Initialize the node with a wallet and connect to the network.
 *
 * @param seedPhrase The seed phrase generated from @link `generateSeedPhrase`
 * @param password The wallet password for the node
 * @returns The admin macaroon to be used for requests when the node wallet is unlocked.
 */
export async function initializeNodeAndStoreMac(url: string, seedPhrase: string[], password: string, cert: string, nodeId: string): Promise<InitNodeResponseDto> {
  // Convert to Base64 for REST LND interface
  const passBase64 = Buffer.from(password).toString("base64")
  const body = { wallet_password: passBase64, cipher_seed_mnemonic: seedPhrase, stateless_init: true };
  const result = await lndAxios.post<InitNodeResponseDto>(url, "/v1/initwallet", cert, "", body)

  // Store in Vault and store in local storage
  const storeMacInVault = await storeMacaroonInVault(result.data.admin_macaroon, password);
  if (storeMacInVault.status === ApiResultStatus.Failed) console.error('initialize node failed, store mac in vault');
  const getMacAndStoreInLocalStorage = await getMacaroonFromVault(password, nodeId);
  if (!getMacAndStoreInLocalStorage) console.error('initialize node failed, store mac in vault');

  return result.data;
}
/**
 * Stores a given encrypted macaroon in the Vault.
 *
 * @param user The current logged in user making the request.
 * @param macaroon The encrypted macaroon to store.
 * @returns The `macaroonId` that is stored in the MongoDB node collection.
 */
export async function storeMacaroonInVault(macaroon: string, password: string, seed?:string[]): Promise<ApiResult<string>> {
  // Encrypt the macaroon
  const encryptedMacaroon = encrypt(macaroon, password);
  let encryptedSeed
  if (seed) encryptedSeed = encrypt(JSON.stringify(seed), password)
  const body = { macaroon: encryptedMacaroon, seed: encryptedSeed };
  // Store to Vault
  const result = await axios.post<ApiResult<string>>(getApiUrl("/networks/lightning/auth"), body);
  return ApiResult.fromJson(result.data);
}

/**
 * Gets the encrypted macaroon from Vault, decrypts it, and stores it in local storage.
 *
 * @param user The current logged in user making the request.
 * @returns The encrypted macaroon stored in vault.
 */
export async function getMacaroonFromVault(password: string, nodeId: string, connect?:boolean): Promise<{macaroon:string,seed:string[]}> {
  if (!password) console.warn('PASSWORD IS MISSING! Mac decryption will fail');
  // Retrieve the encrypted macaroon from Vault
  const response = await axios.get(getApiUrl("/networks/lightning/auth"));
  const encryptedMacaroon = response?.data?.data?.macaroon ?? null;
  const encryptedSeed = response?.data?.data?.seed ?? null;
  if (!encryptedMacaroon) throw Error('retrieve mac failed');
  // Decrypt the macaroon
  const decryptedMacaroon = decrypt(encryptedMacaroon.encryptedData, encryptedMacaroon.iv, password);
  if (!decryptedMacaroon) throw Error("Incorrect password")

  let seed: string[]
  if (encryptedSeed) {
    const decryptedSeed = decrypt(encryptedSeed.encryptedData, encryptedSeed.iv, password);
    seed = JSON.parse(decryptedSeed)
  }
  const macaroon = Buffer.from(decryptedMacaroon, "base64").toString("hex")
  // Set the macaroon in local storage if we are not on connect
  if (!connect) {
    setMacaroonToStorage(macaroon, nodeId)
  }
  return {macaroon, seed};
}

/**
 * Generate the BSC macaroon which gives `core` access to readonly/invoice information.
 *
 * @param url The url of the clients node.
 * @param nodeId The node id to update the mongo collection.
 * @returns Boolean if it was generated and stored in the node collection.
 */
export async function generateBscMacaroon(url: string, cert: string, nodeId: string): Promise<string> {
  // Set the permissions that we want to give this macaroon access to
  const body = {
    permissions: [
      { entity: "onchain", action: "read" },
      { entity: "invoices", action: "read" },
      { entity: "invoices", action: "write" },
      { entity: "address", action: "read" },
      { entity: "address", action: "write" },
      { entity: "info", action: "read" },
      { entity: "peers", action: "read" },
      { entity: "offchain", action: "read" },
      { entity: "macaroon", action: "read"}
    ]
  };

  // const array: Uint8Array = new Uint8Array(Buffer.from(JSON.stringify(body)));

  // Get the macaroon from local storage, if not found return false
  const macaroon = getMacaroonFromStorage(nodeId);
  if (!macaroon) return;

  // Call the node to generate the macaroon
  const response = await lndAxios.post<{macaroon: string}>(url, "/v1/macaroon", cert, macaroon, JSON.stringify(body))

  //  Store the macaroon in the node data store
  // await updateNodeDoc(nodeId, { bscMacaroon: response.data.macaroon });

  return response.data.macaroon;
}

export async function generateBscMacAndUpdateDocWithPubkey(url: string, nodeId: string, cert: string): Promise<boolean> {
  // generate bsc mac
  const bscMacaroon = await generateBscMacaroon(url, cert, nodeId);
  if (!bscMacaroon) throw new Error("bsc macaroon not generated");

  const info = await lndAxios.get<{identity_pubkey: string}>(url, "/v1/getinfo", cert, bscMacaroon)
  await updateNodeDoc(nodeId, { pubkey: info.data.identity_pubkey, bscMacaroon: bscMacaroon });
  return true
}

/**
 * Send Bitcoin from the node's internal wallet to another wallet.
 * 
 * @param url Node api endpoint
 * @param amount of sats to send
 * @param address of the wallet to spend to
 * @returns 
 */
export async function withdrawBitcoin(url:string, address:string, amount:number, cert: string, nodeId: string, send_all?:boolean): Promise<{success: boolean, message: string, payment: SendCoinsResponse}> {
  const fees = await getRecommendedFees()
  let body: any = {addr: address, sat_per_vbyte: fees.fastestFee}
  send_all ? body = {send_all: true, ...body} : body = { amount: amount, ...body}
  const macaroon = getMacaroonFromStorage(nodeId)
  if (!macaroon) {
    return {success: false, message: PaymentErrors.NO_MACARAROON, payment: null}
  }

  const result = await lndAxios.post<SendCoinsResponse>(url, "/v1/transactions", cert, macaroon, body)

  // If payment fails return the failure details.
  if (isErrorStatus(result.status)) {
    return {success: false, message: "Withdraw failed.", payment: null}
  }
  return {success: true, message: "Withdraw successful!", payment: result.data}
}



/**
 * Pays a BOLT 11 invoice.
 *
 * @param url The url of the clients node.
 * @param paymentRequest The BOLT 11 payment request to pay.
 * @param feeLimit The maximum number of sats for a fee that will be accepted. 
 * @returns GRPC stream of the payment events. (IN FLIGHT | SUCCESS | CANCELLED)
 */
export async function payBolt11Invoice(url: string, paymentRequest: string, feeLimitPercent: number = 1, cert: string, nodeId: string): Promise<{success: boolean, message: string, payment: any}> {
  const body = buildPayInvoiceBody(paymentRequest);

  // Get the admin macaroon from storage.
  const macaroon = getMacaroonFromStorage(nodeId);
  if (!macaroon) {
    return {success: false, message: PaymentErrors.NO_MACARAROON, payment: null}
  }

  const result = await lndAxios.post<any>(url, "/v2/router/send", cert, macaroon, body)

  // If payment fails parse and return the failure details.
  if (isErrorStatus(result.status)) {
    const errorMessage = mapPayInvoiceError(result.data.error);
    return {success: false, message: errorMessage, payment: null}
  }

  // Sometimes LND returns a success even though the payment failed.
  return assertInvoiceWasPaid(result.data.result);
}

// Sometimes LND returns a success even though the payment failed.
function assertInvoiceWasPaid(result: any) {
  if (result.failure_reason === "FAILURE_REASON_NO_ROUTE") {
    return {success: false, message: PaymentErrors.NO_ROUTE, payment: null}
  } else if (result.failure_reason === "FAILURE_REASON_INSUFFICIENT_BALANCE") {
    return {success: false, message: PaymentErrors.INSUFFICIENT_BALANCE, payment: null}
  }
  return {success: true, message: "Payment successful!", payment: null}
}

// Parse invoice errors
function mapPayInvoiceError(error: {code: number, message: string, details: []}): string {
  switch (error.code) {
    case 1:
      return PaymentErrors.PAYMENT_TIMED_OUT
    case 2:
      if (error.message.includes("self-payments")) return PaymentErrors.CANNOT_PAY_SELF
      return PaymentErrors.ZERO_VALUE_INVOICE
    case 3:
      return PaymentErrors.CANT_READ_INVOICE
    case 4:
      return PaymentErrors.CANT_READ_INVOICE
    case 5: 
      return PaymentErrors.INSUFFICIENT_BALANCE
    case 6:
      return PaymentErrors.ALREADY_PAID
    default:
      return PaymentErrors.PAYMENT_FAILED
  }
}

function buildPayInvoiceBody(paymentRequest: string): PayInvoiceBody {
  return {
    payment_request: paymentRequest,
    timeout_seconds: 15,
    fee_limit_sat: 25_000,
    no_inflight_updates: true
  }
}

/**
 * Track a BOLT 11 invoice.
 *
 * @param url The url of the clients node.
 * @param paymentHash The payment hash of the invoice payment request to pay.
 * @param noInflightUpdates return JUST the final htlc update.
 * 
 * @returns res 
 */
export async function trackBolt11(url: string, paymentHash: string, noInflightUpdates: boolean = true, cert: string, nodeId: string): Promise<ApiResult<Payment.AsObject>> {
  try {
    // Get the admin macaroon from storage.
    const macaroon = getMacaroonFromStorage(nodeId);
    if (!macaroon) return;
    const paymentHash64 = Buffer.from(paymentHash, 'hex').toString("base64")
    const result = await lndAxios.get<any>(url, `/v2/router/track/${paymentHash64}`, cert, macaroon, { no_inflight_updates: noInflightUpdates })

    // If payment fails return the failure details.
    if (isErrorStatus(result.status) || result?.data?.result?.status === 'FAILED') {
      return ApiResult.failure("Tracking payment failed.", result.data);
    }
    return ApiResult.success(result.data.result);

  } catch (e) {
    const errorMessage =
      e?.response?.data?.message ??
      e?.response?.data?.error?.message ??
      e.message;

    throw new Error(errorMessage);
  }
}

/**
 * Opens a new channel to a specified peer with a funding amount and fee rate.
 *
 * @param url The url of the clients node.
 * @param node_pubkey The node we want to open a channel with.
 * @param sat_per_vbyte Fee rate to open a channel, ~2 sat/vByte is a good default.
 * @param local_funding_amount How much Bitcoin we want to open the channel in sats.
 * @param push_sat How many sats we want to give the other party. Default should be 0.
 * @param private If we want the channel private or not.
 * @returns The funding transaction id.
 */
export async function openChannel(url: string, nodeId: string, node_pubkey: string, sat_per_vbyte: number, local_funding_amount: number, push_sat: number, privateChannel: boolean, cert: string): Promise<ChannelPoint.AsObject> {
  // Get the macaroon
  const macaroon = getMacaroonFromStorage(nodeId);

  const body = { node_pubkey_string: node_pubkey, sat_per_vbyte: sat_per_vbyte, local_funding_amount: local_funding_amount, push_sat: push_sat, private: privateChannel };

  // const result = await axios.post(url, body, {
  //   url: "/v2/router/send",
  //   headers: {
  //     "Grpc-Metadata-macaroon": macaroon
  //   }
  // });

  const result = await lndAxios.post<any>(url, "/v2/router/send", cert, macaroon, body)

  // If payment fails return the failure details.
  if (isErrorStatus(result.status)) {
    return;
  }

  // Update the node doc with the channel id
  await updateNodeDoc(nodeId, { outgoingChannelId: result.data.funding_txid_str });

  return result.data;
}