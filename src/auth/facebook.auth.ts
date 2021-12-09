// ! Imports
// * Modules
import { Strategy as FBStrategy } from 'passport-facebook';
import dotenv from 'dotenv';
// * Controllers
import UsersController from '../controllers/user.controller';
// * Classes
import { UserClass } from '../classes/users.classes';

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
		callbackURL: '/auth/facebook/callback',
		profileFields: ['id', 'name', 'emails', 'photos'],
	},
	async (accessToken, refreshToken, profile, done) => {
		if (profile.name !== undefined && profile.emails !== undefined) {
			if (await UsersController.verifyFacebookId(profile.id)) {
				const userInstance: UserClass = await UsersController.getUserByFacebookId(profile.id);
				done(null, userInstance);
			} else {
				done(new Error("Facebook user's account does not posses a linked account"), null);
			}
		} else {
			done(new Error('Facebook did not provide enough user data to register or login user'), false);
		}
	}
);

// ! Exports
export default FacebookSrategy;
