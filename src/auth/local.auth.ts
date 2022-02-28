// ! Imports
// * Modules
import { Strategy as LStrategy } from 'passport-local';
// * DTOs
import { SecureUserClass } from '../models/DTOs/user.dto';
// * Factories
import UserDAO from '../models/factories/user.factory';
// * Interfaces
import { Request } from 'express';
import { unsecureUserPropertiesInterface, UserRoles } from '../models/interfaces/user.interface';
import { Types } from 'mongoose';
// * Services
import UserService from '../services/user.service';
// * Utils
import { hashPassword } from '../utils/crypto.utils';

// ! Strategy Definition
// * Signup Strategy
const SignupLocalStrategy = new LStrategy(
	{ passReqToCallback: true, passwordField: 'password', usernameField: 'email' },
	async (req: Request, username: string, password: string, done: any): Promise<void> => {
		try {
			if (await UserService.existsByEmail(username)) {
				done(null, false);
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
					const userProperties: unsecureUserPropertiesInterface = {
						_id: new Types.ObjectId(),
						password: await hashPassword(password),
						name: req.body.name,
						lastName: req.body.lastName,
						timeStamp: new Date(),
						email: {
							email: username,
							verified: false,
							verification_code: new Types.ObjectId(),
						},
						cartId: null,
						role: UserRoles.user,
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

					await UserService.createUser(userProperties);

					if (await UserService.existsByEmail(username)) {
						const userInstance: SecureUserClass | null = await UserDAO.getSecureById(userProperties._id);
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
	async (username: string, password: string, done: any) => {
		if (await UserService.existsByEmail(username)) {
			const secureUserInstance: SecureUserClass | null = await UserDAO.getSecureByEmail(username);
			if (secureUserInstance == null) {
				return done(new Error('Internal server error: User not found'), false);
			}
			if (!(await UserService.verifyPassword(secureUserInstance._id, password))) {
				return done(null, false);
			} else {
				return done(null, secureUserInstance);
			}
		} else {
			return done(null, false);
		}
	}
);

// ! Exports
export { LoginLocalStrategy, SignupLocalStrategy };
