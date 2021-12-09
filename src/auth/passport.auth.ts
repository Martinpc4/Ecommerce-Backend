// ! Imports
// * Modules
import passport from 'passport';
// * Models
import UsersModel from '../models/users.model';
// * Auth Strategies
import GithubStrategy from './github.auth';
import FacebookSrategy from './facebook.auth';
import { LoginLocalStrategy, SignupLocalStrategy } from './local.auth';

// ! Passport Configuration
// * User Serialization
passport.serializeUser((user: any, done) => {
	done(null, user);
});
passport.deserializeUser(async (user: any, done) => {
	done(null, await UsersModel.findById(user._id));
});

// * Strategies
passport.use('login', LoginLocalStrategy);
passport.use('signup', SignupLocalStrategy);
passport.use('facebook', FacebookSrategy);
passport.use('github', GithubStrategy);

// ! Exports
export default passport;
