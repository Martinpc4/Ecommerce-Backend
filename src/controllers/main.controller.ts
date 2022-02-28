// ! Imports
// * Interfaces
import { Response, Request } from 'express';
// * Logs
import logger from '../server/logs/index.logs';
// * Utils
import args from '../utils/args.utils';
import env from '../utils/env.utils';

// ! Controller Definition
class MainControllerClass {
	async getStatus(req: Request, res: Response): Promise<void> {
		try {
			res.status(200).render('stats', {
				arguments: process.argv,
				platform: process.platform,
				node: process.version,
				memory: process.memoryUsage(),
				path: process.execPath,
				id: process.pid,
				directory: process.cwd(),
				port: env.PORT,
				env: env.NODE_ENV,
				storage: args.storage,
			});
			logger.http({
				message: 'Successfully retrieve server information and status',
				method: 'GET',
				route: '/info',
				router: 'MAIN',
			});
		} catch (err) {
			res.status(500).send(`[GET] Get process info:\n\n${err}`);
			logger.error({
				message: `Getting server information and status failure`,
				method: `GET`,
				router: 'MAIN',
				route: `/info`,
				stack: err,
			});
		}
	}
}

// ! Controller Instance
const MainController = new MainControllerClass();

// ! Exports
export default MainController;
