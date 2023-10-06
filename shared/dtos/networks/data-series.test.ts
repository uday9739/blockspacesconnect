import { values } from "lodash";
import { NetworkDataByCategory, NetworkDataTotals } from "./data-series";

// ##############################
// # NetworkDataTotals.create()
// ###############################
describe(NetworkDataTotals.create, () => {

  it('should use the supplied function to calculate total', () => {
    const data: NetworkDataByCategory = {
      category: "foo",
      values: [1, 2, 3]
    }
    const expectedTotal = data.values[0];

    const result = NetworkDataTotals.create(data, () => expectedTotal);
    expect(result.amount).toBe(expectedTotal);
  });

  it('should return null if data is falsey', () => {
    const result = NetworkDataTotals.create(<any>null, () => 1);
    expect(result).toBeNull();
  });

  it('should return defaults when no values are available', () => {
    const data: NetworkDataByCategory = { category: "foo", values: [] };
    const result = NetworkDataTotals.create(data, () => 1);

    expect(result).toEqual<NetworkDataTotals>({
      label: data.category,
      amount: 0,
      changedBy: 0,
      changedByPct: 0
    });
  });

  it('should set changedBy and changedByPct to null when first value is 0', () => {
    const data: NetworkDataByCategory = {
      category: "foo",
      values: [0, 1, 2, 3]
    };

    const result = NetworkDataTotals.create(data, () => 1);

    expect(result.changedBy).toBeNull();
    expect(result.changedByPct).toBeNull();
  });

  it('should set changedBy as difference between first and last value', () => {
    const data: NetworkDataByCategory = {
      category: "foo",
      values: [5, 1, 2, 25]
    };

    const expectedAmt = data.values[data.values.length - 1] - data.values[0];

    const result = NetworkDataTotals.create(data, () => 1);
    expect(result.changedBy).toBe(expectedAmt);
  });

  it('should set changedByPct as % difference between first and last value', () => {
    const data: NetworkDataByCategory = {
      category: "foo",
      values: [5, 1, 2, 25]
    };

    const result = NetworkDataTotals.create(data, () => 1);

    const expectedAmt = (result.changedBy / data.values[0]) * 100;
    expect(result.changedByPct).toBe(expectedAmt);
  });
});

// ############################################
// # NetworkDataTotals.createForLatestValue()
// #############################################
describe(NetworkDataTotals.createForLatestValue, () => {

  it('should set total amount based on latest (last) value from series', () => {
    const data: NetworkDataByCategory = { category: "foo", values: [23, 2343, 12985] };
    const expected = data.values[data.values.length - 1];

    const result = NetworkDataTotals.createForLatestValue(data);
    expect(result.amount).toBe(expected);
  });
});

// ############################################
// # NetworkDataTotals.createForSum()
// #############################################
describe(NetworkDataTotals.createForSum, () => {

  it('should set total amount based on latest (last) value from series', () => {
    const data: NetworkDataByCategory = { category: "foo", values: [1, 2, 3, 4] };
    const expected = 1+2+3+4;

    const result = NetworkDataTotals.createForSum(data);
    expect(result.amount).toBe(expected);
  });
});