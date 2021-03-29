import { HttpHandlerResponse } from '../general/http-handler-response';
import { HandlerError } from '@digita-ai/handlersjs-core';

export class HttpHandlerError extends HandlerError {
  public readonly name = HttpHandlerError.name;

  constructor(message: string, public status: number, public response: HttpHandlerResponse, cause?: Error) {
    super(message, cause);

    Object.setPrototypeOf(this, HttpHandlerError.prototype);
  }
}
