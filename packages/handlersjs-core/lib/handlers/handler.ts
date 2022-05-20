import type { Observable } from 'rxjs';

/**
 * { Handler<T = void, S = void> } containing 2 abstract methods: canHandle and handle.
 * And a safeHandle method default implementation that checks if the handler can handle the request and then calls handle.
 */
export abstract class Handler<T = void, S = void> {

  abstract handle(input: T): Observable<S>;

}
