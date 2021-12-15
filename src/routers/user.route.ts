// ! Imports
// * Modules
import { Request, Response, Router } from 'express';
// * Controllers
import UsersController from '../controllers/user.controller';
// * Classes
import { UserClass } from '../classes/users.classes';
// * Interfaces
import { userPropertiesInterface } from '../interfaces/users.interfaces';
// * Models
import ProductModel from '../models/products.model';
// * Config
import mongoose from '../config/mongodb.config';
// * Loggers
import logger from '../logs/index.logs';
// * Middlewares
import isAuthenticated from '../middlewares/isAuthenticated.middleware';

// ! Route Definition

// * USER Router
const USER: Router = Router();

// * USER Routes
// Get user profile
USER.get('/', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const userInstance: any | undefined = req.user;
		if (userInstance === undefined) {
			throw new Error('Internal Server Error');
		}
		res.status(200).json({
			name: userInstance.name,
			lastName: userInstance.lastName,
			timeStamp: userInstance.timeStamp,
			email: userInstance.email.email,
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
USER.put('/testing', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const userInstance: any | undefined = req.user;
		if (userInstance === undefined) {
			throw new Error('Internal Server Error: Unauthorised user access');
		}
		const userProperties: userPropertiesInterface = req.body;
		const updateStatus: boolean = await UsersController.updateUser(userInstance._id, new UserClass(userProperties));
        if (updateStatus){
            res.status(200);
            logger.http({
                message: 'User profile updated',
                router: 'USER',
                method: 'PUT',
                route: '/',
            });
        } else {
            throw new Error('Error updating user profile');
        }
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
