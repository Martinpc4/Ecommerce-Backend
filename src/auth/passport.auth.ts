// ! Imports
// * Modules
import passport from 'passport';
// * Models
import UserModel from '../models/users.model';
// * Strategies
import GithubStrategy from './github.auth';
import FacebookSrategy from './facebook.auth';
import { LoginLocalStrategy, SignupLocalStrategy } from './local.auth';

// ! Passport Module Configuration

// * Strategies
passport.use('login', LoginLocalStrategy);
passport.use('signup', SignupLocalStrategy);
passport.use('facebook', FacebookSrategy);
passport.use('github', GithubStrategy);

// * User Serialization
passport.serializeUser((user: any, done) => {
    done(null, user._id);
});
passport.deserializeUser(async (userId, done) => {
    done(null, await UserModel.findById(userId));
});

// ! Passport Module Export
export default passport;
