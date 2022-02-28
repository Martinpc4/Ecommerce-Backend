// ! Imports
// * Modules
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
// * DTOs
import { SecureUserClass } from '../models/DTOs/user.dto';
// * Factories
import UserDAO from '../models/factories/user.factory';
// * Interfaces
import { JwtPayload } from 'jsonwebtoken';
// * Services
import UserService from '../services/user.service';
// * Utils
import env from '../utils/env.utils';

// ! Strategy Definition
const JSONWebTokenStrategy: Strategy = new Strategy(
	{
		jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
		secretOrKey: env.PUBLIC_KEY,
		algorithms: ['RS256'],
	},
	async (payload: JwtPayload, done: VerifiedCallback) => {
		if (await UserService.existsById(payload._id)) {
			const userData: SecureUserClass | null = await UserDAO.getSecureById(payload._id);
			if (userData == null) {
				done(new Error('Internal server error: User not found'), false);
			}
			return done(null, userData);
		} else {
			done(false, null);
		}
	}
);

// ! Exports
export default JSONWebTokenStrategy;
