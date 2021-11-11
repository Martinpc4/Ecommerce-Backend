import winston from 'winston';
import { AbstractConfigSetLevels } from 'winston/lib/winston/config';

const { createLogger, format, transports } = winston;

function buildDevLogger() {
    const logLevels: AbstractConfigSetLevels = {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        http: 4,
        debug: 5,
        trace: 6,
    };

    const loggerFormat = format.printf(({ level, message, timestamp, stack, router, method, route }) => {
        return `(${timestamp}) ${level}${method !== undefined ? ` [${method}]`:''}${router !== undefined ? route !== undefined ? ` (${router}${route})`: ` (${router})` :''}: ${stack || message}`;
    });

    const DevLogger: winston.Logger = createLogger({
        level: 'trace',
        levels: logLevels,
        format: format.combine(
            format.colorize(),
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.errors({ stack: true }),
            loggerFormat,
        ),
        transports: [
            new transports.Console({ level: 'trace' }),
            new transports.File({ level: 'trace', filename: '/dev.logs' }),
        ],
    });

    return DevLogger;
}

export default buildDevLogger;
