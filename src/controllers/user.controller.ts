// ! Imports
// * Modules
import ejs from 'ejs';
// * Classes
import { UnsecureUserClass, SecureUserClass } from '../classes/users.classes';
// * Data Access Objects
import UsersDAO from '../daos/users.daos';
// * Types
import { userPropertiesInterface } from '../interfaces/users.interfaces';
// * Services
import mongoose from '../services/mongodb.services';
import { etherealTransporter, mailOptions } from '../services/ethereal.services';
// * Utils
import env from '../utils/env.utils';

// ! Controller Definition
class UserControllerClass {
	constructor() {}
	async existsById(userId: mongoose.Types.ObjectId): Promise<boolean> {
		try {
			if ((await UsersDAO.getSecureById(userId)) !== null) {
				return true;
			}
			return false;
		} catch (err) {
			throw new Error(`\n"existsById" Error: ${err}`);
		}
	}
	async existsByEmail(email: string): Promise<boolean> {
		try {
			if ((await UsersDAO.getSecureByEmail(email)) !== null) {
				return true;
			}
			return false;
		} catch (err) {
			throw new Error(`\n"existsByEmail" Error: ${err}`);
		}
	}
	async sendMailById(userId: mongoose.Types.ObjectId, content: string, subject: string): Promise<void> {
		try {
			if (await this.existsById(userId)) {
				const secureUserInstance: SecureUserClass | null = await UsersDAO.getSecureById(userId);
				if (secureUserInstance === null) {
					throw new Error('Internal server error: user not found');
				}
				await etherealTransporter.sendMail({
					...mailOptions,
					to: secureUserInstance.email.email,
					subject,
					html: content,
				});
			} else {
				throw new Error('User not found');
			}
		} catch (err) {
			throw new Error(`\n"sendMailById" Error: ${err}`);
		}
	}
	async createUser(userProperties: userPropertiesInterface): Promise<boolean> {
		try {
			await UsersDAO.create(new UnsecureUserClass(userProperties));

			if (await this.existsById(userProperties._id)) {
				await UsersController.sendMailById(
					userProperties._id,
					String(
						await ejs.renderFile(
							__dirname.replace('dist/controllers', 'src/views/pages/email_verification.ejs'),
							{
								serverAddress: env.SERVER_ADDRESS,
								emailVerificationCode: String(userProperties.email.verification_code),
							}
						)
					),
					'Import BA - Email Verification'
				);
				return true;
			} else {
				throw new Error('User creation failed: user already exists');
			}
		} catch (err) {
			throw new Error(`\n"createUser" Error: ${err}`);
		}
	}
	async removeUser(userId: mongoose.Types.ObjectId): Promise<void> {
		try {
			if (await this.existsById(userId)) {
				await UsersDAO.deleteById(userId);
				if (!(await this.existsById(userId))) {
					throw new Error('Remove user request failed: user not successfully removed');
				}
			} else {
				throw new Error('"removeUser" Error : userId not found');
			}
		} catch (err) {
			throw new Error(`\n"removeUser" Error: $\n\n{err}`);
		}
	}
	async getUserByUsername(username: string): Promise<SecureUserClass> {
		try {
			if (await this.existsByEmail(username)) {
				const userInstance: SecureUserClass | null = await UsersDAO.getSecureByEmail(username);
				if (userInstance === null) {
					throw new Error('User not found');
				}
				return userInstance;
			} else {
				throw new Error('Get user request failed: user not found');
			}
		} catch (err) {
			throw new Error(`\n"getUserByUsername" Error: ${err}`);
		}
	}
	async updateUser(userId: mongoose.Types.ObjectId, newUserInstance: UnsecureUserClass): Promise<void> {
		try {
			if (await this.existsById(userId)) {
				const unsecureUserInstance: UnsecureUserClass | null = await UsersDAO.getUnsecureById(userId);

				if (unsecureUserInstance === null) {
					throw new Error('Internal server error: user not found');
				}

				if (newUserInstance.email.email !== unsecureUserInstance.email.email) {
					await UsersDAO.updateSecureById(userId, {
						...unsecureUserInstance,
						...newUserInstance,
						email: {
							...unsecureUserInstance.email,
							...newUserInstance.email,
							verified: false,
							verification_code: new mongoose.Types.ObjectId(),
						},
					});
				} else {
					await UsersDAO.updateSecureById(userId, { ...unsecureUserInstance, ...newUserInstance });
				}
			} else {
				throw new Error('Update user request failed: user not found');
			}
		} catch (err) {
			throw new Error(`\n"updateUser" Error: ${err}`);
		}
	}
	// User's Cart Methods
	async existsCartLinkedById(userId: mongoose.Types.ObjectId): Promise<mongoose.Types.ObjectId | null> {
		try {
			const userInstance: SecureUserClass | null = await UsersDAO.getSecureById(userId);
			if (userInstance === null) {
				throw new Error('User not found');
			} else {
				if (userInstance.cartId !== null) {
					return userInstance.cartId;
				}
				return null;
			}
		} catch (err) {
			throw new Error(`\n"existsCartLinkedById" Error: ${err}`);
		}
	}
	async linkCartToUserById(
		userId: mongoose.Types.ObjectId,
		cartId: mongoose.Types.ObjectId | null
	): Promise<boolean> {
		try {
			if (await this.existsById(userId)) {
				const userInstance: SecureUserClass | null = await UsersDAO.getSecureById(userId);

				if (userInstance === null) {
					throw new Error('Internal server error: user not found');
				}

				await UsersDAO.updateSecureById(userId, { ...userInstance, cartId: cartId });

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
		if (!(await this.existsById(userId))) {
			throw new Error('User does not exists');
		}
		const productData: SecureUserClass | null = await UsersDAO.getSecureById(userId);
		if (productData === null) {
			throw new Error('Internal server error: user not found');
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
			if (await this.existsById(userId)) {
				const secureUserInstance: SecureUserClass | null = await UsersDAO.getSecureById(userId);
				if (secureUserInstance === null) {
					throw new Error('Internal server error: user not found');
				}
				if (
					secureUserInstance.email.verification_code !== null &&
					!secureUserInstance.email.verified &&
					secureUserInstance.email.verification_code.equals(verificationCode)
				) {
					await UsersDAO.updateSecureById(userId, {
						...secureUserInstance,
						email: { ...secureUserInstance.email, verified: true, verification_code: null },
					});
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		} catch (err) {
			throw new Error(`\n"verifyUserEmail" Error: ${err}`);
		}
	}
	// User's Github Methods
	async existsByGithubId(githubId: string): Promise<boolean> {
		try {
			if ((await UsersDAO.getSecureByGithubId(githubId)) !== null) {
				return true;
			}
			return false;
		} catch (err) {
			throw new Error(`\n"existsByGithubId" Error: ${err}`);
		}
	}
	async getSecureByGithubId(githubId: string): Promise<SecureUserClass> {
		try {
			if (!(await this.existsByGithubId(githubId))) {
				throw new Error('Github account is not linked to any user');
			}
			const userInstance: SecureUserClass | null = await UsersDAO.getSecureByGithubId(githubId);
			if (userInstance === null) {
				throw new Error('Internal server error: user not found');
			}
			return userInstance;
		} catch (err) {
			throw new Error(`\n"getUserByGithubId" Error: ${err}`);
		}
	}
	async linkGithubAccount(userId: mongoose.Types.ObjectId, githubId: string): Promise<void> {
		try {
			if (!(await this.existsById(userId))) {
				throw new Error('Link github account request failed: user not found');
			}
			if (await this.existsByGithubId(githubId)) {
				throw new Error('Link github account request failed: github account already linked to another user');
			}
			const secureUserInstance: SecureUserClass | null = await UsersDAO.getSecureById(userId);
			if (secureUserInstance === null) {
				throw new Error('Internal server error: user not found');
			}
			await UsersDAO.updateSecureById(userId, {
				...secureUserInstance,
				linkedAccounts: { ...secureUserInstance.linkedAccounts, github: githubId },
			});
		} catch (err) {
			throw new Error(`\n"linkGithubAccount" Error: ${err}`);
		}
	}
	// User's Facebook Methods
	async existsByFacebookId(facebookId: string): Promise<boolean> {
		try {
			if ((await UsersDAO.getSecureByFacebookId(facebookId)) !== null) {
				return true;
			}
			return false;
		} catch (err) {
			throw new Error(`\n"existsByFacebookId" Error: ${err}`);
		}
	}
	async getUserByFacebookId(facebookId: string): Promise<SecureUserClass> {
		try {
			if (!(await this.existsByFacebookId(facebookId))) {
				throw new Error('Facebook account is not linked to any user');
			}
			const userInstance: SecureUserClass | null = await UsersDAO.getSecureByFacebookId(facebookId);
			if (userInstance === null) {
				throw new Error('Internal server error: user not found');
			}
			return userInstance;
		} catch (err) {
			throw new Error(`\n"getUserByFacebookId" Error: ${err}`);
		}
	}
	async linkFacebookAccount(userId: mongoose.Types.ObjectId, facebookId: string): Promise<void> {
		try {
			if (!(await this.existsById(userId))) {
				throw new Error('Link facebook account request failed: user not found');
			}
			if (await this.existsByFacebookId(facebookId)) {
				throw new Error(
					'Link facebook account request failed: facebook account already linked to another user'
				);
			}
			const secureUserInstance: SecureUserClass | null = await UsersDAO.getSecureById(userId);
			if (secureUserInstance === null) {
				throw new Error('Internal server error: user not found');
			}
			await UsersDAO.updateSecureById(userId, {
				...secureUserInstance,
				linkedAccounts: { ...secureUserInstance.linkedAccounts, facebook: facebookId },
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
