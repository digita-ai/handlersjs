import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { getLoggerFor } from '@digita-ai/handlersjs-logging';
import { HttpHandlerResponse } from '../models/http-handler-response';
import { HttpHandler } from '../models/http-handler';
import { HttpHandlerContext } from '../models/http-handler-context';

/**
 * HTTP error status codes and their respective messages.
 */
export const statusCodes: { [code: number]: string } = {
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Payload Too Large',
  414: 'URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Range Not Satisfiable',
  417: 'Expectation Failed',
  418: `I'm a teapot`,
  421: 'Misdirected Request',
  422: 'Unprocessable Entity',
  423: 'Locked',
  424: 'Failed Dependency',
  425: 'Too Early',
  426: 'Upgrade Required',
  428: 'Precondition required',
  429: 'Too Many Requests',
  431: 'Request Header Fields Too Large',
  451: 'Unavailable For Legal Reasons',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  506: 'Variant Also Negotiates',
  507: 'Insufficient Storage',
  508: 'Loop detected',
  510: 'Not Extended',
  511: 'Network Authentication Required',
};

/**
 * A { Handler<HttpHandlerContext, HttpHandlerResponse> } that catches errors and returns an error response to the given handler.
 */
export class ErrorHandler implements HttpHandler {

  private logger = getLoggerFor(this, 5, 5);

  /**
   * Creates an {ErrorHandler}.
   *
   * @param { HttpHandler } nestedHandler - The handler to catch errors for.
   * @param { boolean } showUpstreamError - Flag to show upstream errors or not.
   */
  constructor(
    private nestedHandler: HttpHandler,
    private showUpstreamError: boolean = false
  ) {

    if (!nestedHandler) {

      throw new Error('A HttpHandler must be provided');

    }

  }

  /**
   * Handles the context by catching thrown errors and returning an appropriate error response.
   *
   * @param { HttpHandlerContext } context - The context of the request.
   */
  handle(context: HttpHandlerContext): Observable<HttpHandlerResponse>{

    if (!context) {

      this.logger.verbose('Context was not provided');

      return throwError(() => new Error('A context must be provided'));

    }

    return this.nestedHandler.handle(context).pipe(
      catchError((error) => {

        this.logger.error('Error occurred: ', error);

        const status = error?.statusCode ?? error.status;
        const message = error?.message ?? error.body;

        return of({
          status: statusCodes[status] ? status : 500,
          headers: error?.headers ?? {},
          body: this.showUpstreamError
            ? message ?? error
            : statusCodes[status] ?? statusCodes[500],
        });

      })
    );

  }

}
