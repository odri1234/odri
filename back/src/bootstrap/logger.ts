import { Logger } from '@nestjs/common';

export function createLogger(): Logger {
  return new Logger('Bootstrap');
}