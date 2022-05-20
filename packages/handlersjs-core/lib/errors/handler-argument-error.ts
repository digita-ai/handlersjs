import { HandlerError } from './handler-error';

/**
 * A { HandlerError } that is thrown when a handler argument is invalid or missing.
 */
export class HandlerArgumentError extends HandlerError {

  public readonly name = HandlerArgumentError.name;

  constructor(message: string, public value: unknown, cause?: Error) {

    super(message, cause);

    Object.setPrototypeOf(this, HandlerArgumentError.prototype);

  }

}
