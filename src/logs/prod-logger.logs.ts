// ! Imports
// * Modules
import winston from 'winston';
import { AbstractConfigSetLevels } from 'winston/lib/winston/config';
// * Utils
import env from '../utils/env.utils';

// ! Logger Definition
const { createLogger, format, transports } = winston;

function buildProdLogger() {
	const logLevels: AbstractConfigSetLevels = {
		fatal: 0,
		error: 1,
		warn: 2,
		notice: 3,
		info: 4,
		http: 5,
		trace: 6,
	};

	return createLogger({
		level: env.LOGGER_LEVEL || 'trace',
		levels: logLevels,
		format: format.combine(format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }), format.errors({ stack: true })),
		transports: [
			new transports.Console({ level: 'trace' }),
			new transports.File({ level: 'http', filename: '/prod.log' }),
		],
	});
}

// ! Exports
export default buildProdLogger;
