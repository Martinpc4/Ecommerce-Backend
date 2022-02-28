// ! Imports
// * Modules
import { Strategy as FBStrategy } from 'passport-facebook';
// * DTOs
import { SecureUserClass } from '../models/DTOs/user.dto';
// * Services
import UserService from '../services/user.service';
// * Utils
import env from '../utils/env.utils';

// ! Strategy Definition
const FacebookStrategy = new FBStrategy(
	{
		clientID: `${env.FACEBOOK_APP_ID}`,
		clientSecret: `${env.FACEBOOK_APP_SECRET}`,
		callbackURL: `${env.BACKEND_URL}/auth/facebook/callback`,
		profileFields: ['id', 'name', 'emails', 'photos'],
	},
	async (accessToken, refreshToken, profile, done) => {
		try {
			if (await UserService.existsByFacebookId(profile.id)) {
				const userInstance: SecureUserClass = await UserService.getUserByFacebookId(profile.id);
				done(null, userInstance);
			} else if (profile.name !== undefined && profile.emails !== undefined) {
				if (await UserService.existsByEmail(profile.emails[0].value)) {
					const userInstance: SecureUserClass = await UserService.getSecureByUsername(
						profile.emails[0].value
					);
					await UserService.linkFacebookAccount(userInstance._id, profile.id);
					if (await UserService.existsByFacebookId(profile.id)) {
						if (
							!(await UserService.isEmailVerified(userInstance._id)) &&
							userInstance.email.verification_code !== null
						) {
							await UserService.verifyUserEmail(userInstance._id, userInstance.email.verification_code);
						}
						done(null, userInstance);
					} else {
						done(null, false); // Could not link the Facebook account to the user account
					}
				} else {
					done(null, false); // Could not find a user with the same email as the Facebook profile
				}
			} else {
				done(null, false); // Facebook did not provide enough user data to register or login user
			}
		} catch (err) {
			done(err, false);
		}
	}
);

// ! Exports
export default FacebookStrategy;
