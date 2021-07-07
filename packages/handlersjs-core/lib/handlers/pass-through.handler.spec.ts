import { of } from 'rxjs';
import { Handler } from './handler';
import { PassThroughHandler } from './pass-through.handler';

describe('PassThroughHandler', () => {

  const input = {
    msg: 'input',
  };

  const intermediateOutput = {
    msg: 'output',
  };

  const mockHandler: Handler<unknown, unknown> = {
    handle: jest.fn().mockReturnValue(of(intermediateOutput)),
    canHandle: jest.fn(),
    safeHandle: jest.fn(),
  };

  const handler = new PassThroughHandler(mockHandler);

  it('should be correctly instantiated', () => {

    expect(handler).toBeTruthy();

  });

  it('should error when no handler was provided', () => {

    expect(() => new PassThroughHandler(null)).toThrow('Argument handler should be set.');

  });

  describe('canHandle', () => {

    it('should return true if input and intermediateOutput was provided', async () => {

      await expect(handler.canHandle(input, intermediateOutput).toPromise()).resolves.toEqual(true);

    });

    it('should return false if input was not provided', async () => {

      await expect(handler.canHandle(null, intermediateOutput).toPromise()).resolves.toEqual(false);
      await expect(handler.canHandle(undefined, intermediateOutput).toPromise()).resolves.toEqual(false);

    });

    it('should return false if intermediateOutput was not provided', async () => {

      await expect(handler.canHandle(input, null).toPromise()).resolves.toEqual(false);
      await expect(handler.canHandle(input, undefined).toPromise()).resolves.toEqual(false);

    });

    it('should return false if no arguments were provided', async () => {

      await expect(handler.canHandle(null, null).toPromise()).resolves.toEqual(false);
      await expect(handler.canHandle(undefined, undefined).toPromise()).resolves.toEqual(false);

    });

  });

  describe('handle', () => {

    it('should throw an error if no input was provided', async () => {

      await expect(() => handler.handle(null, intermediateOutput).toPromise()).rejects.toThrow('Argument input should be set.');
      await expect(() => handler.handle(undefined, intermediateOutput).toPromise()).rejects.toThrow('Argument input should be set.');

    });

    it('should throw an error if no intermediateOutput was provided', async () => {

      await expect(() => handler.handle(input, null).toPromise()).rejects.toThrow('Argument intermediateOutput should be set.');
      await expect(() => handler.handle(input, undefined).toPromise()).rejects.toThrow('Argument intermediateOutput should be set.');

    });

    it('should handle the input and intermediateOutput', async () => {

      await expect(handler.handle(input, intermediateOutput).toPromise()).resolves.toEqual({ msg: 'output' });

    });

  });

});
