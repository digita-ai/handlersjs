import { HttpMethod } from './http-method';

/**
 * Represents a HTTP request.
 * Containing:
 * - url: The url of the request.
 * - method: The HTTP method of the request.
 * - parameters (optional): The query parameters.
 * - headers: The request headers
 * - body (optional): The request body.
 */
export interface HttpHandlerRequest<B = any> {
  url: URL;
  method: HttpMethod;
  parameters?: { [key: string]: string };
  headers: { [key: string]: string };
  body?: B;
}
