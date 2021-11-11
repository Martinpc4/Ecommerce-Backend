import winston from 'winston';
import { AbstractConfigSetLevels } from 'winston/lib/winston/config';

const { createLogger, format, transports } = winston;

function buildProdLogger() {
    const logLevels: AbstractConfigSetLevels = {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        http: 4,
        debug: 5,
        trace: 6,
    };
    
    const ProdLogger = createLogger({
        level: process.env.LOGGER_LEVEL || 'trace',
        levels: logLevels,
        format: format.combine(
            format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
            format.errors({ stack: true })
        ),
        transports: [
            new transports.Console({ level: 'trace' }),
            new transports.File({ level: 'http', filename: '/prod.log' }),
        ],
    });

    return ProdLogger;
}

export default buildProdLogger;