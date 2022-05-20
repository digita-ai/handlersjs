import { getLoggerFor } from '@digita-ai/handlersjs-logging';
import { Observable, of, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpHandler } from '../models/http-handler';
import { HttpHandlerContext } from '../models/http-handler-context';
import { HttpHandlerResponse } from '../models/http-handler-response';
import { cleanHeaders } from '../util/clean-headers';

export interface HttpCorsOptions {
  origins?: string[];
  allowMethods?: string[];
  allowHeaders?: string[];
  exposeHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

/**
 * A { HttpHandler } that handles CORS requests.
 */
export class HttpCorsRequestHandler implements HttpHandler {

  private logger = getLoggerFor(this, 5, 5);

  /**
   * Creates a { HttpCorsRequestHandler }.
   *
   * @param { HttpHandler } handler - The nested handler to pass the request to.
   * @param { HttpCorsOptions } options? - The CORS options.
   * @param { boolean } passThroughOptions - Flag to indicate to include request options or not.
   */
  constructor(
    private handler: HttpHandler,
    private options?: HttpCorsOptions,
    private passThroughOptions: boolean = false,
  ) { }

  /**
   * Cleans the headers on the request and checks if it's a preflight request or not and handles it accordingly.
   * Adds the appropriate CORS headers to the response.
   *
   * @param { HttpHandlerContext } context - The context containing the request.
   */
  handle(context: HttpHandlerContext): Observable<HttpHandlerResponse> {

    const { origins, allowMethods, allowHeaders, exposeHeaders, credentials, maxAge } = this.options || ({});

    const requestHeaders = context.request.headers;

    const cleanRequestHeaders = cleanHeaders(requestHeaders);

    const {
      ['origin']: requestedOrigin,
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructuring for removal */
      ['access-control-request-method']: requestedMethod,
      ['access-control-request-headers']: requestedHeaders,
      ... noCorsHeaders
    } = cleanRequestHeaders;

    const noCorsRequestContext = {
      ... context,
      request: {
        ... context.request,
        headers: {
          ... noCorsHeaders,
        },
      },
    };

    const allowOrigin = origins
      ? origins.includes(requestedOrigin)
        ? requestedOrigin
        : undefined
      : credentials
        ? requestedOrigin
        : '*';

    const allowHeadersOrRequested = allowHeaders?.join(',') ?? requestedHeaders;

    if (context.request.method === 'OPTIONS') {

      /* Preflight Request */

      this.logger.info('Processing preflight request', noCorsRequestContext);

      const routeMethods = context.route?.operations.map((op) => op.method);
      const allMethods = [ 'GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'PATCH' ];

      this.passThroughOptions ? this.logger.info('Handling context: ', noCorsRequestContext) : this.logger.info('No content found, returning 204 response for preflight request');

      const initialOptions = this.passThroughOptions
        ? this.handler.handle(noCorsRequestContext)
        : of({ status: 204, headers: {} });

      return initialOptions.pipe(
        map((response) => ({
          ... response,
          headers: cleanHeaders(response.headers),
        })),
        tap((response) => this.logger.info('Configuring CORS headers for response', response)),
        map((response) => ({
          ... response,
          headers: {

            ... response.headers,
            ... allowOrigin && ({
              ... (allowOrigin !== '*') && { 'vary': 'origin' },
              'access-control-allow-origin': allowOrigin,
              'access-control-allow-methods': (allowMethods ?? routeMethods ?? allMethods).join(', '),
              ... (allowHeadersOrRequested) && { 'access-control-allow-headers': allowHeadersOrRequested },
              ... (credentials) && { 'access-control-allow-credentials': 'true' },
              'access-control-max-age': (maxAge ?? -1).toString(),
            }),
          },
        })),
      );

    } else {

      /* CORS Request */

      this.logger.info('Processing CORS request', noCorsRequestContext);

      return this.handler.handle(noCorsRequestContext).pipe(
        tap((response) => this.logger.info('Configuring CORS headers for response', response)),
        map((response) => ({
          ... response,
          headers: {
            ... response.headers,
            ... allowOrigin && ({
              'access-control-allow-origin': allowOrigin,
              ... (allowOrigin !== '*') && { 'vary': 'origin' },
              ... (credentials) && { 'access-control-allow-credentials': 'true' },
              ... (exposeHeaders) && { 'access-control-expose-headers': exposeHeaders.join(',') },
            }),
          },
        })),
      );

    }

  }

}
