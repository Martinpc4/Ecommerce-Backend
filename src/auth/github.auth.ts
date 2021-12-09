// ! Imports
// * Modules
import { Strategy as GHStrategy } from 'passport-github2';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
// * Controllers
import UsersController from '../controllers/user.controller';
// * Classes
import { UserClass } from '../classes/users.classes';
// * Interfaces
import { userPropertiesInterface } from '../interfaces/users.interfaces';
// * Utils
import mongoose from '../utils/mongodb';

// ! Environment Variables Module
// Configuration
dotenv.config();
// Check for env variables
if (process.env.GITHUB_CLIENT_ID === undefined || process.env.GITHUB_CLIENT_SECRET === undefined) {
	throw new Error(`Github App Id or Client Secret not found in ENV file`);
}

// ! Github Strategy
const GithubStrategy: GHStrategy = new GHStrategy(
	{
		clientID: process.env.GITHUB_CLIENT_ID,
		clientSecret: process.env.GITHUB_CLIENT_SECRET,
		callbackURL: `${process.env.SERVER_ADDRESS}/auth/github/callback`,
		scope: ['user:email'],
	},
	async (accessToken: any, refreshToken: any, profile: any, done: any) => {
		try {
			if (await UsersController.verifyGithubId(profile.id)) {
				const userInstance: UserClass = await UsersController.getUserByGithubId(profile.id);
				done(null, userInstance);
			} else if (profile.name !== null && profile.emails[0].value !== undefined && profile.emails[0].value !== null) {
				const userProperties: userPropertiesInterface = {
					_id: new mongoose.Types.ObjectId(),
					password: await bcrypt.hash(await bcrypt.genSalt(10), 10),
					name: profile.displayName.split(' ')[0],
					lastName: profile.displayName.split(' ')[1],
					timeStamp: new Date(),
					email: {
						email: profile.emails[0].value,
						verified: false,
						verification_code: new mongoose.Types.ObjectId(),
					},
					cartId: null,
					linkedAccounts: {
						facebook: null,
						github: profile.id,
					},
					phoneNumber: {
						extension: Number(0),
						number: Number(0),
					},
					address: {
						postalCode: Number(0),
						street: ' ',
						streetNumber: Number(0),
						city: ' ',
						country: ' ',
						state: ' ',
					},
				};
				const flagVar: boolean = await UsersController.createUser(userProperties);

				if (flagVar) {
					const userInstance: UserClass = await UsersController.getUserByGithubId(profile.id);
					done(null, userInstance);
				} else {
					done(new Error("Internal Server Error"), null);
				}
			} else {
				done(new Error('Github did not provide enough user data to register or login user'), false);
			}
		} catch (err) {
			done(err, false);
		}
	}
);

// ! Exports
export default GithubStrategy;
