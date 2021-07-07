import { Observable, of, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { HandlerArgumentError } from '../errors/handler-argument-error';
import { Handler } from './handler';

export class PipeThroughHandler<T, S> extends Handler<T, S> {

  constructor(
    public handlers: Handler<any, any>[],
  ) {

    super();

    if (!handlers) { throw new HandlerArgumentError('Argument handlers should be set.', handlers); }

  }

  canHandle(input: any): Observable<boolean> {

    return input ? of(true) : of(false);

  }

  handle(input: any): Observable<S> {

    if (!input) { return throwError(new Error('Argument input should be set.')); }

    let tempInp = of(input);

    for (const handler of this.handlers) {

      tempInp = tempInp.pipe(
        switchMap((inp) => handler.handle(inp)),
      );

    }

    return tempInp;

  }

}
