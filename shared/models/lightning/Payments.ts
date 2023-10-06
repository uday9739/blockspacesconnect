export enum PaymentErrors {
  PAYMENT_TIMED_OUT = 'Payment timed out.',
  CANNOT_PAY_SELF = 'Cannot pay self.',
  ZERO_VALUE_INVOICE = 'Cannot pay zero value invoice.',
  CANT_READ_INVOICE = 'Cannot read invoice.',
  INSUFFICIENT_BALANCE = 'Insufficient balance.',
  ALREADY_PAID = 'Invoice already paid.',
  PAYMENT_FAILED = 'Payment failed.',
  NO_ROUTE = "Could not find a route to the payment destination.",
  NO_MACARAROON = 'Payment authentication is missing. Please provide your password on the dashboard.',
}