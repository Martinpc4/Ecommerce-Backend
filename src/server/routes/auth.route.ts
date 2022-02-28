// ! Imports
// * Modules
import { Router } from 'express';
// * Auth
import passport from '../../auth/passport.auth';
// * Controllers
import AuthController from '../../controllers/auth.controller';

// ! Route Definition
// * AUTH Router
const AUTH: Router = Router();

// ! Routes

// * Local Auth
//  Log In
AUTH.post(
	'/login',
	passport.authenticate('login', {
		failureRedirect: '/auth/faillogin',
	}),
	AuthController.logIn
);
AUTH.get('/faillogin', AuthController.failLogin);

// Sign Up
AUTH.post('/signup', passport.authenticate('signup', { failureRedirect: '/auth/failsignup' }), AuthController.signUp);
AUTH.get('/failsignup', AuthController.failSignUp);

// * Facebook Auth
AUTH.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
AUTH.get(
	'/facebook/callback',
	passport.authenticate('facebook', { failureRedirect: '/auth/faillogin' }),
	AuthController.facebookCallback
);

// * GitHub Auth
// Login
AUTH.get('/github/login', passport.authenticate('github', { scope: ['user:email'] }));
AUTH.get(
	'/github/callback',
	passport.authenticate('github', { failureRedirect: '/auth/faillogin' }),
	AuthController.githubCallback
);

// ! Exports
export default AUTH;
