// ! Imports
// * Modules
import { Strategy as GHStrategy } from 'passport-github2';
// * DTOs
import { SecureUserClass } from '../models/DTOs/user.dto';
// * Services
import UserService from '../services/user.service';
// * Utils
import env from '../utils/env.utils';

// ! Strategy Definition
const GithubStrategy: GHStrategy = new GHStrategy(
	{
		clientID: env.GITHUB_CLIENT_ID,
		clientSecret: env.GITHUB_CLIENT_SECRET,
		callbackURL: `${env.BACKEND_URL}/auth/github/callback`,
		scope: ['user:email'],
	},
	async (accessToken: any, refreshToken: any, profile: any, done: any) => {
		try {
			if (await UserService.existsByGithubId(profile.id)) {
				const userInstance: SecureUserClass = await UserService.getSecureByGithubId(profile.id);
				done(null, userInstance);
			} else if (
				profile.name !== null &&
				profile.emails[0].value !== undefined &&
				profile.emails[0].value !== null
			) {
				if (await UserService.existsByEmail(profile.emails[0].value)) {
					const userInstance: SecureUserClass = await UserService.getSecureByUsername(
						profile.emails[0].value
					);
					await UserService.linkGithubAccount(userInstance._id, profile.id);
					if (await UserService.existsByGithubId(profile.id)) {
						if (
							!(await UserService.isEmailVerified(userInstance._id)) &&
							userInstance.email.verification_code !== null
						) {
							await UserService.verifyUserEmail(userInstance._id, userInstance.email.verification_code);
						}
						done(null, userInstance);
					} else {
						done(null, false); // Could not link the GitGub account to the user account
					}
				} else {
					done(null, false); // Could not find a user with the same email as the GitHub profile
				}
			} else {
				done(null, false); // Github did not provide enough user data to register or login user
			}
		} catch (err) {
			done(err, false);
		}
	}
);

// ! Exports
export default GithubStrategy;
