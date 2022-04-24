import { TransformableInfo } from 'logform';
import winston, { createLogger, format } from 'winston';

const ignoreVerbose = format((info: TransformableInfo): TransformableInfo | boolean => {
  if (info.level === 'verbose') {
    return false;
  }

  return info;
});

export function setupWinstonLogger(): winston.Logger {
  const logger = createLogger({
    format: winston.format.json(),
    level: 'info',
    transports: [
      new winston.transports.File({ filename: 'logs/errors.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' })
    ]
  });

  const consoleTransport = new winston.transports.Console({
    format: winston.format.combine(
      winston.format.splat(),
      ignoreVerbose(),
      winston.format.colorize({ all: true }),
      winston.format.align(),
      winston.format.simple()
    ),
    level: process.env.ENVIRONMENT !== 'development' ? 'info' : 'debug'
  });

  logger.add(consoleTransport);

  return logger;
}
