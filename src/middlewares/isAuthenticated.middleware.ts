// ! Imports
// * Modules
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// * Controllers
import UsersController from '../controllers/user.controller';
// * Classes
import { UserClass } from '../classes/users.classes';
// * Config
import environmentVariables from '../config/env.config';
// * Loggers
import logger from '../logs/index.logs';

// ! Middleware
async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
	try {
		const token: string | undefined = req.get('Authorization');
		if (token === undefined || token === 'null') {
			handleUnauthorized(res);
		}
		else {
			const payload: any = jwt.verify(token, environmentVariables.JWT_SECRET);
			
			const userData: UserClass = new UserClass(JSON.parse(payload.data));
			
			if (await UsersController.isUserById(userData._id)){
				const userInstance: UserClass = await UsersController.getUserById(userData._id);
				if (userInstance.password === userData.password) {
					req.user = userInstance;
					next();
				} else {
					handleUnauthorized(res);
				}
			}
		}
	} catch (err) {
		handleUnauthorized(res);
	}
}

// ! Helper Function
function handleUnauthorized(res: Response) {
	logger.http({
		message: 'Unauthorized user access',
	})
	res.status(401).send('Unauthorized');
}

// ! Exports
export default isAuthenticated;
