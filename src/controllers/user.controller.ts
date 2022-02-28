// ! Imports
// * Modules
import ejs from 'ejs';
// * DTOs
import { SecureUserClass } from '../models/DTOs/user.dto';
// * Interfaces
import { Request, Response } from 'express';
import { Types } from 'mongoose';
// * Logs
import logger from '../server/logs/index.logs';
// * Services
import UserService from '../services/user.service';
// * Utils
import env from '../utils/env.utils';

// ! Controller Definition
class UserControllerClass {
	constructor() {}
	async getProfile(req: Request, res: Response): Promise<void> {
		try {
			const userInstance: any | undefined = req.user;
			if (userInstance === undefined) {
				throw new Error('Internal Server Error');
			}
			res.status(200).json(userInstance);
			logger.http({
				message: 'User profile requested and sent',
				router: 'USERS',
				method: 'GET',
				route: '/',
			});
		} catch (err) {
			logger.error({
				message: 'Get user profile failed',
				router: 'USERS',
				method: 'GET',
				route: '/',
				stack: err,
			});
			res.status(500).send(err);
		}
	}
	async updateProfile(req: Request, res: Response): Promise<void> {
		try {
			const userInstance: any | undefined = req.user;
			if (userInstance === undefined) {
				throw new Error('Internal Server Error: Unauthorised user access');
			}

			const newSecureUserInstance: SecureUserClass = new SecureUserClass(req.body);

			await UserService.updateSecureUser(userInstance._id, newSecureUserInstance);

			res.status(200).send('User profile updated correctly');
			logger.http({
				message: 'User profile updated',
				router: 'USERS',
				method: 'PUT',
				route: '/',
			});
		} catch (err) {
			logger.error({
				message: 'Update user profile failed',
				router: 'USERS',
				method: 'PUT',
				route: '/update/profile',
				stack: err,
			});
			res.status(500).send(err);
		}
	}
	async updatePassword(req: Request, res: Response): Promise<void> {
		try {
			const userInstance: any | undefined = req.user;
			if (userInstance === undefined) {
				throw new Error('Internal Server Error: Unauthorised user access');
			}

			const passwords: {
				oldPassword: string;
				newPassword: string;
			} = req.body;

			if (passwords.oldPassword === undefined || passwords.newPassword === undefined) {
				logger.error({
					message: 'Update user profile password failed',
					router: 'USERS',
					method: 'PUT',
					route: '/update/profile',
					stack: 'Missing password fields',
				});
				res.status(404).send('Missing password fields');
			} else {
				if (await UserService.verifyPassword(userInstance._id, passwords.oldPassword)) {
					await UserService.updatePassword(userInstance._id, passwords.newPassword);

					res.status(200).send('User password updated correctly');
					logger.http({
						message: 'User profile updated',
						router: 'USERS',
						method: 'PUT',
						route: '/update/password',
					});
				} else {
					logger.error({
						message: 'Update user password failed',
						router: 'USERS',
						method: 'PUT',
						route: '/update/profile',
						stack: 'Incorrect password',
					});
					res.status(401).send("Incorrect user's old password");
				}
			}
		} catch (err) {
			logger.error({
				message: 'Update user password failed',
				router: 'USERS',
				method: 'PUT',
				route: '/',
				stack: err,
			});
			res.status(500).send(err);
		}
	}
	async verifyEmail(req: Request, res: Response): Promise<void> {
		try {
			const userInstance: any | undefined = req.user;
			if (userInstance === undefined) {
				throw new Error('Internal Server Error: Unauthorised user access');
			}
			if (req.body.verificationCode === undefined) {
				res.status(400).send('Invalid verification code');
				logger.notice({
					message: 'Invalid verification code',
					router: 'USERS',
					method: 'POST',
					route: '/verify',
				});
			} else {
				const userVerificationCode: Types.ObjectId = new Types.ObjectId(req.body.verificationCode);

				const flagVar: boolean = await UserService.verifyUserEmail(userInstance._id, userVerificationCode);
				if (flagVar) {
					res.status(200).send("User's email verified");
					logger.notice({
						message: "User's email verified",
						router: 'AUTH',
						method: 'POST',
						route: '/:userId/email_v/:verificationCode',
					});
				} else {
					res.status(500).send('Verification Failed');
					logger.notice({
						message: 'Verification Failed',
						router: 'AUTH',
						method: 'POST',
						route: '/:userId/verify_email/:verificationCode',
					});
				}
			}
		} catch (err) {
			logger.error({
				message: 'Error in verifying email',
				router: 'AUTH',
				method: 'POST',
				route: '/:userId/verify_email/:verificationCode',
				stack: err,
			});
			res.status(500).send(err);
		}
	}
	async sendVerificationCode(req: Request, res: Response): Promise<void> {
		try {
			const userInstance: any | undefined = req.user;
			if (userInstance === undefined) {
				throw new Error('Internal Server Error: Unauthorised user access');
			}
			await UserService.sendMailById(
				userInstance._id,
				await ejs.renderFile(__dirname.replace('dist', 'src/views/pages/verificationCode.ejs'), {
					serverAddress: env.BACKEND_URL,
					name: userInstance.name,
					lastName: userInstance.lastName,
					code: userInstance.email.verification_code,
				}),
				'Verification Code'
			);
			res.status(200).send('Verification code sent');
			logger.notice({
				message: 'Verification code sent',
				router: 'USERS',
				method: 'POST',
				route: '/verification_code',
			});
		} catch (err) {
			logger.error({
				message: 'Error in sending verification code',
				router: 'USERS',
				method: 'POST',
				route: '/verification_code',
				stack: err,
			});
			res.status(500).send(err);
		}
	}
}

// ! Controller Instance
const UserController: UserControllerClass = new UserControllerClass();

// ! Exports
export default UserController;
