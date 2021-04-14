import { combineLatest, forkJoin, Observable, of, Subject, throwError, zip } from 'rxjs';
import { map, switchMap, tap, toArray } from 'rxjs/operators';
import { HttpHandler } from '../general/http-handler';
import { HttpHandlerContext } from '../general/http-handler-context';
import { HttpHandlerRequest } from '../general/http-handler-request';
import { NodeHttpStreamsHandler } from './node-http-streams.handler';
import { NodeHttpStreams } from './node-http-streams.model';

/**
 * A {NodeHttpStreamsHandler} reading the request stream into a {HttpHandlerRequest},
 * passing it through a {HttpHandler} and writing the resulting {HttpHandlerResponse} to the response stream.
 */
export class NodeHttpRequestResponseHandler extends NodeHttpStreamsHandler {
  /**
   * Creates a {NodeHttpRequestResponseHandler} passing requests through the given handler.
   *
   * @param {HttpHandler} httpHandler - the handler through which to pass incoming requests.
   */
  constructor(private httpHandler: HttpHandler) {
    super();

    if (!httpHandler) {
      throw new Error('A HttpHandler must be provided');
    }
  }

  /**
   * Reads the requestStream of its NodeHttpStreams pair into a HttpHandlerRequest,
   * creates a HttpHandlerContext from it, passes it through the {HttpHandler},
   * and writes the result to the responseStream.
   *
   * @param {NodeHttpStreams} noteHttpStreams - the incoming set of Node.js HTTP read and write streams
   * @returns an {Observable<void>} for completion detection
   */
  handle(nodeHttpStreams: NodeHttpStreams): Observable<void> {
    if (!nodeHttpStreams.requestStream.url) {
      return throwError(new Error('url of the request cannot be null or undefined.'));
    }
    if (!nodeHttpStreams.requestStream.method) {
      return throwError(new Error('method of the request cannot be null or undefined.'));
    }
    if (!nodeHttpStreams.requestStream.headers) {
      return throwError(new Error('headers of the request cannot be null or undefined.'));
    }

    const buffer = new Subject<any>();

    nodeHttpStreams.requestStream.on('data', (chunk) => buffer.next(chunk));
    nodeHttpStreams.requestStream.on('end', () => buffer.complete());

    return buffer.pipe(
      toArray(),
      map((chunks: any[]) => Buffer.concat(chunks).toString()),
      map((body) => {
        const urlObject: URL = new URL(nodeHttpStreams.requestStream.url);

        const query = {};
        urlObject.searchParams.forEach((value, key) => query[key] = value);

        const httpHandlerRequest = {
          path: urlObject.pathname,
          method: nodeHttpStreams.requestStream.method,
          headers: nodeHttpStreams.requestStream.headers as { [key: string]: string },
          query,
        };

        return { request: body !== '' ? Object.assign(httpHandlerRequest, { body }) : httpHandlerRequest };

      }),
      switchMap((context: HttpHandlerContext) => this.httpHandler.handle(context)),
      map((response) => {
        nodeHttpStreams.responseStream.writeHead(response.status, response.headers);
        nodeHttpStreams.responseStream.write(response.body);
        nodeHttpStreams.responseStream.end();
      }),
    );
  }

  /**
   * Indicates this handler accepts every NodeHttpStreams pair as input.
   *
   * @param {NodeHttpStreams} input - the incoming streams
   * @returns always `of(true)`
   */
  canHandle(input: NodeHttpStreams): Observable<boolean> {
    return input && input.requestStream && input.responseStream ? of(true) : of(false);
  }
}