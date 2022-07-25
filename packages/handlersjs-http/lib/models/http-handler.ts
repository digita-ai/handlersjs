import { Handler } from '@digita-ai/handlersjs-core';
import { HttpHandlerResponse } from './http-handler-response';
import { HttpHandlerContext } from './http-handler-context';

export type HttpHandler<C extends HttpHandlerContext = HttpHandlerContext> = Handler<C, HttpHandlerResponse>;
