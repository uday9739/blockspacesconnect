import { ValidationOptions, ValidationArguments, registerDecorator, EQUALS } from "class-validator";

export enum ComparisonType {
  EQUAL = "equal to",
  LESS_THAN = "less than",
  LESS_THAN_OR_EQUAL = "less than or equal to",
  GREATER_THAN = "greater than",
  GREATER_THAN_OR_EQUAL = "greater than or equal to"
}

/**
 * Custom validation decorator that compares a property to another property within the same object.
 * This decorator would typically not be used. Instead see the other convenience decorators like
 * `IsEqualTo`, `IsGreaterThan`, etc
 *
 * @param otherProperty the other property to compare to
 * @param comparison the type of comparison to perform
 * @param validationOptions validation option
 *
 * @see {@link IsEqualTo}, {@link IsGreaterThan}, {@link IsGreaterOrEqualTo}, {@link IsLessThan}, {@link IsLessOrEqualTo}
 */
export function CompareTo<T = any>(otherProperty: keyof T, comparison: ComparisonType, validationOptions: ValidationOptions = {}, decoratorName: string = "CompareTo"): PropertyDecorator {
  return (object: Object, propertyName: string) => {
    if (!validationOptions.message) {
      validationOptions.message = (args: ValidationArguments) => {
        return `'${propertyName}' (${args.object[propertyName]}) must be ${comparison} '${String(otherProperty)}' (${args.object[otherProperty as any]})`
      }
    }

    registerDecorator({
      name: decoratorName,
      target: object.constructor,
      propertyName: propertyName,
      constraints: [otherProperty],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];

          switch (comparison) {
            case ComparisonType.EQUAL:
              return value === relatedValue;

            case ComparisonType.GREATER_THAN:
              return value > relatedValue;

            case ComparisonType.GREATER_THAN_OR_EQUAL:
              return value >= relatedValue;

            case ComparisonType.LESS_THAN:
              return value < relatedValue;

            case ComparisonType.LESS_THAN_OR_EQUAL:
              return value <= relatedValue;

            default:
              return false;
          }
        },
      },
    });
  }
}

/**
 * Custom validation decorator that checks if a property's value is equal to the value of another property
 */
export function IsEqualTo<T = any>(otherProperty: keyof T, validationOptions: ValidationOptions = {}) {
  return CompareTo(otherProperty, ComparisonType.EQUAL, validationOptions, "IsEqualTo");
}

/**
 * Custom validation decorator that checks if a property's value is greater than the value of another property
 */
export function IsGreaterThan<T = any>(otherProperty: keyof T, validationOptions: ValidationOptions = {}) {
  return CompareTo(otherProperty, ComparisonType.GREATER_THAN, validationOptions, "IsGreaterThan");
}

/**
 * Custom validation decorator that checks if a property's value is greater than or equal to the value of another property
 */
export function IsGreaterOrEqualTo<T = any>(otherProperty: keyof T, validationOptions: ValidationOptions = {}) {
  return CompareTo(otherProperty, ComparisonType.GREATER_THAN_OR_EQUAL, validationOptions, "IsGreaterOrEqualTo");
}

/**
 * Custom validation decorator that checks if a property's value is less than the value of another property
 */
export function IsLessThan<T = any>(otherProperty: keyof T, validationOptions: ValidationOptions = {}) {
  return CompareTo(otherProperty, ComparisonType.LESS_THAN, validationOptions, "IsLessThan");
}

/**
 * Custom validation decorator that checks if a property's value is less than or equal to the value of another property
 */
export function IsLessOrEqualTo<T = any>(otherProperty: keyof T, validationOptions: ValidationOptions = {}) {
  return CompareTo(otherProperty, ComparisonType.LESS_THAN_OR_EQUAL, validationOptions, "IsLessOrEqualTo");
}