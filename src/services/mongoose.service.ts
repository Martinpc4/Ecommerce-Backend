// ! Imports
// * Modules
import mongoose from 'mongoose';
import cluster from 'cluster';
// * Logs
import logger from '../server/logs/index.logs';
// * Utils
import env from '../utils/env.utils';
import args from '../utils/args.utils';

// ! MongoDB Connection

if (!cluster.isPrimary && args.storage === 'mongoose') {
	mongoose.connect(env.MONGODB_URI, (err) => {
		if (!err) {
			logger.info(`Worker [PID: ${process.pid}] connected to MongoDB`);
		} else {
		}
	});
}

// ! Exports
export default mongoose;
