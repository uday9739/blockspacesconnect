import { validate, ValidationOptions, ValidationArguments, registerDecorator, ValidatorConstraint } from "class-validator";
import { decode } from 'bolt11';
import { resolve } from "path";

/**
 * Validation decorator that checks for a Valid Bolt11 invoice. 
 *
 * @param allowTestnet boolean - allow testnet invoices
 * @param validationOptions validation option
 *
 * @see {@link https://www.bolt11.org/}
 */
export function IsPaymentRequest<T = any>(validationOptions: ValidationOptions = {}, decoratorName: string = "IsPaymentRequest"): PropertyDecorator {
  return (object: Object, propertyName: string) => {
    if (!validationOptions.message) {
      validationOptions.message = (args: ValidationArguments) => {
        return 'Invalid invoice.';
      }
    }

    registerDecorator({
      name: decoratorName,
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          try {
            const parsed = decode(value);
            if (!parsed.satoshis) return false;
            if (!parsed.paymentRequest) return false;
            if (!parsed.signature) return false;
            if (!parsed.payeeNodeKey) return false;
            return true;
          } catch (e) {
            return false;
          }
        }
      },
    });
  };
}
export { decode };