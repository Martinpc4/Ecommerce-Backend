// ! Imports
// * Modules
import { Logger } from 'winston';
// * Logs
import buildDevLogger from './dev-logger.logs';
import buildProdLogger from './prod-logger.logs';
// * Utils
import env from '../../utils/env.utils';

// ! Logger Constructor
let logger: Logger;

if (env.NODE_ENV === 'production') {
	logger = buildProdLogger();
} else {
	logger = buildDevLogger();
}

// ! Exports
export default logger;
