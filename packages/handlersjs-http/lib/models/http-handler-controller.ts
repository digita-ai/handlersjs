import { Handler } from '@digita-ai/handlersjs-core';
import { HttpHandlerContext } from './http-handler-context';
import { HttpHandlerRoute } from './http-handler-route';

/**
 * Represents a controller, which can be used to handle a request.
 */
export class HttpHandlerController<C extends HttpHandlerContext = HttpHandlerContext> {

  /**
   * Creates a { HttpHandlerController }.
   *
   * @param { string } label - The label of the controller.
   * @param { HttpHandlerRoute<C>[] } routes - The routes possible for the controller.
   * @param { Handler<HttpHandlerContext, C> } preResponseHandler - A handler which is called before the response is sent.
   */
  constructor(
    public label: string,
    public routes: HttpHandlerRoute<C>[],
    public preResponseHandler?: Handler<HttpHandlerContext, C>,
  ) { }

}
