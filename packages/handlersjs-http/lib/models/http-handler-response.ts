/**
 * Represents a http response.
 * Containing:
 * - body (optional): the response body
 * - headers: the response headers
 * - status: the response status code
 */
export interface HttpHandlerResponse<B = any> {
  body?: B;
  headers: { [key: string]: string };
  status: number;
}
