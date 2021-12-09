// ! Imports
// * Modules
import { Logger } from 'winston';
// * Loggers
import buildDevLogger from './dev-logger.logs';
import buildProdLogger from './prod-logger.logs';

// ! Logger Contruction
let logger: Logger;

if (process.env.NODE_ENV == 'production') {
	logger = buildProdLogger();
} else {
	logger = buildDevLogger();
}

// ! Exports
export default logger;
