import numeral from 'numeral';

// getFormattedNumber is a method that returns a format for a a large number used by the numeral service.
export function getFormattedNumber(rawAmount: number) {
  const amount = Math.abs(rawAmount);

  let format;

  if (!format && amount >= 100_000_000_000) format = '0,0a';

  if (!format && amount >= 10_000_000_000) format = '0,0a';

  if (!format && amount >= 1_000_000_000) format = '0.00a';

  if (!format && amount >= 100_000_000) format = '0,0a';

  if (!format && amount >= 10_000_000) format = '0.0a';

  if (!format && amount >= 1_000_000) format = '0.00a';

  if (!format && amount >= 100_000) format = '0,0a';

  if (!format && amount >= 10_000) format = '0.0a';

  if (!format) format = '0,0';

  return numeral(amount).format(format);
};
