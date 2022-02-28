// ! Imports
// * Modules
import ejs from 'ejs';
// * DTOs
import { SecureUserClass, UnsecureUserClass } from '../models/DTOs/user.dto';
// * Factories
import UserDAO from '../models/factories/user.factory';
// * Interfaces
import { unsecureUserPropertiesInterface } from '../models/interfaces/user.interface';
import { Types } from 'mongoose';
// * Services
import { etherealTransporter, mailOptions } from './nodemailer.service';
// * Utils
import { compareHashedPassword, hashPassword } from '../utils/crypto.utils';

// ! Service Definition
class UserServiceClass {
	async existsById(userId: Types.ObjectId): Promise<boolean> {
		try {
			return (await UserDAO.getSecureById(userId)) !== null;
		} catch (err) {
			throw new Error(`\n"existsById" Error: ${err}`);
		}
	}

	async existsByEmail(email: string): Promise<boolean> {
		try {
			return (await UserDAO.getSecureByEmail(email)) !== null;
		} catch (err) {
			throw new Error(`\n"existsByEmail" Error: ${err}`);
		}
	}

	async sendMailById(userId: Types.ObjectId, htmlContent: string, subject: string): Promise<void> {
		try {
			if (await this.existsById(userId)) {
				const secureUserInstance: SecureUserClass | null = await UserDAO.getSecureById(userId);
				if (secureUserInstance === null) {
					throw new Error('Internal server error: user not found');
				}
				await etherealTransporter.sendMail({
					...mailOptions,
					to: secureUserInstance.email.email,
					subject: subject,
					html: htmlContent,
				});
			} else {
				throw new Error('User not found');
			}
		} catch (err) {
			throw new Error(`\n"sendMailById" Error: ${err}`);
		}
	}

	async createUser(userProperties: unsecureUserPropertiesInterface): Promise<boolean> {
		try {
			await UserDAO.create(new UnsecureUserClass(userProperties));

			if (await this.existsByEmail(userProperties.email.email)) {
				const userInstance: SecureUserClass = await this.getSecureByUsername(userProperties.email.email);

				await this.sendMailById(
					userInstance._id,
					await ejs.renderFile(__dirname.replace('dist', 'src/views/pages/newJoiner.ejs'), {
						name: userInstance.name,
						lastName: userInstance.lastName,
					}),
					'Welcome!'
				);
				return true;
			}
			return false;
		} catch (err) {
			throw new Error(`\n"createUser" Error: ${err}`);
		}
	}

	async removeUser(userId: Types.ObjectId): Promise<void> {
		try {
			if (await this.existsById(userId)) {
				await UserDAO.deleteById(userId);
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

	async getSecureByUsername(username: string): Promise<SecureUserClass> {
		try {
			if (await this.existsByEmail(username)) {
				const userInstance: SecureUserClass | null = await UserDAO.getSecureByEmail(username);
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

	async updatePassword(userId: Types.ObjectId, password: string): Promise<void> {
		try {
			if (await this.existsById(userId)) {
				await UserDAO.updatePasswordById(userId, await hashPassword(password));
			} else {
				throw new Error('Update user request failed: user not found');
			}
		} catch (err) {
			throw new Error(`\n"updateUser" Error: ${err}`);
		}
	}

	async updateSecureUser(userId: Types.ObjectId, newUserInstance: SecureUserClass): Promise<void> {
		if (await this.existsById(userId)) {
			const secureUserInstance: SecureUserClass | null = await UserDAO.getSecureById(userId);

			if (secureUserInstance === null) {
				throw new Error('Internal server error: user not found');
			}

			if (newUserInstance.role !== secureUserInstance.role) {
				throw new Error(`User's role cannot be changed`);
			}

			if (newUserInstance.email.email !== secureUserInstance.email.email) {
				await UserDAO.updateSecureById(userId, {
					...secureUserInstance,
					...newUserInstance,
					email: {
						...secureUserInstance.email,
						...newUserInstance.email,
						verified: false,
						verification_code: new Types.ObjectId(),
					},
				});
			} else {
				await UserDAO.updateSecureById(userId, { ...secureUserInstance, ...newUserInstance });
			}
		} else {
			throw new Error('Update user request failed: user not found');
		}
	}

	// User's Cart Methods
	async existsCartLinkedById(userId: Types.ObjectId): Promise<Types.ObjectId | null> {
		try {
			const userInstance: SecureUserClass | null = await UserDAO.getSecureById(userId);
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

	async linkCartToUserById(userId: Types.ObjectId, cartId: Types.ObjectId | null): Promise<boolean> {
		try {
			if (await this.existsById(userId)) {
				const userInstance: SecureUserClass | null = await UserDAO.getSecureById(userId);

				if (userInstance === null) {
					throw new Error('Internal server error: user not found');
				}

				await UserDAO.updateSecureById(userId, { ...userInstance, cartId: cartId });

				const cartIdFound: Types.ObjectId | null = await this.existsCartLinkedById(userId);
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

	// Verify Encrypted Password
	async verifyPassword(userId: Types.ObjectId, password: string): Promise<boolean> {
		try {
			if (await this.existsById(userId)) {
				const userInstance: UnsecureUserClass | null = await UserDAO.getUnsecureById(userId);
				if (userInstance === null) {
					throw new Error('Internal server error: user not found');
				}
				return await compareHashedPassword(password, userInstance.password);
			} else {
				throw new Error('Verify password request failed: user not found');
			}
		} catch (err) {
			throw new Error(`\n"verifyPassword" Error: ${err}`);
		}
	}

	// Email verification Methods
	async isEmailVerified(userId: Types.ObjectId): Promise<boolean> {
		if (!(await this.existsById(userId))) {
			throw new Error('User does not exists');
		}
		const productData: SecureUserClass | null = await UserDAO.getSecureById(userId);
		if (productData === null) {
			throw new Error('Internal server error: user not found');
		}
		return productData.email.verified;
	}

	async verifyUserEmail(userId: Types.ObjectId, verificationCode: Types.ObjectId): Promise<boolean> {
		try {
			if (await this.existsById(userId)) {
				const secureUserInstance: SecureUserClass | null = await UserDAO.getSecureById(userId);
				if (secureUserInstance === null) {
					throw new Error('Internal server error: user not found');
				}
				if (
					secureUserInstance.email.verification_code !== null &&
					!secureUserInstance.email.verified &&
					secureUserInstance.email.verification_code.equals(verificationCode)
				) {
					await UserDAO.updateSecureById(userId, {
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

	// User's GitHub Methods
	async existsByGithubId(githubId: string): Promise<boolean> {
		try {
			return (await UserDAO.getSecureByGithubId(githubId)) !== null;
		} catch (err) {
			throw new Error(`\n"existsByGithubId" Error: ${err}`);
		}
	}

	async getSecureByGithubId(githubId: string): Promise<SecureUserClass> {
		try {
			if (!(await this.existsByGithubId(githubId))) {
				throw new Error('Github account is not linked to any user');
			}
			const userInstance: SecureUserClass | null = await UserDAO.getSecureByGithubId(githubId);
			if (userInstance === null) {
				throw new Error('Internal server error: user not found');
			}
			return userInstance;
		} catch (err) {
			throw new Error(`\n"getUserByGithubId" Error: ${err}`);
		}
	}

	async linkGithubAccount(userId: Types.ObjectId, githubId: string): Promise<void> {
		try {
			if (!(await this.existsById(userId))) {
				throw new Error('Link github account request failed: user not found');
			}
			if (await this.existsByGithubId(githubId)) {
				throw new Error('Link github account request failed: github account already linked to another user');
			}
			const secureUserInstance: SecureUserClass | null = await UserDAO.getSecureById(userId);
			if (secureUserInstance === null) {
				throw new Error('Internal server error: user not found');
			}
			await UserDAO.updateSecureById(userId, {
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
			return (await UserDAO.getSecureByFacebookId(facebookId)) !== null;
		} catch (err) {
			throw new Error(`\n"existsByFacebookId" Error: ${err}`);
		}
	}

	async getUserByFacebookId(facebookId: string): Promise<SecureUserClass> {
		try {
			if (!(await this.existsByFacebookId(facebookId))) {
				throw new Error('Facebook account is not linked to any user');
			}
			const userInstance: SecureUserClass | null = await UserDAO.getSecureByFacebookId(facebookId);
			if (userInstance === null) {
				throw new Error('Internal server error: user not found');
			}
			return userInstance;
		} catch (err) {
			throw new Error(`\n"getUserByFacebookId" Error: ${err}`);
		}
	}

	async linkFacebookAccount(userId: Types.ObjectId, facebookId: string): Promise<void> {
		try {
			if (!(await this.existsById(userId))) {
				throw new Error('Link facebook account request failed: user not found');
			}
			if (await this.existsByFacebookId(facebookId)) {
				throw new Error(
					'Link facebook account request failed: facebook account already linked to another user'
				);
			}
			const secureUserInstance: SecureUserClass | null = await UserDAO.getSecureById(userId);
			if (secureUserInstance === null) {
				throw new Error('Internal server error: user not found');
			}
			await UserDAO.updateSecureById(userId, {
				...secureUserInstance,
				linkedAccounts: { ...secureUserInstance.linkedAccounts, facebook: facebookId },
			});
		} catch (err) {
			throw new Error(`\n"linkFacebookAccount" Error: ${err}`);
		}
	}
}

// ! Service Instance
const UserService: UserServiceClass = new UserServiceClass();

// ! Exports
export default UserService;
