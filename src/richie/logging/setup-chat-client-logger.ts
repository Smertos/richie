import { LoggerOptions, LogLevel } from '@d-fischer/logger';
import { Logger } from 'winston';

const logLevelConversionMap: Record<LogLevel, Extract<keyof Logger, string>> = {
    [LogLevel.CRITICAL]: 'crit',
    [LogLevel.ERROR]: 'error',
    [LogLevel.WARNING]: 'warn',
    [LogLevel.INFO]: 'info',
    [LogLevel.DEBUG]: 'verbose', // Chat client debug log is too verbose
    [LogLevel.TRACE]: 'verbose'
};

export function setupChatClientLogger(logger: Logger): Pick<LoggerOptions, 'custom'> {
    return {
        custom: (level: LogLevel, message: string) => {
            const convertedLogLevel = logLevelConversionMap[level];

            logger.log(convertedLogLevel, message);
        }
    }
}
