import validate from "bitcoin-address-validation";
import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";

export function IsBitcoinAddress(validationOptions: ValidationOptions = {}, decoratorName: string = "isBitcoinAddress"): PropertyDecorator {
  return (object: Object, propertyName: string) => {
    if (!validationOptions.message) {
      validationOptions.message = (args: ValidationArguments) => {
        return "Invalid Bitcoin Address."
      }
    }

    registerDecorator({
      name: decoratorName,
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value, args: ValidationArguments) {
          try {
            const parsed = validate(value)
            if (!parsed) return false
            return true
          } catch (e) {
            return false
          }
        }
      }
    })
  }
}