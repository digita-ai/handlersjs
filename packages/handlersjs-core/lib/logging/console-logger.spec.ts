import * as path from 'path';
import { ComponentsManager } from 'componentsjs';
import { ConsoleLogger } from './console-logger';
import { LoggerLevel } from './logger-level';

describe('ConsoleLogger', () => {

  let service: ConsoleLogger;
  let manager: ComponentsManager<ConsoleLogger>;

  beforeAll(async () => {

    const mainModulePath = path.join(__dirname, '../../');
    const configPath = path.join(mainModulePath, 'config/config-test.json');
    manager = await ComponentsManager.build({ mainModulePath });
    await manager.configRegistry.register(configPath);

  });

  beforeEach(async () => {

    service = await manager.instantiate('urn:handlersjs-core:test:ConsoleLogger');

  });

  afterEach(() => {

    // clear spies
    jest.clearAllMocks();

  });

  it('should be correctly instantiated', () => {

    expect(service).toBeTruthy();

  });

  describe('log', () => {

    const levels: jest.FunctionPropertyNames<Console>[] = [ 'info', 'debug', 'warn', 'error' ];

    it('LoggerLevel.silly should call console.log', () => {

      const consoleSpy = jest.spyOn(console, 'log');
      service.log(LoggerLevel.silly, 'TestService', 'test message', 'data');
      expect(consoleSpy).toHaveBeenCalled();

    });

    for (const level of levels) {

      if (level) {

        it(`LoggerLevel.${level} should call console.${level}`, () => {

          const consoleSpy = jest.spyOn(console, level);
          service.log(LoggerLevel[level], 'TestService', 'test message', 'data');
          expect(consoleSpy).toHaveBeenCalled();

        });

      }

    }

    const params = {
      level: LoggerLevel.info,
      typeName: ' TestService',
      message: 'test message',
    };

    const args = Object.keys(params);

    args.forEach((argument) => {

      it(`should throw error when ${argument} is null or undefined`, () => {

        const testArgs = args.map((arg) => arg === argument ? null : arg);

        expect(() => service.log.apply(service.log, testArgs))
          .toThrow(`${argument} should be set`);

      });

    });

  });

  describe('level logs', () => {

    const levels = [ 'info', 'debug', 'warn', 'error' ];

    for (const level of levels) {

      if (level) {

        it(`should log a ${level} message`, () => {

          const loggerSpy = jest.spyOn(service, 'log');

          if (level === 'error') {

            service[level]('TestService', 'test message', 'test error', 'error');
            expect(loggerSpy).toHaveBeenCalledWith(LoggerLevel.error, 'TestService', 'test message', { error: 'test error', caught: 'error' });

          } else {

            service[level]('TestService', 'test message', 'test data');
            expect(loggerSpy).toHaveBeenCalledWith(LoggerLevel[level], 'TestService', 'test message', 'test data');

          }

        });

        // test arguments for null or undefined
        const params = {
          level: LoggerLevel.info,
          typeName: ' TestService',
        };

        const args = Object.keys(params);

        args.forEach((argument) => {

          it(`should throw error when ${argument} is null or undefined`, () => {

            const testArgs = args.map((arg) => arg === argument ? null : arg);

            expect(() => service.log.apply(service[level], testArgs))
              .toThrow(`${argument} should be set`);

          });

        });

      }

    }

  });

});
