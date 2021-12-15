// ! Imports
// * Modules
import { Request, Response, Router } from 'express';
import multer from 'multer';
import path from 'path';
import jwt, { JwtPayload } from 'jsonwebtoken';
// * Controllers
import UsersController from '../controllers/user.controller';
// * Config
import mongoose from '../config/mongodb.config';
import env from '../config/env.config';
// * Auth Strategies
import passport from '../auth/passport.auth';
// * Loggers
import logger from '../logs/index.logs';

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
	(req: Request, res: Response) => {
		if (req.user === undefined) {
			res.status(401).send('Unauthorized');
		}
		const token: string = jwt.sign(
			{
				data: JSON.stringify(req.user),
			},
			env.JWT_SECRET,
			{ expiresIn: env.JWT_EXPIRY }
		);
		res.status(200).json({ token });
	}
);
AUTH.get('/faillogin', (req: Request, res: Response) => {
	res.status(401).send('Invalid Credentials');
});

// Sign Up
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
	}).single('avatarPhoto'), (req, res, next) => {
		console.log(req.body);
		next();
	},
	passport.authenticate('signup', { failureRedirect: '/auth/failsignup' }),
	(req: Request, res: Response) => {
		if (req.user === undefined) {
			res.status(401).send('Unauthorized');
		}
		const token: string = jwt.sign(
			{
				data: JSON.stringify(req.user),
			},
			env.JWT_SECRET,
			{ expiresIn: env.JWT_EXPIRY }
		);
		res.status(200).json({ token });
	}
);
AUTH.get('/failsignup', (req: Request, res: Response) => {
	res.status(400).send('Error creating a user');
});

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

// * Facebook Auth
AUTH.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
AUTH.get(
	'/facebook/callback',
	passport.authenticate('facebook', { failureRedirect: '/auth/faillogin' }),
	(req: Request, res: Response) => {
		res.status(200).redirect(`${env.HOME_ROUTE}`);
	}
);

// * Github Auth
// Login
AUTH.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
AUTH.get(
	'/github/callback',
	passport.authenticate('github', { failureRedirect: '/auth/faillogin' }),
	(req: Request, res: Response) => {
		res.status(200).redirect(`${env.HOME_ROUTE}`);
	}
);

// ! Exports
export default AUTH;
