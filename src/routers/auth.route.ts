// ! Imports
// * Modules
import { Request, Response, Router } from 'express';
import multer from 'multer';
import path from 'path';
// * Controllers
import UsersController from '../controllers/user.controller';
// * Utils
import mongoose from '../utils/mongodb';
// * Auth Strategies
import passport from '../auth/passport.auth';
// * Loggers
import logger from '../logs/index.logs';

// ! Route Definition

// * AUTH Router
const AUTH: Router = Router();

// ! Routes

// * Local Auth
// Email Verification
AUTH.post('/:userId/verify_email/:verificationCode', async (req: Request, res: Response) => {
	try {
		if (req.params.userId === undefined && req.params.verificationCode === undefined) {
			res.status(400).json({ success: false, message: 'Invalid Request' });
			logger.notice({
				message: 'Invalid Request',
				router: 'AUTH',
				method: 'POST',
				route: '/:userId/verify_email/:verificationCode',
			});
		}
		const userId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(req.params.userId);
		const verificationCode: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(req.params.verificationCode);
		const flagVar: boolean = await UsersController.verifyUserEmail(userId, verificationCode);
		if (flagVar) {
			res.status(200).json({ success: true, message: 'Email Verified' });
			logger.notice({
				message: 'Email Verified',
				router: 'AUTH',
				method: 'POST',
				route: '/:userId/email_v/:verificationCode',
			});
		} else {
			res.status(400).json({ success: false, message: 'Verification Failed' });
			logger.notice({
				message: 'Verficiation Failed',
				router: 'AUTH',
				method: 'POST',
				route: '/:userId/verify_email/:verificationCode',
			});
		}
	} catch (err) {
		logger.error({
			message: 'Error in verifying email',
			router: 'AUTH',
			method: 'POST',
			route: '/:userId/verify_email/:verificationCode',
			stack: err,
		});
		res.status(500).json({ success: false, message: 'Internal Server Error', stack: err });
	}
});
//  Log In
AUTH.get('/login', (req: Request, res: Response) => {
	try {
		res.render('login_form');
	} catch (err) {
		logger.error({
			message: 'Login form failure',
			router: 'AUTH',
			method: 'GET',
			route: '/login',
			stack: err,
		});
		res.status(500).send('Internal Server Error');
	}
});
//TODO FINISH THIS
AUTH.get('/logout', (req: Request, res: Response) => {
	req.session.destroy((err) => {
		throw new Error();
	});
	res.status(200).redirect(process.env.HOME_ROUTE !== undefined ? process.env.HOME_ROUTE : '/');
});
AUTH.get('/faillogin', (req: Request, res: Response) => {
	try {
		logger.notice({
			message: 'Login form failure',
			router: 'AUTH',
			method: 'GET',
			route: '/faillogin',
		});
		res.render('fail_login');
	} catch (err) {
		logger.error({
			message: 'Login Fail form failure',
			router: 'AUTH',
			method: 'GET',
			route: '/faillogin',
			stack: err,
		});
		res.status(500).send('Internal Server Error');
	}
});
AUTH.post(
	'/login',
	passport.authenticate('login', {
		failureRedirect: '/auth/faillogin',
	}),
	(req: Request, res: Response) => {
		res.status(200).redirect(process.env.HOME_ROUTE !== undefined ? process.env.HOME_ROUTE : '/');
	}
);

// Sign Up
AUTH.get('/signup', (req: Request, res: Response) => {
	try {
		res.render('signup_form');
	} catch (err) {
		logger.error({
			message: 'Signup form failure',
			router: 'AUTH',
			method: 'GET',
			route: '/signup',
			stack: err,
		});
		res.status(500).send('Internal Server Error');
	}
});
AUTH.get('/failsignup', (req: Request, res: Response) => {
	try {
		logger.notice({
			message: 'Signup form failure',
			router: 'AUTH',
			method: 'GET',
			route: '/failsignup',
		});
		res.render('fail_signup');
	} catch (err) {
		logger.error({
			message: 'Signup Fail form failure',
			router: 'AUTH',
			method: 'GET',
			route: '/failsignup',
			stack: err,
		});
		res.status(500).send('Internal Server Error');
	}
});
AUTH.post(
	'/signup',
	multer({
		storage: multer.diskStorage({
			destination: path.join(__dirname, '../../public/images/avatars/profile'),
			filename: (req: Request, file, cb) => {
				if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/jpg') {
					return cb(new Error('Only PNG, JPG and JPEG are allowed'), null);
				}
				cb(null, `${req.body.email}.jpg`);
			},
		}),
		dest: path.join(__dirname, '../../public/images/avatars/profile'),
	}).single('avatarPhoto'),
	passport.authenticate('signup', { failureRedirect: '/auth/failsignup' }),
	(req: Request, res: Response) => {
		res.status(200).redirect(`${process.env.HOME_ROUTE}`);
	}
);

// * Facebook Auth
AUTH.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
AUTH.get(
	'/facebook/callback',
	passport.authenticate('facebook', { failureRedirect: '/auth/faillogin' }),
	(req: Request, res: Response) => {
		res.status(200).redirect(`${process.env.HOME_ROUTE}`);
	}
);

// * Github Auth
AUTH.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
AUTH.get(
	'/github/callback',
	passport.authenticate('github', { failureRedirect: '/auth/faillogin' }),
	(req: Request, res: Response) => {
		res.status(200).redirect(`${process.env.HOME_ROUTE}`);
	}
);

// ! Exports
export default AUTH;
