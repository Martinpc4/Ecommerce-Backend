// ! Imports
// * Modules
import winston from 'winston';
// * Interfaces
import { AbstractConfigSetLevels } from 'winston/lib/winston/config';
// * Utils
import env from '../../utils/env.utils';

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

	const loggerFormat = format.printf(({ level, message, timestamp, stack, router, method, route }) => {
		return `(${timestamp}) ${level}${method !== undefined ? ` [${method}]` : ''}${
			router !== undefined ? (route !== undefined ? ` (${router}${route})` : ` (${router})`) : ''
		}: ${stack || message}`;
	});

	const ProdLogger: winston.Logger = createLogger({
		level: env.LOGGER_LEVEL,
		levels: logLevels,

		format: format.combine(
			format.colorize(),
			format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
			format.errors({ stack: true }),
			loggerFormat
		),
		transports: [
			new transports.Console({ level: 'trace' }),
			new transports.File({ level: env.LOGGER_LEVEL, filename: '/prod.logs' }),
		],
	});
	return ProdLogger;
}

// ! Exports
export default buildProdLogger;
