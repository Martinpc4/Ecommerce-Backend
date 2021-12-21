// ! Imports
// * Modules
import { Request, Response, Router } from 'express';
// * Authentication
import passport from '../auth/passport.auth';
// * Classes
import { UnsecureUserClass } from '../classes/users.classes';
// * Controllers
import UsersController from '../controllers/user.controller';
// * Types
import { userPropertiesInterface } from '../interfaces/users.interfaces';
// * Loggers
import logger from '../logs/index.logs';

// ! Route Definition

// * USER Router
const USER: Router = Router();

// * USER Routes
// Get user profile
USER.get('/', passport.authenticate('jwt', { session: false }), async (req: Request, res: Response) => {
	try {
		const userInstance: any | undefined = req.user;
		if (userInstance === undefined) {
			throw new Error('Internal Server Error');
		}
		res.status(200).json({
			name: userInstance.name,
			lastName: userInstance.lastName,
			timeStamp: userInstance.timeStamp,
			email: userInstance.email,
			cartId: userInstance.cartId,
			phoneNumber: userInstance.phoneNumber,
			address: userInstance.address,
		});
		logger.http({
			message: 'User profile requested and sent',
			router: 'USER',
			method: 'GET',
			route: '/',
		});
	} catch (err) {
		logger.error({
			message: 'Get user profile failed',
			router: 'USER',
			method: 'GET',
			route: '/',
			stack: err,
		});
		res.status(500).send(err);
	}
});
// Update user profile
USER.put('/update', passport.authenticate('jwt', { session: false }), async (req: Request, res: Response) => {
	try {
		const userInstance: any | undefined = req.user;
		if (userInstance === undefined) {
			throw new Error('Internal Server Error: Unauthorised user access');
		}

		const newUserInstance: userPropertiesInterface = new UnsecureUserClass(req.body);

		await UsersController.updateUser(userInstance._id, newUserInstance);

		res.status(200).send('User profile updated correctly');
		logger.http({
			message: 'User profile updated',
			router: 'USER',
			method: 'PUT',
			route: '/',
		});
	} catch (err) {
		logger.error({
			message: 'Update user profile failed',
			router: 'USER',
			method: 'PUT',
			route: '/',
			stack: err,
		});
		res.status(500).send(err);
	}
});

// ! Exports
export default USER;
