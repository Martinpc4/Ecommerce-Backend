// ! Imports
// * Modules
import { ExtractJwt, Strategy as JWTStrategy } from 'passport-jwt';
// * Classes
import { SecureUserClass } from '../classes/users.classes';
// * Controllers
import UsersController from '../controllers/user.controller';
// * Data Access Objects
import UsersDAO from '../daos/users.daos';
// * Utils
import env from '../utils/env.utils';

// ! JWT Strategy Definition
const JSONWebTokenStrategy: JWTStrategy = new JWTStrategy(
	{
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: env.PUBLIC_KEY,
        algorithms: ['RS256']
	},
	async (payload, done) => {
        if (await UsersController.existsById(payload._id)) {
            const userData: SecureUserClass | null = await UsersDAO.getSecureById(payload._id);
            if (userData == null) {
                done(new Error('Internal server error: User not found'), false)
            }
            return done(null, userData);
        } else {
            done(false, null);
        }
    }
);

// ! Exports
export default JSONWebTokenStrategy;
