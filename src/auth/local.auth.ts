// ! Imports
// * Modules
import { Strategy as LStrategy } from 'passport-local';
import { Request } from 'express';
import bcrypt from 'bcrypt';
// * Controllers
import UsersController from '../controllers/user.controller';
// * Classes
import { UnsecureUserClass, SecureUserClass } from '../classes/users.classes';
// * Interfaces
import { userPropertiesInterface } from '../interfaces/users.interfaces';
// * Models
import UserModel from '../models/users.model';
// * Config
import mongoose from '../services/mongodb.services';
import UsersDAO from '../daos/users.daos';

// ! Local Strategy
// * Signup Strategy
const SignupLocalStrategy = new LStrategy(
	{ passReqToCallback: true, passwordField: 'password', usernameField: 'email' },
	async (req: Request, username: string, password: string, done: any): Promise<void> => {
		try {
			if (await UsersController.existsByFacebookId(username)) {
				done(null, false); // User Found in Database
			} else {
				if (
					req.body.name !== undefined &&
					req.body.lastName !== undefined &&
					req.body.postalCode !== undefined &&
					req.body.city !== undefined &&
					req.body.street !== undefined &&
					req.body.streetNumber !== undefined &&
					req.body.country !== undefined &&
					req.body.state !== undefined &&
					req.body.phoneNumber !== undefined &&
					req.body.phoneExtension !== undefined
				) {
					const userProperties: userPropertiesInterface = {
						_id: new mongoose.Types.ObjectId(),
						password: await bcrypt.hash(password, 10),
						name: req.body.name,
						lastName: req.body.lastName,
						timeStamp: new Date(),
						email: {
							email: username,
							verified: false,
							verification_code: new mongoose.Types.ObjectId(),
						},
						cartId: null,
						linkedAccounts: {
							facebook: null,
							github: null,
						},
						phoneNumber: {
							extension: Number(req.body.phoneExtension),
							number: Number(req.body.phoneNumber),
						},
						address: {
							postalCode: Number(req.body.postalCode),
							street: req.body.street,
							streetNumber: Number(req.body.streetNumber),
							city: req.body.city,
							country: req.body.country,
							state: req.body.state,
						},
					};

					await UsersController.createUser(userProperties);

					
					if (await UsersController.existsByEmail(username)) {
						const userInstance: SecureUserClass | null = await UsersDAO.getSecureById(userProperties._id);
						if (userInstance == null) {
							done(new Error('Internal server error: User not found'), false);
						}
						return done(null, userInstance);
					} else {
						return done(null, false); // User not added to database by error
					}
				} else {
					return done(null, false); // Missing user data
				}
			}
		} catch (err) {
			done(null, err); // General Error
		}
	}
);

// * Login Strategy
const LoginLocalStrategy = new LStrategy(
	{ passReqToCallback: false, passwordField: 'password', usernameField: 'username' },
	async (username, password, done: any) => {
		const userData: userPropertiesInterface | null = await UserModel.findOne({
			'email.email': { $eq: username },
		});

		if (userData === null) {
			return done(null, false);
		}
		
		if (!(await bcrypt.compare(password, userData.password))) {
			return done(null, false);
		} else {
			return done(null, userData);
		}
	}
);

// ! Exports
export { LoginLocalStrategy, SignupLocalStrategy };
