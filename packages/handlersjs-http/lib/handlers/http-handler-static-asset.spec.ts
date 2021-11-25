import { join } from 'path';
import { mock } from 'jest-mock-extended';
import { Logger } from '@digita-ai/handlersjs-core';
import { lastValueFrom } from 'rxjs';
import { HttpHandlerContext } from '../models/http-handler-context';
import { NotFoundHttpError } from '../errors/not-found-http-error';
import { ForbiddenHttpError } from '../errors/forbidden-http-error';
import { UnsupportedMediaTypeHttpError } from '../errors/unsupported-media-type-http-error';
import { HttpHandlerStaticAssetService } from './http-handler-static-asset';

jest.mock('fs/promises', () => ({
  readFile: jest.fn().mockImplementation(async (path) => {

    if (path.toString().includes('test.txt')) { return 'test file'; } else { throw new NotFoundHttpError('Error while trying to read file'); }

  }),
}));

describe('HttpHandlerStaticAssetService', () => {

  const service: HttpHandlerStaticAssetService = new HttpHandlerStaticAssetService(mock<Logger>(), 'test-directory/', 'text/plain');

  let context: HttpHandlerContext;

  beforeEach(() => {

    context = {
      request: {
        url: new URL('http://example.com'),
        method: 'GET',
        headers: {
          accept: 'text/plain',
        },
        parameters: {
          filename: 'filler.file',
        },
      },
    };

  });

  it('should be correctly instantiated', () => {

    expect(service).toBeTruthy();

  });

  describe('canHandle()', () => {

    it('should always return true', async() => {

      const response = lastValueFrom(service.canHandle(context));
      await expect(response).resolves.toBe(true);

    });

  });

  describe('handle()', () => {

    it('throws an UnsupportedMediaTypeHttpError when no accept header is found', async() => {

      const response = lastValueFrom(service
        .handle({ ...context, request: { ...context.request, headers: { accept: undefined } } }));

      await expect(response).rejects.toThrowError(new UnsupportedMediaTypeHttpError('No accept header found'));

    });

    it('throws an UnsupportedMediaTypeHttpError when content-type is not supported', async() => {

      const response = lastValueFrom(service.handle({ ...context, request: { ...context.request, headers: { accept: 'application/json' } } }));
      await expect(response).rejects.toThrowError(new UnsupportedMediaTypeHttpError('Content type not supported'));

    });

    it('throws a ForbiddenHttpError when filename is invalid', async() => {

      context.request.parameters.filename = '../../test.txt';
      const response = lastValueFrom(service.handle(context));
      await expect(response).rejects.toThrowError(new ForbiddenHttpError(''));

    });

    it('throws a NotFoundHttpError when file is not found', async() => {

      context.request.parameters.filename = 'test.php';
      const response = lastValueFrom(service.handle(context));
      await expect(response).rejects.toThrowError(new NotFoundHttpError('Error while trying to read file'));

    });

    it('throws a NotFoundHttpError when file is not provided', async() => {

      context.request.parameters.filename = undefined;
      const response = lastValueFrom(service.handle(context));
      await expect(response).rejects.toThrowError(new NotFoundHttpError('Error while trying to read file'));

    });

    it('should return file content when file is found', async() => {

      context.request.parameters.filename = 'test.txt';
      const response = await lastValueFrom(service.handle(context));
      expect(response.body).toBe('test file');

    });

    it('should return file content when file is found with an absolute path', async() => {

      const absolutePath = join(__dirname, '../../test-directory/');
      const absoluteService = new HttpHandlerStaticAssetService(mock<Logger>(), absolutePath, 'text/plain');

      context.request.parameters.filename = 'test.txt';
      const response = await lastValueFrom(absoluteService.handle(context));
      expect(response.body).toBe('test file');

    });

  });

});
