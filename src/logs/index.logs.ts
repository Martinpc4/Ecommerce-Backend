import { Logger } from 'winston';
import buildDevLogger from './dev-logger.logs';
import buildProdLogger from './prod-logger.logs';

let logger: Logger;

if (process.env.NODE_ENV == 'production') {
    logger = buildProdLogger();
} else {
    logger = buildDevLogger();
}

export default logger;