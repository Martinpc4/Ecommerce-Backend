// ! Imports
// * Modules
import { Strategy as GHStrategy } from 'passport-github2';
import dotenv from 'dotenv';
// * Controllers
import UsersController from '../controllers/user.controller';
// * Classes
import { UserClass } from '../classes/users.classes';

// ! Environment Variables Module
// Configuration
dotenv.config();
// Check for env variables
if (process.env.GITHUB_CLIENT_ID === undefined || process.env.GITHUB_CLIENT_SECRET === undefined) {
	throw new Error(`Github App Id or Client Secret not found in ENV file`);
}

// ! Github Strategy
const GithubStrategy = new GHStrategy(
	{
		clientID: process.env.GITHUB_CLIENT_ID,
		clientSecret: process.env.GITHUB_CLIENT_SECRET,
		callbackURL: 'http://localhost:8080/auth/github/callback',
		scope: ['user:email'],
	},
	async (accessToken: any, refreshToken: any, profile: any, done: any) => {
		try {
			if (profile.name !== null && profile.emails[0].value !== undefined && profile.emails[0].value !== null) {
				if (await UsersController.verifyGithubId(profile.id)) {
					const userInstance: UserClass = await UsersController.getUserByGithubId(profile.id);
					done(null, userInstance);
				} else {
					done(new Error("GitHub user's account does not posses a linked account"), null);
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
