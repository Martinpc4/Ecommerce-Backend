// ! Imports
// * Modules
import { Strategy as LStrategy } from 'passport-local';
import dotenv from 'dotenv';
import { Request } from 'express';
import bcrypt from 'bcrypt';
// * Controllers
import UsersController from '../controllers/user.controller';
// * Classes
import { UserClass } from '../classes/users.classes';
// * Interfaces
import { userPropertiesInterface } from '../interfaces/users.interfaces';
// * Models
import UserModel from '../models/users.model';
// * Utils
import mongoose from '../utils/mongodb';

// ! Environment Variables Module
dotenv.config();

// ! Local Strategy
const SignupLocalStrategy = new LStrategy(
	{ passReqToCallback: true, passwordField: 'password', usernameField: 'email' },
	async (req: Request, username: string, password: string, done: any): Promise<void> => {
		try {
			if (await UsersController.isUserByUsername(username)) {
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

					const userInstance: UserClass = await UsersController.getUserById(userProperties._id);

					if (await UsersController.isUserByUsername(username)) {
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

const LoginLocalStrategy = new LStrategy(async (username, password, done) => {
	const userData = await UserModel.findOne({
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
});

// ! Exports
export { LoginLocalStrategy, SignupLocalStrategy };
