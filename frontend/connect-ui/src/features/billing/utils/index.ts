import { ConnectSubscriptionItemExpandedDto } from "@blockspaces/shared/dtos/connect-subscription/ConnectSubscriptionDto";
import { ConnectSubscriptionItemStatus, ConnectSubscriptionRecurrence } from "@blockspaces/shared/models/connect-subscription/ConnectSubscription";
import { countryNames } from "@blockspaces/shared/models/Countries";
import { Network } from "@blockspaces/shared/models/networks";
import { IUser } from "@blockspaces/shared/models/users";
import { IOption } from "@src/platform/components/common";
import { DateTime } from "luxon";

export const _getUiFormattedFiatTotal = (amount) => {
  return `USD ${_getUiFormatted$Total(amount)}`
}

export const _getUiFormatted$Total = (amount) => {
  return `$${(Math.round(amount * 100) / 100).toFixed(2)}`
}

export const _getUiDate = (datetime: number) => {
  return new Date(datetime).toLocaleDateString();
};

export const _getUiDateFormatted = (datetime: number) => {
  return DateTime.fromMillis(datetime).toLocaleString(DateTime.DATE_MED);
};

export const _getNetworkServiceToolTip = (network: Network, statusOverride: string) => {
  let msg = ". Click to cancel";
  if (statusOverride === ConnectSubscriptionItemStatus.PendingCancelation) {
    msg = `. Pending cancelation`;
  }
  const name = network.chain ? `${network.name} ${network.chain}` : network.name
  return `${name}${msg}`;
};

export const _getFormattedAddressSummary = (user: IUser) => {
  return user?.address?.address2
    ? `${user?.address?.address1}&:nbsp;${user?.address?.address2}`
    : `${user?.address?.address1}, ${user?.address?.city} ${user?.address?.state} ${user?.address?.zipCode}`;
};

export const _getNetworkPrice = (items: ConnectSubscriptionItemExpandedDto[]) => {
  const total = items
    .filter((x) => !x.isMetered)
    .reduce((total, item) => {
      return total + item.unitAmount;
    }, 0);
  return `$${total}`;
};

export const monthToPaddedString = (month: number): string => {
  return month < 10 ? `0${month}` : `${month}`;
};

export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const countries: IOption[] = Object.keys(countryNames).map((country) => {
  return { value: country, label: countryNames[country] };
});
