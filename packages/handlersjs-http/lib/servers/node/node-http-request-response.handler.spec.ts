import { IncomingMessage, ServerResponse } from 'http';
import { lastValueFrom, of, throwError } from 'rxjs';
import * as mockhttp from 'mock-http';
import { HttpHandler } from '../../models/http-handler';
import { BadRequestHttpError } from '../../errors/bad-request-http-error';
import { NodeHttpRequestResponseHandler } from './node-http-request-response.handler';
import { NodeHttpStreams } from './node-http-streams.model';

describe('NodeHttpRequestResponseHandler', () => {

  let handler: NodeHttpRequestResponseHandler;
  let nestedHttpHandler: HttpHandler;
  let streamMock: NodeHttpStreams;
  let req: IncomingMessage;
  let res: ServerResponse;
  const buffer = Buffer.from('bodyString');

  beforeEach(async () => {

    nestedHttpHandler = { handle: jest.fn().mockReturnValueOnce(of({ body: 'mockBody', headers: { mockKey: 'mockValue' }, status: 200 })) };

    handler = new NodeHttpRequestResponseHandler(nestedHttpHandler);

    req = new mockhttp.Request({
      url: 'http://localhost:3000/test?works=yes',
      method: 'GET',
      buffer,

    });

    res = new mockhttp.Response();
    res.write = jest.fn();
    res.writeHead = jest.fn();
    res.end = jest.fn();

    streamMock = {
      requestStream: req,
      responseStream: res,
    };

  });

  it('should be correctly instantiated if handler is present', () => {

    expect(handler).toBeTruthy();

  });

  it('throws when handler is null or undefined', () => {

    expect(() => new NodeHttpRequestResponseHandler(null)).toThrow('A HttpHandler must be provided');

    expect(() => new NodeHttpRequestResponseHandler(undefined)).toThrow('A HttpHandler must be provided');

  });

  it('nested should be correctly instantiated', () => {

    expect(nestedHttpHandler).toBeTruthy();

  });

  describe('handle', () => {

    it('throws when streams is null/undefined', async () => {

      await expect(lastValueFrom(handler.handle(null))).rejects.toThrow('node http streams object cannot be null or undefined.');
      await expect(lastValueFrom(handler.handle(undefined))).rejects.toThrow('node http streams object cannot be null or undefined.');

    });

    it('throws when request stream is null/undefined', async () => {

      streamMock.requestStream = null;
      expect(streamMock.requestStream).toBeNull();
      await expect(lastValueFrom(handler.handle(streamMock))).rejects.toThrow('request stream cannot be null or undefined.');

      streamMock.requestStream = undefined;
      expect(streamMock.requestStream).toBeUndefined();
      await expect(lastValueFrom(handler.handle(streamMock))).rejects.toThrow('request stream cannot be null or undefined.');

    });

    it('throws when response stream is null/undefined', async () => {

      streamMock.responseStream = null;
      expect(streamMock.responseStream).toBeNull();
      await expect(lastValueFrom(handler.handle(streamMock))).rejects.toThrow('response stream cannot be null or undefined.');

      streamMock.responseStream = undefined;
      expect(streamMock.responseStream).toBeUndefined();
      await expect(lastValueFrom(handler.handle(streamMock))).rejects.toThrow('response stream cannot be null or undefined.');

    });

    it('throws when url is null/undefined', async () => {

      streamMock.requestStream.url = null;
      expect(streamMock.requestStream.url).toBeNull();
      await expect(lastValueFrom(handler.handle(streamMock))).rejects.toThrow('url of the request cannot be null or undefined.');

      streamMock.requestStream.url = undefined;
      expect(streamMock.requestStream.url).toBeUndefined();
      await expect(lastValueFrom(handler.handle(streamMock))).rejects.toThrow('url of the request cannot be null or undefined.');

    });

    it('throws when method is null/undefined', async () => {

      streamMock.requestStream.method = null;
      expect(streamMock.requestStream.method).toBeNull();
      await expect(lastValueFrom(handler.handle(streamMock))).rejects.toThrow('method of the request cannot be null or undefined.');

      streamMock.requestStream.method = undefined;
      expect(streamMock.requestStream.method).toBeUndefined();
      await expect(lastValueFrom(handler.handle(streamMock))).rejects.toThrow('method of the request cannot be null or undefined.');

    });

    it('throws when headers is null/undefined', async () => {

      streamMock.requestStream.headers = null;
      expect(streamMock.requestStream.headers).toBeNull();
      await expect(lastValueFrom(handler.handle(streamMock))).rejects.toThrow('headers of the request cannot be null or undefined.');

      streamMock.requestStream.headers = undefined;
      expect(streamMock.requestStream.headers).toBeUndefined();
      await expect(lastValueFrom(handler.handle(streamMock))).rejects.toThrow('headers of the request cannot be null or undefined.');

    });

    it('should set the body in the request if found in the request stream', async () => {

      await lastValueFrom(handler.handle(streamMock));
      expect(nestedHttpHandler.handle).toHaveBeenCalledTimes(1);

      expect(nestedHttpHandler.handle).toHaveBeenCalledWith({
        'request': {
          'method': 'GET',
          'headers': {},
          'url': new URL('http://localhost:3000/test?works=yes'),
          'body': 'bodyString',
        },
      });

    });

    it('should call the nested handlers handle method', async () => {

      await lastValueFrom(handler.handle(streamMock));
      expect(nestedHttpHandler.handle).toHaveBeenCalledTimes(1);

    });

    it('should write the headers to response stream', async () => {

      await lastValueFrom(handler.handle(streamMock));
      expect(streamMock.responseStream.writeHead).toHaveBeenCalledWith(200, { mockKey: 'mockValue', 'content-length': Buffer.byteLength('mockBody', 'utf-8').toString() });

    });

    it('should write the body to response stream', async () => {

      await lastValueFrom(handler.handle(streamMock));
      expect(streamMock.responseStream.write).toHaveBeenCalledWith('mockBody');

    });

    it('should close the output stream', async () => {

      await lastValueFrom(handler.handle(streamMock));
      expect(streamMock.responseStream.end).toHaveBeenCalledTimes(1);

    });

    it('should parse the url correctly', async () => {

      await lastValueFrom(handler.handle(streamMock));
      expect(nestedHttpHandler.handle).toHaveBeenCalledTimes(1);

      expect(nestedHttpHandler.handle).toHaveBeenCalledWith(expect.objectContaining({ request: expect.objectContaining({ url: new URL('http://localhost:3000/test?works=yes'), method: 'GET', headers: {} }) }));

    });

    it('should calculate the content-length of the response body as utf-8 when no charset is present', async () => {

      const body = 'This is a response body with a certain length.';
      nestedHttpHandler.handle = jest.fn().mockReturnValueOnce(of({ body, headers: { 'content-length': '2' }, status:200 }));

      await lastValueFrom(handler.handle(streamMock));

      expect(res.writeHead).toHaveBeenCalledWith(200, { 'content-length': Buffer.byteLength(body, 'utf-8').toString() });
      expect(res.write).toHaveBeenCalledWith(body);
      expect(res.end).toHaveBeenCalledTimes(1);

    });

    it('should calculate the content-length of the response body with the given charset', async () => {

      const body = Buffer.from('This is a response body with a certain length.').toString('base64');
      nestedHttpHandler.handle = jest.fn().mockReturnValueOnce(of({ body, headers: { 'content-length': '2', 'content-type': 'text/html; charset=base64' }, status:200 }));

      await lastValueFrom(handler.handle(streamMock));

      expect(res.writeHead).toHaveBeenCalledWith(200, { 'content-length': Buffer.byteLength(body, 'base64').toString(), 'content-type': 'text/html; charset=base64' });
      expect(res.write).toHaveBeenCalledWith(body);
      expect(res.end).toHaveBeenCalledTimes(1);

    });

    it('should not calculate content-length when response does not contain a body', async () => {

      nestedHttpHandler.handle = jest.fn().mockReturnValueOnce(of({ headers: { mockKey: 'mockValue' }, status:200 }));

      await lastValueFrom(handler.handle(streamMock));

      expect(res.writeHead).toHaveBeenCalledWith(200, { mockKey: 'mockValue' });
      expect(res.write).toHaveBeenCalledTimes(0);
      expect(res.end).toHaveBeenCalledTimes(1);

    });

    it('should return the response body when the body is equal to false', async () => {

      const body = false;

      nestedHttpHandler.handle = jest.fn().mockReturnValueOnce(of({ body, headers: {  'content-type': 'application/json;' }, status:200 }));

      await lastValueFrom(handler.handle(streamMock));

      expect(res.write).toHaveBeenCalledWith(JSON.stringify(body));
      expect(res.end).toHaveBeenCalledTimes(1);

    });

    it('should error if the charset is not supported', async () => {

      nestedHttpHandler.handle = jest.fn().mockReturnValueOnce(of({ body: 'mockBody', headers: { 'content-type': 'text/html; charset=unsupported' }, status:200 }));

      await expect(lastValueFrom(handler.handle(streamMock))).rejects.toThrow('The specified charset is not supported');

    });

    it('should set the charset to utf-8 if no content-type header is specified', async () => {

      const body = 'This is a response body with a certain length.';
      nestedHttpHandler.handle = jest.fn().mockReturnValueOnce(of({ body, headers: { 'content-type': 'text/html;' }, status:200 }));

      await lastValueFrom(handler.handle(streamMock));

      expect(res.writeHead).toHaveBeenCalledWith(200, { 'content-length': Buffer.byteLength(body, 'utf-8').toString(), 'content-type': 'text/html;' });

    });

    it('should set the charset to utf-8 if no charset is specified in the content-type header', async () => {

      const body = 'This is a response body with a certain length.';
      nestedHttpHandler.handle = jest.fn().mockReturnValueOnce(of({ body, headers: { 'content-type': 'text/html;' }, status:200 }));

      await lastValueFrom(handler.handle(streamMock));

      expect(res.writeHead).toHaveBeenCalledWith(200, { 'content-length': Buffer.byteLength(body, 'utf-8').toString(), 'content-type': 'text/html;' });

    });

    it('should set the charset to utf-8 if no content-type header is specified', async () => {

      const body = 'This is a response body with a certain length.';
      nestedHttpHandler.handle = jest.fn().mockReturnValueOnce(of({ body, headers: {}, status:200 }));

      await lastValueFrom(handler.handle(streamMock));

      expect(res.writeHead).toHaveBeenCalledWith(200, { 'content-length': Buffer.byteLength(body, 'utf-8').toString() });

    });

    it('should JSON stringify the response body if the body type is not string', async () => {

      const body = 1234;
      nestedHttpHandler.handle = jest.fn().mockReturnValueOnce(of({ body, headers: { 'content-type': 'text/html' }, status:200 }));

      await lastValueFrom(handler.handle(streamMock));

      expect(res.writeHead).toHaveBeenCalledWith(200, { 'content-length': Buffer.byteLength(body.toString(), 'utf-8').toString(), 'content-type': 'text/html' });

    });

    it('should catch objects with the given status if the status is within the 400-599 range', async () => {

      nestedHttpHandler.handle = jest.fn().mockReturnValueOnce(throwError(() => ({ headers: {}, status: 409 })));

      await lastValueFrom(handler.handle(streamMock));

      expect(res.writeHead).toHaveBeenCalledWith(409, { 'content-length': Buffer.byteLength('Internal Server Error', 'utf-8').toString() });
      expect(res.write).toHaveBeenCalledWith('Internal Server Error');

    });

    it('should catch objects with any status that is not matched and if the status is not within 400-599 return a 500 response', async () => {

      nestedHttpHandler.handle = jest.fn().mockReturnValueOnce(throwError(() => ({ headers: {}, status: 399 })));

      await lastValueFrom(handler.handle(streamMock));

      expect(res.writeHead).toHaveBeenCalledWith(500, { 'content-length': Buffer.byteLength('Internal Server Error', 'utf-8').toString() });
      expect(res.write).toHaveBeenCalledWith('Internal Server Error');

    });

    it('should catch objects with any status that is not matched and if the status is not within 400-599 return a 500 response', async () => {

      nestedHttpHandler.handle = jest.fn().mockReturnValueOnce(throwError(() => ({ headers: {}, status: 600 })));

      await lastValueFrom(handler.handle(streamMock));

      expect(res.writeHead).toHaveBeenCalledWith(500, { 'content-length': Buffer.byteLength('Internal Server Error', 'utf-8').toString() });
      expect(res.write).toHaveBeenCalledWith('Internal Server Error');

    });

  });

  describe('parseBody', () => {

    it('should return the body JSON parsed if content type is application/json', async () => {

      const parsed = (handler as any).parseBody('{"name":"jasper","surname":"vandenberghen"}', 'application/json');

      expect(parsed).toEqual({ name: 'jasper', surname: 'vandenberghen' });

    });

    it('should return the body x-www-form-urlencoded UNPARSED if content type is x-www-form-urlencoded', async () => {

      const parsed = (handler as any).parseBody('name=jasper&surname=vandenberghen', 'application/x-www-form-urlencoded');

      // expect(parsed).toEqual({ name: 'jasper', surname: 'vandenberghen' });
      expect(parsed).toEqual('name=jasper&surname=vandenberghen');

    });

    it('should return the body if content type is default', async () => {

      const parsed = (handler as any).parseBody('{"name":"jasper","surname":"vandenberghen"}', 'text/plain');

      expect(parsed).toEqual('{"name":"jasper","surname":"vandenberghen"}');

    });

    it('should error when parser fails', () => {

      expect(() => (handler as any).parseBody('{""}', 'application/json')).toThrow(BadRequestHttpError);

    });

  });

  describe('parseResponseBody', () => {

    it('should return the body if content type is application/json and body is string', async () => {

      const body = '{"name":"name","surname":"surname"}';

      const parsed = (handler as any).parseResponseBody(body, 'application/json');

      expect(parsed).toEqual(body);

    });

    it('should return the stringified body if content type is application/json and body is object', async () => {

      const body = { name: 'name', surname: 'surname' };

      const parsed = (handler as any).parseResponseBody(body, 'application/json');

      expect(parsed).toEqual(JSON.stringify(body));

    });

  });

});
