import { DateTime } from 'luxon';
import { InternalRange, Range } from '../types';

/**
 * "today" returns the current date and time
 */
export const today = (): DateTime => DateTime.now();


/**
 * "Get a DateTime object for the date that is the specified number of months ago from the current
 * date."
 *
 * The function takes a number of months as a parameter and returns a DateTime object
 * @param {number} monthsPast - number
 * @returns A DateTime object
 */
export const getDateforMonthsPast = (monthsPast: number): DateTime => {
  const now = DateTime.now();
  return now.plus({ months: - monthsPast });
};


/* It's creating a range object with a start date and an end date. */
export const initialRange: Range = {
  start: getDateforMonthsPast(1).toMillis(),
  end: today().toMillis()
};

/**
 * If the end date is in the future, return today's date, otherwise return the end date.
 * @param {InternalRange} range - The range object that we're going to be using to get the normalized
 * end date.
 * @returns A date object.
 */
export const getNormalizedEndDate = (range:InternalRange):Date => {
  const endInMillis = range.endDate.getTime();
  const todayInMillis = today().toMillis();
  return (todayInMillis <= endInMillis) ? (new Date(todayInMillis)) : range.endDate;
}
