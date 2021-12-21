// ! Imports
// * Modules
import mongoose from 'mongoose';
import cluster from 'cluster';
// * Loggers
import logger from '../logs/index.logs';
// * Utils
import env from '../utils/env.utils';

// ! MongoDB Connection
if (cluster.isPrimary !== true) {
	mongoose.connect(env.MONGODB_URI, (err) => {
		if (!err) {
			logger.info(`Worker [PID: ${process.pid}] connected to MongoDB`);
		} else {
			console.log(err);
		}
	});
}

// ! Exports
export default mongoose;
