import { from, Observable } from 'rxjs';
import { mapTo } from 'rxjs/operators';
import { HandlerArgumentError } from '../errors/handler-argument-error';
import { Handler } from './handler';

/**
 * A { Handler<T, T> } that passes the input to the next handler to handle it.
 */
export class PassThroughHandler<T> implements Handler<T, T> {

  /**
   * Creates a { PassThroughHandler }.
   *
   * @param { Handler<T, any> } handler - The nested handler to pass the input to.
   */
  constructor(public handler: Handler<T, any>) {

    if (!handler) { throw new HandlerArgumentError('Argument handler should be set.', handler); }

  }

  /**
   * Passes the input to the nested handler's handle method and maps it to the intermediate output.
   *
   * @param { T } input - The input to handle.
   * @returns The intermediate output of the handler.
   */
  handle(input: T): Observable<T> {

    return from(this.handler.handle(input)).pipe(mapTo(input));

  }

}
