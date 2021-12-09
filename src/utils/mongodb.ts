// ! Imports
// * Modules
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cluster from 'cluster';
// * Loggers
import logger from '../logs/index.logs';

// ! Environment Variables Configuration
dotenv.config();

// ! MongoDB Connection
if (process.env.MONGO_URI !== undefined) {
	if (cluster.isPrimary !== true) {
		mongoose.connect(process.env.MONGO_URI, (err) => {
			if (!err) {
				logger.info(`Worker [PID: ${process.pid}] connected to MongoDB`);
			} else {
				console.log(err);
			}
		});
	}
} else {
	throw new Error('Mongo URI not found in ENV file');
}

// ! Exports
export default mongoose;
