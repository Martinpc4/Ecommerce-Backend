// ! Imports
// * Modules
import passport from 'passport';
// * Authentication
import GithubStrategy from './github.auth';
import FacebookSrategy from './facebook.auth';
import JSONWebTokenStrategy from './jwt.auth';
import { LoginLocalStrategy, SignupLocalStrategy } from './local.auth';
// * Data Access Objects
import UsersDAO from '../daos/users.daos';

// ! Passport Configuration
// * User Serialization
passport.serializeUser((user: any, done) => {
	done(null, user);
});
passport.deserializeUser(async (user: any, done) => {
	done(null, await UsersDAO.getSecureById(user._id));
});

// * Strategies Implementation 
passport.use('login', LoginLocalStrategy);
passport.use('signup', SignupLocalStrategy);
passport.use('facebook', FacebookSrategy);
passport.use('github', GithubStrategy);
passport.use('jwt', JSONWebTokenStrategy);

// ! Exports
export default passport;
