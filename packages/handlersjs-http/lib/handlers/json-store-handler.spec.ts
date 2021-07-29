import { MemoryStore } from '@digita-ai/handlersjs-core';
import { HttpHandlerContext } from '../models/http-handler-context';
import { HttpHandlerResponse } from '../models/http-handler-response';
import { HttpMethods } from '../models/http-method';
import { JsonStoreHandler } from './json-store-handler';

describe('JsonStoreHandler', () => {

  interface StoreInterface {
    data: string[];
    anotherstring: number;
  }

  const inputData = [ 'abc', 'defghij', '123' ];
  const inputData2 = [ ... inputData, '456' ]; // another list of data that may be used to update the store

  let jsonStoreHandler: JsonStoreHandler<StoreInterface>;
  let memoryStore: MemoryStore<StoreInterface>;
  let requestContext: HttpHandlerContext;

  beforeEach(() => {

    memoryStore = new MemoryStore([ [ 'data', inputData ] ]);

    jsonStoreHandler = new JsonStoreHandler('data', memoryStore);

    requestContext = {
      request: {
        url: new URL('http://localhost/'),
        method: 'GET',
        headers: {},
      },
    };

  });

  describe('handle()', () => {

    it('can GET the data correctly', async () => {

      const response: HttpHandlerResponse = await jsonStoreHandler.handle(requestContext).toPromise();
      const resultData: string[] = JSON.parse(response.body);

      expect(resultData).toEqual(inputData);
      expect(response.status).toEqual(200);

    });

    it.each(Object.values(HttpMethods))('Should handle a %s request correctly',
      async (method) => {

        requestContext.request.method = method;
        const response: HttpHandlerResponse = await jsonStoreHandler.handle(requestContext).toPromise();

        expect(response.status).toEqual(method === 'GET' ? 200 : 405);

      });

    it('returns "not found" if the data is not available', async () => {

      await memoryStore.delete('data');
      const response: HttpHandlerResponse = await jsonStoreHandler.handle(requestContext).toPromise();

      expect(response.status).toEqual(404);

    });

    it('can GET updated data', async () => {

      const response: HttpHandlerResponse = await jsonStoreHandler.handle(requestContext).toPromise();
      const resultData: string[] = JSON.parse(response.body);

      expect(resultData).toEqual(inputData);
      expect(response.status).toEqual(200);

      // update the data
      await memoryStore.set('data', inputData2);
      const response2 = await jsonStoreHandler.handle(requestContext).toPromise();
      const resultData2 = JSON.parse(response2.body);

      expect(resultData2).toEqual(inputData2);
      expect(response2.status).toEqual(200);

    });

    describe('If-Modified-Since', () => {

      it('doesn\'t return the data if the data wasn\'t updated', async () => {

        const nextHour = new Date();
        nextHour.setTime(nextHour.getTime() + 60*60*1000);

        requestContext.request.headers['if-modified-since'] = nextHour.toUTCString();
        const response: HttpHandlerResponse = await jsonStoreHandler.handle(requestContext).toPromise();

        expect(response.status).toEqual(304); // not modified
        expect(response.body).toEqual('');

      });

      it('returns the data if it was updated', async () => {

        requestContext.request.headers['if-modified-since'] = new Date(1970).toUTCString();
        const response: HttpHandlerResponse = await jsonStoreHandler.handle(requestContext).toPromise();

        expect(response.status).toEqual(200);

        const resultData: string[] = JSON.parse(response.body);
        expect(resultData).toEqual(inputData);

      });

    });

  });

  describe('canHandle()', () => {

    it('can always handle a request', async () => {

      const canHandle = await jsonStoreHandler.canHandle(requestContext).toPromise();
      expect(canHandle).toEqual(true);

    });

  });

});
