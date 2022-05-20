import { HttpHandlerRequest } from './http-handler-request';
import { HttpHandlerRoute } from './http-handler-route';

/**
 * Represents a context, containing a { HttpHandlerRequest } and optional { HttpHandlerRoute }.
 */
export interface HttpHandlerContext {
  request: HttpHandlerRequest;
  route?: HttpHandlerRoute;
}
