// ! Imports
// * Modules
import ejs from 'ejs';
// * Classes
import { UserClass } from '../classes/users.classes';
// * Interfaces
import { userPropertiesInterface } from '../interfaces/users.interfaces';
// * Models
import UsersModel from '../models/users.model';
// * Utils
import mongoose from '../utils/mongodb';
import { etherealTransporter, mailOptions } from '../utils/ethereal.mails';

// ! Controller
class UserControllerClass {
	constructor() {}
	async isUserByUsername(username: string): Promise<boolean> {
		try {
			const userData = await UsersModel.findOne({ 'email.email': { $eq: username } });
			if (!userData) {
				return false;
			} else {
				return true;
			}
		} catch (err) {
			throw new Error(`\n"isUserByUsername" Error: ${err}`);
		}
	}
	async isUserById(userId: mongoose.Types.ObjectId): Promise<boolean> {
		try {
			const userData: userPropertiesInterface | null = await UsersModel.findById(userId);
			if (userData !== null) {
				return true;
			} else {
				return false;
			}
		} catch (err) {
			throw new Error(`\n"isUserById" Error: ${err}`);
		}
	}
	async createUser(userProperties: userPropertiesInterface): Promise<boolean> {
		try {
			const userInstance: UserClass = new UserClass(userProperties);

			const newUser: mongoose.Document = new UsersModel(userInstance);

			await newUser.save();

			if (await this.isUserById(userProperties._id)) {
				await etherealTransporter.sendMail({
					...mailOptions,
					to: (await UsersController.getUserById(userProperties._id)).email.email,
					subject: 'Import BA - Email Verification',
					html: String(
						await ejs.renderFile(
							__dirname.replace('dist/controllers', 'src/views/pages/email_verification.ejs'),
							{
								serverAddress: process.env.SERVER_ADDRESS,
								emailVerificationCode: String(userProperties.email.verification_code),
							}
						)
					),
				});
				return true;
			} else {
				return false;
			}
		} catch (err) {
			throw new Error(`\n"createUser" Error: ${err}`);
		}
	}
	async removeUser(userId: mongoose.Types.ObjectId) {
		try {
			if (await this.isUserById(userId)) {
				const newUser = await UsersModel.deleteOne(new mongoose.Types.ObjectId(userId));
				if (!(await this.isUserById(userId))) {
					throw new Error('Remove user request failed: user not successfully removed');
				}
			} else {
				throw new Error('"removeUser" Error : userId not found');
			}
		} catch (err) {
			throw new Error(`\n"removeUser" Error: $\n\n{err}`);
		}
	}
	async getUserById(userId: mongoose.Types.ObjectId): Promise<UserClass> {
		try {
			if (await this.isUserById(userId)) {
				const userProperties: userPropertiesInterface | null = await UsersModel.findById(userId);
				if (userProperties !== null) {
					return new UserClass(userProperties);
				} else {
					throw new Error('Get user request failed: user not successfully retrieved');
				}
			} else {
				throw new Error('Get user request failed: user not found');
			}
		} catch (err) {
			throw new Error(`\n"getUserById" Error: ${err}`);
		}
	}
	async getUserByUsername(username: string): Promise<UserClass> {
		try {
			if (await this.isUserByUsername(username)) {
				const userProperties: userPropertiesInterface | null = await UsersModel.findOne({
					'email.email': { $eq: username },
				});
				if (userProperties !== null) {
					const userInstance = new UserClass(userProperties);
					return userInstance;
				} else {
					throw new Error('Get user request failed: user not successfully retrieved');
				}
			} else {
				throw new Error('Get user request failed: user not found');
			}
		} catch (err) {
			throw new Error(`\n"getUserByUsername" Error: ${err}`);
		}
	}
	// User's Cart Methods
	async existsCartLinkedById(userId: mongoose.Types.ObjectId): Promise<mongoose.Types.ObjectId | null> {
		try {
			const userData: userPropertiesInterface | null = await UsersModel.findById(userId);
			if (userData !== null && userData.cartId !== null) {
				return userData.cartId;
			}
			return null;
		} catch (err) {
			throw new Error(`\n"existsCartLinkedById" Error: ${err}`);
		}
	}
	async linkCartToUserById(
		userId: mongoose.Types.ObjectId,
		cartId: mongoose.Types.ObjectId | null
	): Promise<boolean> {
		try {
			if (await this.isUserById(userId)) {
				await UsersModel.findByIdAndUpdate(userId, { cartId: cartId });

				const cartIdFound: mongoose.Types.ObjectId | null = await this.existsCartLinkedById(userId);
				if (cartIdFound === null && cartId === null) {
					return true;
				} else if (cartIdFound !== null && cartId !== null && cartIdFound._id.equals(cartId)) {
					return true;
				} else {
					throw new Error('Link cart to user request failed: cart not successfully linked');
				}
			} else {
				throw new Error('Link cart to user request failed: user not found');
			}
		} catch (err) {
			throw new Error(`\n"linkCartToUserById" Error: ${err}`);
		}
	}
	// Email verification Methods
	async isEmailVerified(userId: mongoose.Types.ObjectId): Promise<boolean> {
		if (!(await this.isUserById(userId))) {
			throw new Error('User does not exists');
		}
		const productData: UserClass = await this.getUserById(userId);
		if (productData === null) {
			throw new Error('Internal Server Error');
		}
		if (productData.email.verified) {
			return true;
		} else {
			return false;
		}
	}
	async verifyUserEmail(
		userId: mongoose.Types.ObjectId,
		verificationCode: mongoose.Types.ObjectId
	): Promise<boolean> {
		try {
			if (await this.isUserById(userId)) {
				const userProperties: UserClass | null = await this.getUserById(userId);
				if (userProperties !== null) {
					if (
						userProperties.email.verification_code !== null &&
						!userProperties.email.verified &&
						userProperties.email.verification_code.equals(verificationCode)
					) {
						await UsersModel.findByIdAndUpdate(userId, {
							'email.verified': true,
							'email.verification_code': null,
						});
						return true;
					} else {
						return false;
					}
				} else {
					throw new Error('Internal Server Error');
				}
			} else {
				return false;
			}
		} catch (err) {
			throw new Error(`\n"verifyUserEmail" Error: ${err}`);
		}
	}
	// User's Github Methods
	async verifyGithubId(githubId: string): Promise<boolean> {
		try {
			const userData: mongoose.Document | null = await UsersModel.findOne({
				'linkedAccounts.github': { $eq: githubId },
			});
			if (userData !== null) {
				return true;
			}
			return false;
		} catch (err) {
			throw new Error(`\n"verifyGithubId" Error: ${err}`);
		}
	}
	async getUserByGithubId(githubId: string): Promise<UserClass> {
		try {
			if (!(await this.verifyGithubId(githubId))) {
				throw new Error('Github account is not linked to any user');
			}
			const userProperties: userPropertiesInterface | null = await UsersModel.findOne({
				'linkedAccounts.github': { $eq: githubId },
			});
			if (userProperties === null) {
				throw new Error('Internal Server Error');
			}
			const userInstance = new UserClass(userProperties);
			return userInstance;
		} catch (err) {
			throw new Error(`\n"getUserByGithubId" Error: ${err}`);
		}
	}
	async linkGithubAccount(userId: mongoose.Types.ObjectId, githubId: string): Promise<void> {
		try {
			if (!(await this.isUserById(userId))) {
				throw new Error('Link github account request failed: user not found');
			}
			if (await this.verifyGithubId(githubId)) {
				throw new Error('Link github account request failed: github account already linked to another user');
			}
			await UsersModel.findByIdAndUpdate(userId, {
				'linkedAccounts.github': githubId,
			});
		} catch (err) {
			throw new Error(`\n"linkGithubAccount" Error: ${err}`);
		}
	}
	// User's Facebook Methods
	async verifyFacebookId(facebookId: string): Promise<boolean> {
		try {
			const userData: mongoose.Document | null = await UsersModel.findOne({
				'linkedAccounts.facebook': { $eq: facebookId },
			});
			if (userData !== null) {
				return true;
			}
			return false;
		} catch (err) {
			throw new Error(`\n"verifyFacebookId" Error: ${err}`);
		}
	}
	async getUserByFacebookId(facebookId: string): Promise<UserClass> {
		try {
			if (!(await this.verifyFacebookId(facebookId))) {
				throw new Error('Facebook account is not linked to any user');
			}
			const userProperties: userPropertiesInterface | null = await UsersModel.findOne({
				'linkedAccounts.facebook': { $eq: facebookId },
			});
			if (userProperties === null) {
				throw new Error('Internal Server Error');
			}
			const userInstance = new UserClass(userProperties);
			return userInstance;
		} catch (err) {
			throw new Error(`\n"getUserByFacebookId" Error: ${err}`);
		}
	}
	async linkFacebookAccount(userId: mongoose.Types.ObjectId, facebookId: string): Promise<void> {
		try {
			if (!(await this.isUserById(userId))) {
				throw new Error('Link facebook account request failed: user not found');
			}
			if (await this.verifyFacebookId(facebookId)) {
				throw new Error(
					'Link facebook account request failed: facebook account already linked to another user'
				);
			}
			await UsersModel.findByIdAndUpdate(userId, {
				'linkedAccounts.facebook': facebookId,
			});
		} catch (err) {
			throw new Error(`\n"linkFacebookAccount" Error: ${err}`);
		}
	}
}

// ! Controller Instance
const UsersController: UserControllerClass = new UserControllerClass();

// ! Exports
export default UsersController;
