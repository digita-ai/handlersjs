/* eslint-disable no-console -- this is a logger service */

import { HandlerArgumentError } from '@digita-ai/handlersjs-core';
import { Logger } from '../models/logger';
import { LoggerLevel } from '../models/logger-level';

/**
 * JavaScript console-based logger service
 */
export class ConsoleLogger extends Logger {

  constructor(
    protected readonly label: string,
    protected readonly minimumLevel: LoggerLevel,
    protected readonly minimumLevelPrintData: LoggerLevel,
  ) {

    super(label, minimumLevel, minimumLevelPrintData);

  }

  /**
   * Logs a message at the specified level
   *
   * @param { LoggerLevel } level - The logging level (severity) of the message.
   * @param { string } message - The message to log.
   * @param { unknown } data (optional) - Additional data to log.
   */
  log(level: LoggerLevel, message: string, data?: unknown): void {

    if (level === null || level === undefined) {

      throw new HandlerArgumentError('level should be set', this.label);

    }

    if (!message) {

      throw new HandlerArgumentError('message should be set', message);

    }

    const timestamp: string = new Date().toISOString();

    if (level <= this.minimumLevel) {

      const logMessage = `[${timestamp} ${this.label}] ${message}`;
      const logData = level > this.minimumLevelPrintData ? '' : data||'';
      const log = [ logMessage, logData ];

      switch (level) {

        case LoggerLevel.info:
          console.info(...log);
          break;

        case LoggerLevel.debug:
          console.debug(...log);
          break;

        case LoggerLevel.warn:
          console.warn(...log);
          break;

        case LoggerLevel.error:
          console.error(...log);
          break;

        default:
          console.log(...log);
          break;

      }

    }

  }

}
