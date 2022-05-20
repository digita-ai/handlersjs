import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { HandlerArgumentError } from '../errors/handler-argument-error';
import { Handler } from './handler';

type HandlerSequence1<A, B> = [ Handler<A, B> ];
type HandlerSequence2<A, B, C> = [ Handler<A, B>, Handler<B, C> ];
type HandlerSequence3<A, B, C, D> = [ Handler<A, B>, Handler<B, C>, Handler<C, D> ];
type HandlerSequence4<A, B, C, D, E> = [ Handler<A, B>, Handler<B, C>, Handler<C, D>, Handler<D, E> ];

/**
 * A { Handler<A, E> } that pipes the input, including the correct typing, through a HandlerSequence.
 */
export class TypedPipeThroughHandler<A, B, C, D, E> implements Handler<A, E> {

  /**
   * Creates a { TypedPipeThroughHandler<A, B, C, D, E> }.
   *
   * @param { HandlerSequence1<A, E> | HandlerSequence2<A, B, E> | HandlerSequence3<A, B, C, E> | HandlerSequence4<A, B, C, D, E> } handlers - The series of handlers to pipe the input through.
   */
  constructor(
    public handlers: HandlerSequence1<A, E> |
    HandlerSequence2<A, B, E> |
    HandlerSequence3<A, B, C, E> |
    HandlerSequence4<A, B, C, D, E>,
  ) {

    if (!handlers) { throw new HandlerArgumentError('Argument handlers should be set.', handlers); }

  }

  /**
   * Pipes the typed input from one handler to the next calling the handle method on each handler in the sequence of handlers.
   */
  handle(input: A): Observable<E> {

    switch (this.handlers.length) {

      case 1: {

        const AtoE = this.handlers[0];

        return AtoE.handle(input);

      }

      case 2: {

        const BtoE = this.handlers[1];

        return this.handlers[0].handle(input).pipe(
          switchMap((inp) => BtoE.handle(inp)),
        );

      }

      case 3: {

        const BtoC = this.handlers[1];
        const CtoE = this.handlers[2];

        return this.handlers[0].handle(input).pipe(
          switchMap((inp) => BtoC.handle(inp)),
          switchMap((inp) => CtoE.handle(inp)),
        );

      }

      case 4: {

        const BtoC = this.handlers[1];
        const CtoD = this.handlers[2];
        const DtoE = this.handlers[3];

        return this.handlers[0].handle(input).pipe(
          switchMap((inp) => BtoC.handle(inp)),
          switchMap((inp) => CtoD.handle(inp)),
          switchMap((inp) => DtoE.handle(inp)),
        );

      }

    }

  }

}
