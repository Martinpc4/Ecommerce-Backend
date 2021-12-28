// ! Imports
// * Modules
import {ExtractJwt, Strategy, VerifiedCallback} from 'passport-jwt';
// * Classes
import {SecureUserClass} from '../classes/users.classes';
// * Controllers
import UsersController from '../controllers/user.controller';
// * Data Access Objects
import UsersDAO from '../daos/users.daos';
// * Utils
import env from '../utils/env.utils';
import {JwtPayload} from "jsonwebtoken";

// ! JWT Strategy Definition
const JSONWebTokenStrategy: Strategy = new Strategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: env.PUBLIC_KEY,
        algorithms: ['RS256']
    },
    async (payload: JwtPayload, done: VerifiedCallback) => {
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
