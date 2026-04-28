import { Logger as NestLogger } from '@nestjs/common';

export class Logger {
  private static context = 'App';

  static log(message: string, context?: string) {
    NestLogger.log(message, context || this.context);
  }

  static error(message: string, trace?: string, context?: string) {
    NestLogger.error(message, trace, context || this.context);
  }

  static warn(message: string, context?: string) {
    NestLogger.warn(message, context || this.context);
  }

  static debug(message: string, context?: string) {
    NestLogger.debug(message, context || this.context);
  }

  static verbose(message: string, context?: string) {
    NestLogger.verbose(message, context || this.context);
  }

  static setContext(context: string) {
    this.context = context;
  }
}