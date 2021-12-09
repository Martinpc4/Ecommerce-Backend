// ! Imports
// * Modules
import { Strategy as FBStrategy } from 'passport-facebook';
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
if (process.env.FACEBOOK_APP_ID === undefined || process.env.FACEBOOK_APP_SECRET === undefined) {
	throw new Error(`Facebbok App Id or Client Secret not found in ENV file`);
}

// ! Facebook Strategy
const FacebookSrategy = new FBStrategy(
	{
		clientID: `${process.env.FACEBOOK_APP_ID}`,
		clientSecret: `${process.env.FACEBOOK_APP_SECRET}`,
		callbackURL: `${process.env.SERVER_ADDRESS}/auth/facebook/callback`,
		profileFields: ['id', 'name', 'emails', 'photos'],
	},
	async (accessToken, refreshToken, profile, done) => {
		if (await UsersController.verifyFacebookId(profile.id)) {
			const userInstance: UserClass = await UsersController.getUserByFacebookId(profile.id);
			done(null, userInstance);
		} else if (profile.name !== undefined && profile.emails !== undefined) {
			console.log(profile);
			const userProperties: userPropertiesInterface = {
				_id: new mongoose.Types.ObjectId(),
				password: await bcrypt.hash(await bcrypt.genSalt(10), 10),
				name: `${profile.name.givenName}${profile.name.middleName !== undefined ? ` ${profile.name.middleName}` : ''}`,
				lastName: profile.name.familyName,
				timeStamp: new Date(),
				email: {
					email: profile.emails[0].value,
					verified: false,
					verification_code: new mongoose.Types.ObjectId(),
				},
				cartId: null,
				linkedAccounts: {
					facebook: profile.id,
					github: null,
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
				const userInstance: UserClass = await UsersController.getUserByFacebookId(profile.id);
				done(null, userInstance);
			} else {
				done(new Error('Internal Server Error'), null);
			}
		} else {
			done(new Error('Facebook did not provide enough user data to register or login user'), false);
		}
	}
);

// ! Exports
export default FacebookSrategy;
