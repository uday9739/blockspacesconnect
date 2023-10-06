import { HttpException, HttpExceptionOptions, HttpStatus, ValidationError, ValidationPipe, ValidationPipeOptions } from "@nestjs/common";


export class ValidationException extends HttpException {
  constructor(objectOrError?: string | object | any, descriptionOrOptions: string | HttpExceptionOptions = "Validation Exception") {
    const { description, httpExceptionOptions } = HttpException.extractDescriptionAndOptionsFrom(descriptionOrOptions);
    const err = HttpException.createBody(objectOrError, description, HttpStatus.BAD_REQUEST);
    super(err, HttpStatus.BAD_REQUEST, httpExceptionOptions);
    this.name = "ValidationException";
  }
}
/**
 * Validation Pipe that throws a {@link ValidationException} 
 *
 * @class CustomValidationPipe
 * @extends {ValidationPipe}
 */
export class CustomValidationPipe extends ValidationPipe {
  constructor(options?: ValidationPipeOptions) {
    super({
      ...options,
      exceptionFactory: (errors: ValidationError[]) => {
        const messages: string[] = errors.reduce((acc, e) => [...acc, ...Object.values(e.constraints)], []);

        // returns list of constraint violation messages
        return new ValidationException(messages);
      }
    });
  }
}