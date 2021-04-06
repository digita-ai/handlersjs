import { TestService, mainModulePath, configPath } from '../../setup-tests';
import { HttpHandlerResponse } from '../general/http-handler-response';
import { HttpHandlerContext } from '../general/http-handler-context';
import { HttpHandlerStaticAssetService } from './http-handler-static-asset';

describe('HttpHandlerStaticAssetService', () => {
  let service: HttpHandlerStaticAssetService;

  beforeAll(async () => {
    service = await TestService.instantiate('urn:handlersjs-http:test:HttpHandlerStaticAssetService', mainModulePath, configPath);
  });

  it('should be correctly instantiated', () => {
    expect(service).toBeTruthy();
  });

  describe('canHandle', () => {
    it('should return throw a 415-error when content-type is not supported', async (done) => {
      const context: HttpHandlerContext = {
        route: null,
        request: {
          path: '',
          method: 'get',
          headers: { 
            accept: 'application/json'
          },
        },
      };
  
      const response: HttpHandlerResponse = {
        body: null,
        headers: {},
        status: 200,
      };

        service.canHandle(context, response)
        .subscribe(
          (payload) => {
            // do nothing
          },
          (err) => {
            expect(err.constructor.name).toBe('HttpHandlerError');
            expect(err.status).toBe(415);
            done();
          },
        );
    });

    it('should return true when correct accept header is specified', async (done) => {
      const context: HttpHandlerContext = {
        route: null,
        request: {
          path: '',
          method: 'get',
          headers: {             
            accept: 'text/plain'
          },
        },
      };
  
      const response: HttpHandlerResponse = {
        body: null,
        headers: {},
        status: 200,
      };
  
        service.canHandle(context, response)
        .subscribe(
          (payload) => {
            // do nothing
            expect(payload).toBeTruthy();
            done();
          },
        );
    });

    it('should return true when no accept header is specified', async (done) => {
      const context: HttpHandlerContext = {
        route: null,
        request: {
          path: '',
          method: 'get',
          headers: { },
        },
      };
  
      const response: HttpHandlerResponse = {
        body: null,
        headers: {},
        status: 200,
      };
  
        service.canHandle(context, response)
        .subscribe(
          (payload) => {
            // do nothing
            expect(payload).toBeTruthy();
            done();
          },
        );
    });
  });

  describe('handle', () => {
    it('should return throw a 403-error when filename is invalid', async (done) => {
      const context: HttpHandlerContext = {
        route: null,
        request: {
          path: '',
          method: 'get',
          headers: { },
          parameters: {
            filename: '../../test'
          }
        },
      };
  
      const response: HttpHandlerResponse = {
        body: null,
        headers: {},
        status: 200,
      };
  
        service.handle(context, response)
        .subscribe(
          (payload) => {
            // do nothing
          },
          (err) => {
            expect(err.constructor.name).toBe('HttpHandlerError');
            expect(err.status).toBe(403);
            done();
          },
        );
    });

    it('should return throw a 404-error when file is not found', async (done) => {
      const context: HttpHandlerContext = {
        route: null,
        request: {
          path: '',
          method: 'get',
          headers: { },
          parameters: {
            filename: 'test.php'
          }
        },
      };
  
      const response: HttpHandlerResponse = {
        body: null,
        headers: {},
        status: 200,
      };
  
        service.handle(context, response)
        .subscribe(
          (payload) => {
            // do nothing
          },
          (err) => {
            expect(err.constructor.name).toBe('HttpHandlerError');
            expect(err.status).toBe(404);
            done();
          },
        );
    });

    it('should return file content when file is found', async (done) => {
      const context: HttpHandlerContext = {
        route: null,
        request: {
          path: '',
          method: 'get',
          headers: { },
          parameters: {
            filename: 'test.txt'
          }
        },
      };
  
      const response: HttpHandlerResponse = {
        body: null,
        headers: {},
        status: 200,
      };
  
        service.handle(context, response)
        .subscribe(
          (payload) => {
            // do nothing
            expect(payload.body).toBe('test file');
            done();
          },
        );
    });
  });
});
