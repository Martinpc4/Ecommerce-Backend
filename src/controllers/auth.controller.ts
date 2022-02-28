// ! Imports
// * DTOs
import { SecureUserClass } from '../models/DTOs/user.dto';
// * Interfaces
import { Request, Response } from 'express';
// * Utils
import env from '../utils/env.utils';
import { issueJWT } from '../utils/jwt.utils';

// ! Controller Definition
class AuthControllerClass {
	logIn(req: Request, res: Response): void {
		const userSessionData: any = req.user;
		if (userSessionData === undefined) {
			res.status(500).send('Could not authenticate the user');
		} else {
			const token: string = issueJWT(new SecureUserClass(userSessionData));
			res.status(200).json({ token, expiresIn: env.JWT_EXPIRY });
		}
	}
	failLogin(req: Request, res: Response): void {
		res.status(401).redirect(`${env.FRONTEND_URL}/login`);
	}
	signUp(req: Request, res: Response): void {
		const userSessionData: any = req.user;
		if (userSessionData === undefined) {
			res.status(401).send('Unauthorized');
		} else {
			const token: string = issueJWT(new SecureUserClass(userSessionData));
			res.status(200).json({ token, expiresIn: env.JWT_EXPIRY });
		}
	}
	failSignUp(req: Request, res: Response): void {
		res.status(400).redirect(`${env.FRONTEND_URL}/signup`);
	}
	facebookCallback(req: Request, res: Response): void {
		const userSessionData: any = req.user;
		if (userSessionData === undefined) {
			res.status(401).send('Unauthorized');
		} else {
			const token: string = issueJWT(new SecureUserClass(userSessionData));
			res.status(200).redirect(`${env.FRONTEND_URL}/loginSocial/${token}`);
		}
	}
	githubCallback(req: Request, res: Response): void {
		const userSessionData: any = req.user;
		if (userSessionData === undefined) {
			res.status(401).send('Unauthorized');
		} else {
			const token: string = issueJWT(new SecureUserClass(userSessionData));
			res.status(200).redirect(`${env.FRONTEND_URL}/loginSocial/${token}`);
		}
	}
}

// ! Controller Instance
const AuthController: AuthControllerClass = new AuthControllerClass();

// ! Exports
export default AuthController;
