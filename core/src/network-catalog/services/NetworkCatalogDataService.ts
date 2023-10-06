import { Network } from "@blockspaces/shared/models/networks";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";
import { StripeService } from "../../stripe/services/StripeService";
import { NetworkOfferingDTO, NetworkPriceDto } from "@blockspaces/shared/dtos/network-catalog/NetworkPrice";
import ApiResult, { ApiResultWithError } from "@blockspaces/shared/models/ApiResult";
import { StripePrice, StripeProductPriceMetadata } from "../../stripe/types/StripeTypes";
import { NetworkOfferingAutoLinkDto, NetworkOfferingConfig, NetworkOfferingWithIntegrationsDto, NetworkOfferingWithIntegrationsPrice } from "@blockspaces/shared/dtos/network-catalog";
import { NetworkOffering, NetworkOfferingItem, NetworkOfferingRecurrence, NetworkPrice, NetworkPriceBillingUsageCode } from "@blockspaces/shared/models/network-catalog";
import { QuickbooksLineItemService } from "../../quickbooks/services/QuickbooksLineItemService";
import { QuickbooksLineItemResponse } from "../../quickbooks/types/QuickbooksTypes";
import { NetworkPriceBillingCategory, NetworkPriceBillingCodes } from "@blockspaces/shared/models/network-catalog/NetworkPriceBillingCatelog";
import { ValidationException } from "@aws-sdk/client-sns";
import { BillingTier } from "@blockspaces/shared/models/network-catalog/Tier";

/**
 * CRUD operations for Network (network catalog) data
 */
@Injectable()
export class NetworkCatalogDataService {
  constructor(private readonly db: ConnectDbDataContext, private readonly stripeServices: StripeService, private readonly quickbooksLineItemService: QuickbooksLineItemService) { }

  /** Get all networks, sorted  */
  async findAll(): Promise<Network[]> {
    return await this.db.networks.find({}).sort({ name: "asc" });
  }

  /** Get a network based on its ID */
  async findById(networkId: string): Promise<Network> {
    return await this.db.networks.findById(networkId);
  }

  async getNetworkCatalogCategories() {
    return await this.db.networkPriceBillingCategories.find({ active: true }).sort({ sortOrder: "asc" });;
  }

  /**
   * Get Prices for a given network
   * @param networkId 
   * @returns Returns a flat structure of prices for a given network.
   */
  async getPricesForNetwork(networkId: string, networkPrices: NetworkPrice[] = null): Promise<ApiResultWithError<Array<NetworkPriceDto>, string>> {
    // grab active connect network prices.
    if (!networkPrices) networkPrices = await this.db.networkPrices.find({ network: networkId, active: true }).populate("network");
    // grab stripe price catalog for given network
    const stripePriceResults = await this.stripeServices.listPricesByConnectNetworkId(networkId);
    if (stripePriceResults.isFailure) return ApiResultWithError.failure(stripePriceResults.message);

    // return mashed prices. Make sure the id returned to the client is internal connect network price id
    const pricesToReturn = networkPrices.filter(x => {
      const stripePriceObj = stripePriceResults.data.find(sp => sp.id === x.stripeId);
      return stripePriceObj;
    }).map((networkPrice) => {
      const stripePriceObj = stripePriceResults.data.find(sp => sp.id === networkPrice.stripeId);
      const recurrence = this.mapStripeRecurrenceToOfferingHelper(stripePriceObj?.recurring?.interval);
      const _meta = Reflect.ownKeys(stripePriceObj.metadata).filter((key: string) => key.indexOf("_") === 0).map((key: string, val) => ({ key: key, value: stripePriceObj.metadata[key] }))
        .reduce((obj, item) => Object.assign(obj, { [item.key]: item.value }), {});

      return {
        id: networkPrice._id.toString(),
        displayName: stripePriceObj.nickname,
        offer: stripePriceObj.metadata && stripePriceObj.metadata[StripeProductPriceMetadata.Offer] && stripePriceObj.metadata[StripeProductPriceMetadata.Offer].trim(),
        network: networkPrice.network._id,
        type: stripePriceObj.type,
        unitAmount: stripePriceObj.unit_amount_decimal ? (Number(stripePriceObj.unit_amount_decimal) / 100) : (stripePriceObj.unit_amount / 100),
        isMetered: stripePriceObj.recurring?.usage_type === "metered",
        recurrence: recurrence,
        metadata: _meta,
        tiers: stripePriceObj.tiers?.map(t => ({
          flatAmount: t.flat_amount,
          unitAmount: t.unit_amount,
          upTo: t.up_to,
          flatAmountDecimal: t.flat_amount_decimal ? Number(t.flat_amount_decimal) : null,
          unitAmountDecimal: t.unit_amount_decimal ? Number(t.unit_amount_decimal) : null,
        }))
      } as NetworkPriceDto;
    });

    return ApiResult.success(pricesToReturn);
  }


  /**
   * This is a temporary method to help link Stripe and connect database until we build an admin interface
   * Subject to change as they continue to iron out pricing model 
   */
  async autoLinkNetworkWithStripe(networkId: string, offerConfig: NetworkOfferingAutoLinkDto): Promise<ApiResultWithError<NetworkOffering[], string>> {
    const result: NetworkOffering[] = [];

    if (!offerConfig?.offerTitle) return ApiResultWithError.failure("offer title cannot be empty");
    if (!offerConfig?.description) return ApiResultWithError.failure("description cannot be empty");

    const tier = await this.db.billingTier.findOne({ code: offerConfig?.offerTitle });
    if (!tier) return ApiResultWithError.failure("tier not found");

    // grab network reference 
    const network = await this.findById(networkId);
    if (!network) return ApiResultWithError.failure("network not found");

    // grab all prices from stripe
    const stripePriceResults = await this.stripeServices.listPricesByStripeParentProductId(offerConfig.stripeProductId);
    if (stripePriceResults.isFailure) return ApiResultWithError.failure(stripePriceResults.message);

    // filter out price that arent for current context
    const stripePricesTrimmedByOffer = stripePriceResults.data.filter(x => x.active === true && x.metadata[StripeProductPriceMetadata.Network] === networkId && x.metadata[StripeProductPriceMetadata.Offer] === offerConfig.offerTitle);
    if (stripePricesTrimmedByOffer.length === 0) return ApiResultWithError.failure(`No prices found for offer: ${offerConfig.offerTitle}`);

    // validate stripe metadata
    const msg = stripePricesTrimmedByOffer
      .reduce((strArray, sp) => {
        if (sp.metadata[StripeProductPriceMetadata.Offer] === undefined)
          strArray.push(`id:${sp.id}, name:${sp.nickname}, missing metadata:${StripeProductPriceMetadata.Offer} `);
        if (sp.metadata[StripeProductPriceMetadata.Network] === undefined)
          strArray.push(`id:${sp.id}, name:${sp.nickname}, missing metadata:${StripeProductPriceMetadata.Network} `);
        if (sp.metadata[StripeProductPriceMetadata.QuickBooksItemSku] === undefined)
          strArray.push(`id:${sp.id}, name:${sp.nickname}, missing metadata:${StripeProductPriceMetadata.QuickBooksItemSku} `);
        if (sp.metadata[StripeProductPriceMetadata.BillingCategory] === undefined)
          strArray.push(`id:${sp.id}, name:${sp.nickname}, missing metadata:${StripeProductPriceMetadata.BillingCategory} `);
        if (sp.recurring?.usage_type === "metered" && sp.metadata[StripeProductPriceMetadata.BillingUsageCode] === undefined)
          strArray.push(`id:${sp.id}, name:${sp.nickname}, missing metadata:${StripeProductPriceMetadata.BillingUsageCode}. metered must have ${StripeProductPriceMetadata.BillingUsageCode}`);
        return strArray;
      }, [])
      .concat(';');
    if (msg.length > 1) return ApiResultWithError.failure(`${msg}`);




    // make sure we have a network price for each stripe price
    let networkPrices = await this.db.networkPrices.find({ network: networkId }).populate("network");
    const missingEntries = stripePricesTrimmedByOffer.filter((x) => !networkPrices.find(y => y.stripeId === x.id));

    // Need Quickbook's LineId's but we cant get them except through developer API's, so they wont exist as Stripe Metadata.
    const qboLineSkus = stripePricesTrimmedByOffer.map(item => item.metadata.quickBooksItemSku);
    const qbLineItems: QuickbooksLineItemResponse = await this.quickbooksLineItemService.getLineItemsBySku(qboLineSkus);
    if (qbLineItems.maxResults < 1) { return ApiResultWithError.failure("Cannot create Quickbooks Line Item Mapping to Stripe because no matching Line Items Found"); }


    // fetch billingCategories
    const billingCategories = await this.db.networkPriceBillingCategories.findAll();

    const createPromisees = missingEntries.map((sp: StripePrice) => {
      const qbLineItem = qbLineItems.Item.find(lineItem => lineItem.Sku === sp.metadata[StripeProductPriceMetadata.QuickBooksItemSku]);
      const billingCategoryCode = this.mapBillingCategory(sp.metadata[StripeProductPriceMetadata.BillingCategory]);
      const billingCategory = billingCategories.find(x => x.code === billingCategoryCode);
      return this.db.networkPrices.create({
        network: network,
        stripeId: sp.id,
        active: sp.active,
        quickBooksItemId: (qbLineItem as any)?.Id ?? null,
        isMetered: sp.recurring?.usage_type === "metered",
        billingUsageCode: sp.metadata && sp.metadata[StripeProductPriceMetadata.BillingUsageCode] && this.mapStringToNetworkPriceCode(sp.metadata[StripeProductPriceMetadata.BillingUsageCode].trim()),
        recurrence: this.mapStripeRecurrenceToOfferingHelper(sp?.recurring?.interval),
        billingCategory: billingCategory,
      });
    });
    await Promise.all(createPromisees);

    // rehydrate list
    networkPrices = await this.db.networkPrices.find({ network: networkId, active: true }).populate("network").populate("billingCategory");

    // group by offer, billingCategory & recurrence
    const offers = stripePricesTrimmedByOffer.reduce((results: { [key: string]: { offer: string, recurrence: string, billingCategory: NetworkPriceBillingCategory, items: NetworkOfferingItem[] } }, sp: StripePrice) => {
      const billingCategoryCode = this.mapBillingCategory(sp.metadata[StripeProductPriceMetadata.BillingCategory]);
      const billingCategory = billingCategories.find(x => x.code === billingCategoryCode);
      const offer = sp.metadata[StripeProductPriceMetadata.Offer];
      const recurrence = sp.recurring?.interval;
      const groupName = `${offer}-${recurrence}-${billingCategoryCode}`;
      if (!results[groupName]) results[groupName] = { offer, recurrence, billingCategory, items: [] };
      const price = networkPrices.find(x => x.stripeId === sp.id);
      if (price && price.active) {
        results[groupName].items.push({
          price: price
        } as NetworkOfferingItem);
      }
      return results;
    }, {});

    // loop through result and create network Offering
    for (const [key, value] of Object.entries(offers)) {
      const offerTitle = value.offer;
      const recurrence = this.mapStripeRecurrenceToOfferingHelper(value.recurrence);
      const items = value.items;
      // Check if we already have the offering created.
      let networkOffering = (await this.db.networkOfferings.findOne({ network: networkId, active: true, title: offerTitle, recurrence: recurrence, billingCategory: value.billingCategory._id })
        .populate("items.price")
        .populate("billingCategory")
      )?.toObject<NetworkOffering>();
      if (!networkOffering) {
        // if the offer is not created, create the offer and add map prices
        networkOffering = await this.db.networkOfferings.create({
          title: offerTitle,
          billingCategory: value.billingCategory,
          network: network,
          recurrence: recurrence,
          active: true,
          description: offerConfig.description,
          items: items,
          billingTier: tier
        });
      } else {
        // update
        networkOffering.description = offerConfig.description;
        networkOffering.items = items;
        networkOffering = (await this.db.networkOfferings.updateByIdAndSave(networkOffering._id, networkOffering)).toObject();
      }

      result.push(networkOffering);
    }

    return ApiResultWithError.success(result);


  }


  /**
   * This is a temporary method to help Create Stripe ,Quickbooks & connect Network Prices 
   */
  async createNetworkOfferingWithIntegrations(data: NetworkOfferingConfig) {
    const billingCategories = await this.db.networkPriceBillingCategories.findAll();
    const tiers = await this.db.billingTier.findAll();
    // check if product is created in Stripe
    const stripeProductResult = await this.stripeServices.findProductByName(data.stripeProductName);
    let stripeProduct = stripeProductResult.data;
    if (!stripeProduct) {
      const createStripeProductResult = await this.stripeServices.createProduct({
        name: data.stripeProductName,
        active: true,
        description: data.stripeProductDescription
      });
      stripeProduct = createStripeProductResult.data;
    }
    let results = [];
    for await (const x of data.items) {
      const d = await this.createNetworkOfferingWithIntegrationsHelper(stripeProduct, data, x, billingCategories, tiers);
      results.push(d.data);
    }
    return results;
  }


  /**
   * get offerings for a given network, to be used in UI
   * @param networkId 
   * @returns  Return Array of offerings for a given network, to be used in UI
   */
  async getNetworkOfferingsForCart(networkId: string, billingCategoryId: string): Promise<ApiResultWithError<NetworkOfferingDTO[], string>> {
    const networkOfferings = await this.db.networkOfferings.find({ network: networkId, active: true, billingCategory: billingCategoryId })
      .populate({ path: "items.price" }).populate("billingTier").populate("billingCategory");
    const networkPrices = await this.getPricesForNetwork(networkId);
    if (networkPrices.isFailure) return ApiResultWithError.failure(networkPrices.message);
    const results = networkOfferings.map((offer): NetworkOfferingDTO => ({
      id: offer._id,
      recommended: offer.recommended,
      title: offer.title,
      description: offer.description,
      network: offer.network as any,
      billingCategory: offer.billingCategory as any,
      tier: offer.billingTier as any,
      recurrence: offer.recurrence,
      items: offer.items.map((item) => {
        const np = networkPrices.data?.find((np: NetworkPriceDto) => np.id === item.price._id.toString());
        return np;
      })
    }));
    return ApiResultWithError.success(results);
  }

  async getNetworkOfferings(): Promise<NetworkOffering[]> {
    return await this.db.networkOfferings.find({ active: true }, {}, { populate: ["billingTier", "billingCategory"] }).sort({ network: "asc" });
  }

  /**
   * Get List of active network offering by network id
   * @param networkId 
   * @returns 
   */
  async getActiveNetworkOfferingsByNetworkId(networkId: string): Promise<NetworkOffering[]> {
    const offers = await this.db.networkOfferings.find({ network: networkId, active: true }, {}, { populate: ["billingCategory", "billingTier"] });
    if (!offers) throw new NotFoundException(`no offers found for networkId:${networkId}`);
    return offers;
  }

  private async createNetworkOfferingWithIntegrationsHelper(stripeProduct, config: NetworkOfferingConfig, item: NetworkOfferingWithIntegrationsDto
    , billingCategories: Array<NetworkPriceBillingCategory>, tiers: BillingTier[])
    : Promise<ApiResultWithError<NetworkOffering, string>> {

    // #region pre check validation
    const billingCategory = billingCategories.find(x => x.code === item.billingCategoryCode);
    if (!billingCategory) return ApiResultWithError.failure(`billingCategory: ${item.billingCategoryCode}, not found `);

    const billingTier = tiers.find(x => x.code === item.billingTierCode);
    if (!billingTier) return ApiResultWithError.failure(`billingTier: ${item.billingTierCode}, not found `);

    const network = await this.findById(item.networkId);
    if (!network) return ApiResultWithError.failure("network not found");

    let networkOffering = (await this.db.networkOfferings.findOne({
      network: item.networkId,
      active: true,
      title: item.offerTitle,
      recurrence: item.recurrence,
      billingCategory: billingCategory,
      billingTier: billingTier
    })
      .populate("items.price")
      .populate("billingCategory")
    )?.toObject<NetworkOffering>();

    if (networkOffering) return ApiResultWithError.failure(`Already have a offer created for network: ${item.networkId} title: ${item.offerTitle} billingCategoryCode${item.billingCategoryCode}`);

    // #endregion

    // #region Quickbooks
    // create/get quickbooks items
    const getQboItemName = (item) => `${config.stripeProductName}-${item.nickName}`
    const qboLineItemNames = item.prices.map(item => getQboItemName(item));
    let qbLineItems: QuickbooksLineItemResponse = await this.quickbooksLineItemService.getLineItemsByName(qboLineItemNames);
    const missingQBoLineItems: NetworkOfferingWithIntegrationsPrice[] = item.prices.filter((x) => !qbLineItems?.Item?.find(y => y.Name === getQboItemName(x)));


    const createQboLineItems = missingQBoLineItems.map(async (x) => await this.quickbooksLineItemService.createLineItem({
      Name: getQboItemName(x),
      Sku: getQboItemName(x).toLowerCase().trim()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, ''),
      IncomeAccountRef: {
        value: config.qboIncomeAccount.toString(),
      },
      Type: 'Service'
    }));

    await Promise.all(createQboLineItems);

    // re-hydrate list
    if (missingQBoLineItems.length > 0) {
      qbLineItems = await this.quickbooksLineItemService.getLineItemsByName(qboLineItemNames);
    }

    // #endregion


    // #region Stripe

    // check stripe prices
    let stripePricesResults = await this.stripeServices.listPricesByStripeParentProductId(stripeProduct.id);
    let stripePrices = stripePricesResults.data;
    const missingStripeEntries: NetworkOfferingWithIntegrationsPrice[] = item.prices.filter((x) => !stripePrices?.find(y => y.nickname === x.nickName));

    const createMissingProducts = missingStripeEntries.map(async (x: NetworkOfferingWithIntegrationsPrice) => {
      const qbLineItem = qbLineItems.Item.find(lineItem => lineItem.Name === getQboItemName(x));
      return await this.stripeServices.createProductPrice({
        active: true,
        currency: "usd",
        nickname: x.nickName,
        recurring: {
          interval: `month`,
          aggregate_usage: x.isMetered ? "sum" : undefined,
          interval_count: 1,
          trial_period_days: 0,
          usage_type: x.isMetered ? 'metered' : 'licensed'
        },
        unit_amount_decimal: (x.price * 100).toString(),
        product: stripeProduct.id,
        metadata: {
          [`${StripeProductPriceMetadata.BillingUsageCode}`]: x.billingUsageCode,
          [`${StripeProductPriceMetadata.BillingCategory}`]: billingCategory.code,
          [`${StripeProductPriceMetadata.Network}`]: item.networkId,
          [`${StripeProductPriceMetadata.Offer}`]: item.offerTitle,
          [`${StripeProductPriceMetadata.QuickBooksItemId}`]: qbLineItem.Id,
          [`${StripeProductPriceMetadata.QuickBooksItemSku}`]: qbLineItem.Sku,
        }
      });
    });

    await Promise.all(createMissingProducts);

    // re-hydrate list
    if (createMissingProducts.length > 0) {
      stripePricesResults = await this.stripeServices.listPricesByStripeParentProductId(stripeProduct.id);
      stripePrices = stripePricesResults.data;

      if (!stripePrices || stripePrices.length === 0) return ApiResultWithError.failure("Error stripe prices");
    }
    // #endregion


    // #region Network Prices
    let networkPrices = await this.db.networkPrices.find({ network: item.networkId, active: true }).populate("network").populate("billingCategory");
    const missingNetworkPriceEntries = stripePrices.filter((x) => !networkPrices.find(y => y.stripeId === x.id));

    const createNetworkPricesPromisees = missingNetworkPriceEntries.map((sp: StripePrice) => {
      const qbLineItem = qbLineItems.Item.find(lineItem => lineItem.Id === sp.metadata[StripeProductPriceMetadata.QuickBooksItemId]);
      const billingCategoryCode = this.mapBillingCategory(sp.metadata[StripeProductPriceMetadata.BillingCategory]);
      const billingCategory = billingCategories.find(x => x.code === billingCategoryCode);
      return this.db.networkPrices.create({
        network: network,
        stripeId: sp.id,
        active: sp.active,
        quickBooksItemId: (qbLineItem as any)?.Id ?? null,
        isMetered: sp.recurring?.usage_type === "metered",
        billingUsageCode: sp.metadata && sp.metadata[StripeProductPriceMetadata.BillingUsageCode] && this.mapStringToNetworkPriceCode(sp.metadata[StripeProductPriceMetadata.BillingUsageCode].trim()),
        recurrence: this.mapStripeRecurrenceToOfferingHelper(sp?.recurring?.interval),
        billingCategory: billingCategory,
      });
    });
    await Promise.all(createNetworkPricesPromisees);

    // rehydrate list
    if (missingNetworkPriceEntries.length > 0) networkPrices = await this.db.networkPrices.find({ network: item.networkId, active: true }).populate("network").populate("billingCategory");

    // #endregion

    const priceNicknames = item.prices.map(x => x.nickName);
    // create network offering
    networkOffering = await this.db.networkOfferings.create({
      title: item.offerTitle,
      billingCategory: billingCategory,
      billingTier: billingTier,
      network: network,
      recurrence: item.recurrence,
      active: true,
      recommended: item.recommended,
      description: item.description,
      items: networkPrices.filter(x => stripePrices.find(y => (y.id === x.stripeId && priceNicknames.indexOf(y.nickname) > -1))).map(x => ({ price: x })),
    });

    return ApiResultWithError.success(networkOffering);
  }

  private mapStripeRecurrenceToOfferingHelper(stripeRecurrence: string): NetworkOfferingRecurrence {
    let results = NetworkOfferingRecurrence.monthly;
    switch (stripeRecurrence) {
      case "week":
        {
          results = NetworkOfferingRecurrence.weekly;
        }
        break;
      case "month":
        {
          results = NetworkOfferingRecurrence.monthly;
        }
        break;
      case "year":
        {
          results = NetworkOfferingRecurrence.yearly;
        }
        break;
      default:
        break;
    }
    return results;
  }

  private mapStringToNetworkPriceCode(str: string): NetworkPriceBillingUsageCode {
    let results = null;

    switch (str) {
      case NetworkPriceBillingUsageCode.LNC_LIQUIDITY_RENTAL:
        results = NetworkPriceBillingUsageCode.LNC_LIQUIDITY_RENTAL;
        break;
      case NetworkPriceBillingUsageCode.LNC_TRANSACTION:
        results = NetworkPriceBillingUsageCode.LNC_TRANSACTION;
        break;
      case NetworkPriceBillingUsageCode.DEV_ENDPOINT_TRANSACTION:
        results = NetworkPriceBillingUsageCode.DEV_ENDPOINT_TRANSACTION;
        break;

    }
    return results;
  }

  private mapBillingCategory(str: string): NetworkPriceBillingCodes {
    let results = null;

    switch (str) {
      case NetworkPriceBillingCodes.Infrastructure:
        results = NetworkPriceBillingCodes.Infrastructure;
        break;
      case NetworkPriceBillingCodes.MultiWebApp:
        results = NetworkPriceBillingCodes.MultiWebApp;
        break;

    }
    return results;
  }
}