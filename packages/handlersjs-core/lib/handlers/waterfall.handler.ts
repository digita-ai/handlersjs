import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HandlerArgumentError } from '../errors/handler-argument-error';
import { Handler } from './handler';

/**
 * Generic handler that executes the first handler that can handle the input.
 */
export class WaterfallHandler<T, S> implements Handler<T, S> {

  constructor(public handlers: Handler<T, S>[]) {

    if (!handlers) { throw new HandlerArgumentError('Argument handlers should be set.', handlers); }

  }

  handle(input: T): Observable<S> {

    return this.handlers.reduce<Observable<S>>((previousOutput, nextHandler) => previousOutput.pipe(
      catchError(() => nextHandler.handle(input)),
    ), throwError(() => void 0)).pipe(
      catchError(() => throwError(() => new HandlerArgumentError('No handler can handle the input.', input)))
    );

  }

}
