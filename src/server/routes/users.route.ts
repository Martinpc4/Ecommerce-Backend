// ! Imports
// * Modules
import { Router } from 'express';
// * Auth
import passport from '../../auth/passport.auth';
// * Controllers
import UsersController from '../../controllers/user.controller';

// ! Route Definition
// * USERS Router
const USERS: Router = Router();

// * USERS Routes
// Get user profile
USERS.get('/profile', passport.authenticate('jwt', { session: false }), UsersController.getProfile);
// Update user profile
USERS.put('/update/profile', passport.authenticate('jwt', { session: false }), UsersController.updateProfile);
// Update user's password
USERS.put('/update/password', passport.authenticate('jwt', { session: false }), UsersController.updatePassword);
// Verify user's email
USERS.post('/verify', passport.authenticate('jwt', { session: false }), UsersController.verifyEmail);
// Send verification code via email to user
USERS.post(
	'/verification_code',
	passport.authenticate('jwt', { session: false }),
	UsersController.sendVerificationCode
);

// ! Exports
export default USERS;
