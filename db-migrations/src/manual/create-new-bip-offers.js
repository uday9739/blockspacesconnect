/*
Script to be run inside on Mongo CLI.

Replace Items for given environment 
*/

//#region  reference to data
const currentBipOfferingToDeactiveId = "6388ce96cb9ff87c65f9b283"; // TODO REPLACE
const networkId = "lightning";
const billingCategoryCode = "MultiWebApp";
const professionalTierCode = "Professional";
const enterpriseTierCode = "Enterprise";
const basicTierCode = "Basic";

// Enterprise
const enterpriseServiceFeeStripeId = "price_1MorDIC8l7Z8TnDSZzcRwxbV"; // TODO REPLACE
const enterpriseTransactionFeeStripeId = "price_1MorDIC8l7Z8TnDS3DgGqLb3"; // TODO REPLACE
const enterpriseServiceFeeQboId = "116"; // TODO REPLACE
const enterpriseTransactionFeeQboId = "119"; // TODO REPLACE
// Professional
const professionalServiceFeeStripeId = "price_1MorDJC8l7Z8TnDSD27fbvbO"; // TODO REPLACE
const professionalTransactionFeeStripeId = "price_1MorDIC8l7Z8TnDSA6XFtFJE"; // TODO REPLACE
const professionalServiceFeeQboId = "115"; // TODO REPLACE
const professionalTransactionFeeQboId = "118"; // TODO REPLACE
// Basic
const basicServiceFeeStripeId = "price_1MorDJC8l7Z8TnDS4alBSfNz"; // TODO REPLACE
const basicTransactionFeeStripeId = "price_1MorDJC8l7Z8TnDSOJ036sRs"; // TODO REPLACE
const basicServiceFeeQboId = "114"; // TODO REPLACE
const basicTransactionFeeQboId = "117"; // TODO REPLACE

const MultiWebAppCat = db.getCollection("networkpricebillingcategories").findOne({ code: billingCategoryCode });
//#endregion

//#region mark current offer inacitve
db.getCollection("networkofferings").updateOne(
  { _id: ObjectId(currentBipOfferingToDeactiveId) },
  {
    $set: {
      active: false
    }
  },
  { upsert: false }
);
//#endregion

//#region  Enterprise
const enterpriseTier = db.getCollection("billingtiers").findOne({ code: enterpriseTierCode });
const enterpriseNetworkPricesPayload = [
  {
    network: networkId,
    active: true,
    stripeId: enterpriseTransactionFeeStripeId,
    quickBooksItemId: enterpriseTransactionFeeQboId,
    isMetered: true,
    billingUsageCode: "LNC_TRANSACTION",
    recurrence: "monthly",
    billingCategory: MultiWebAppCat._id
  },
  {
    network: networkId,
    active: true,
    stripeId: enterpriseServiceFeeStripeId,
    quickBooksItemId: enterpriseServiceFeeQboId,
    isMetered: false,
    recurrence: "monthly",
    billingCategory: MultiWebAppCat._id
  }
];
const enterpriseNetworkPrices = db.getCollection("networkprices").insertMany(enterpriseNetworkPricesPayload);
const enterpriseOfferPayload = {
  network: networkId,
  active: true,
  title: "Enterprise",
  description: "Bitcoin Invoicing & Payments",
  recurrence: "monthly",
  items: [
    {
      price: enterpriseNetworkPrices.insertedIds[0]
    },
    {
      price: enterpriseNetworkPrices.insertedIds[1]
    }
  ],
  billingCategory: MultiWebAppCat._id,
  billingTier: enterpriseTier._id
};
const enterpriseOffer = db.getCollection("networkofferings").insertOne(enterpriseOfferPayload);
//#endregion

//#region Professional
const professionalTier = db.getCollection("billingtiers").findOne({ code: professionalTierCode });
const professionalNetworkPricesPayload = [
  {
    network: networkId,
    active: true,
    stripeId: professionalTransactionFeeStripeId,
    quickBooksItemId: professionalTransactionFeeQboId,
    isMetered: true,
    billingUsageCode: "LNC_TRANSACTION",
    recurrence: "monthly",
    billingCategory: MultiWebAppCat._id
  },
  {
    network: networkId,
    active: true,
    stripeId: professionalServiceFeeStripeId,
    quickBooksItemId: professionalServiceFeeQboId,
    isMetered: false,
    recurrence: "monthly",
    billingCategory: MultiWebAppCat._id
  }
];
const professionalNetworkPrices = db.getCollection("networkprices").insertMany(professionalNetworkPricesPayload);
const professionalOfferPayload = {
  network: networkId,
  active: true,
  recommended: true,
  title: "Professional",
  description: "Bitcoin Invoicing & Payments",
  recurrence: "monthly",
  items: [
    {
      price: professionalNetworkPrices.insertedIds[0]
    },
    {
      price: professionalNetworkPrices.insertedIds[1]
    }
  ],
  billingCategory: MultiWebAppCat._id,
  billingTier: professionalTier._id
};
const professionalOffer = db.getCollection("networkofferings").insertOne(professionalOfferPayload);
//#endregion

//#region  Basic
const basicTier = db.getCollection("billingtiers").findOne({ code: basicTierCode });
const basicNetworkPricesPaylod = [
  {
    network: networkId,
    active: true,
    stripeId: basicTransactionFeeStripeId,
    quickBooksItemId: basicTransactionFeeQboId,
    isMetered: true,
    billingUsageCode: "LNC_TRANSACTION",
    recurrence: "monthly",
    billingCategory: MultiWebAppCat._id
  },
  {
    network: networkId,
    active: true,
    stripeId: basicServiceFeeStripeId,
    quickBooksItemId: basicServiceFeeQboId,
    isMetered: false,
    recurrence: "monthly",
    billingCategory: MultiWebAppCat._id
  }
];
const basicNetworkPrices = db.getCollection("networkprices").insertMany(basicNetworkPricesPaylod);
const basicOfferPayload = {
  network: networkId,
  active: true,
  title: "Basic",
  description: "Bitcoin Invoicing & Payments",
  recurrence: "monthly",
  items: [
    {
      price: basicNetworkPrices.insertedIds[0]
    },
    {
      price: basicNetworkPrices.insertedIds[1]
    }
  ],
  billingCategory: MultiWebAppCat._id,
  billingTier: basicTier._id
};
const basicOffer = db.getCollection("networkofferings").insertOne(basicOfferPayload);
//#endregion
