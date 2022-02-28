// ! Imports
// * DTOs
import { SecureUserClass, UnsecureUserClass } from '../DTOs/user.dto';
// * Interfaces
import { Types } from 'mongoose';

// ! DAO Definition
class UserDAO {
	private users: UnsecureUserClass[];
	constructor() {
		this.users = [];
	}

	// Get Methods
	getSecureByEmail(email: string): SecureUserClass | null {
		for (const userInstance of this.users) {
			if (userInstance.email.email === email) {
				return new SecureUserClass(userInstance);
			}
		}
		return null;
	}

	getSecureById(userId: Types.ObjectId): SecureUserClass | null {
		for (const userInstance of this.users) {
			if (userInstance._id.equals(userId)) {
				return new SecureUserClass(userInstance);
			}
		}
		return null;
	}

	getUnsecureById(userId: Types.ObjectId): UnsecureUserClass | null {
		for (const userInstance of this.users) {
			if (userInstance._id.equals(userId)) {
				return userInstance;
			}
		}
		return null;
	}

	getSecureByGithubId(githubId: string): SecureUserClass | null {
		for (const userInstance of this.users) {
			if (
				userInstance.linkedAccounts.github !== null &&
				new Types.ObjectId(userInstance.linkedAccounts.github).equals(githubId)
			) {
				return new SecureUserClass(userInstance);
			}
		}
		return null;
	}

	getSecureByFacebookId(facebookId: string): SecureUserClass | null {
		for (const userInstance of this.users) {
			if (
				userInstance.linkedAccounts.facebook !== null &&
				new Types.ObjectId(userInstance.linkedAccounts.facebook).equals(facebookId)
			) {
				return new SecureUserClass(userInstance);
			}
		}
		return null;
	}

	existsById(userId: Types.ObjectId): boolean {
		for (const userInstance of this.users) {
			if (userInstance._id.equals(userId)) {
				return true;
			}
		}
		return false;
	}

	// Delete Methods
	deleteById(userId: Types.ObjectId): void {
		if (this.existsById(userId)) {
			let flagVar: boolean = false;
			let usersArray: UnsecureUserClass[] = [];
			this.users.forEach((userInstance) => {
				if (!userInstance._id.equals(userId)) {
					usersArray.push(userInstance);
				} else {
					flagVar = true;
				}
			});
			if (flagVar) {
				this.users = usersArray;
			} else {
				throw new Error('Internal server error');
			}
		} else {
			throw new Error(`User [_id: ${userId}] was not found`);
		}
	}

	// Update Methods
	updateSecureById(userId: Types.ObjectId, secureUserInstance: SecureUserClass): SecureUserClass {
		const unsecureUserInstance: UnsecureUserClass | null = this.getUnsecureById(userId);
		if (unsecureUserInstance === null) {
			throw new Error(`User [_id: ${userId}] was not found`);
		} else {
			let modifiedUser: UnsecureUserClass | null = null;
			let usersArray: UnsecureUserClass[] = [];
			this.users.forEach((userInstance) => {
				if (userInstance._id.equals(userId)) {
					modifiedUser = new UnsecureUserClass({ ...userInstance, ...secureUserInstance });
					usersArray.push(modifiedUser);
				} else {
					usersArray.push(userInstance);
				}
			});

			this.users = usersArray;
			if (modifiedUser !== null) {
				const newlyUpdatedUserInstance: SecureUserClass | null = this.getSecureById(userId);
				if (newlyUpdatedUserInstance === null) {
					throw new Error(`User [_id: ${userId}] was deleted while trying to update it`);
				} else {
					return newlyUpdatedUserInstance;
				}
			} else {
				throw new Error('Internal server error');
			}
		}
	}

	updatePasswordById(userId: Types.ObjectId, hashedPassword: string): void {
		const unsecureUserInstance: UnsecureUserClass | null = this.getUnsecureById(userId);

		if (unsecureUserInstance === null) {
			throw new Error(`User [_id: ${userId}] was not found`);
		} else {
			let flagVar: boolean = false;
			this.users.forEach((userInstance) => {
				if (userInstance._id.equals(userId)) {
					userInstance.password = hashedPassword;
					flagVar = true;
				}
			});
			if (flagVar) {
				const newlyUpdatedUserInstance: SecureUserClass | null = this.getSecureById(userId);
				if (newlyUpdatedUserInstance === null) {
					throw new Error(`User [_id: ${userId}] was deleted while trying to update it`);
				}
				return;
			} else {
				throw new Error('Internal server error');
			}
		}
	}

	// Create Methods
	create(userInstance: UnsecureUserClass): void {
		this.users.push(userInstance);
		if (!this.existsById(userInstance._id)) {
			throw new Error('User not created');
		}
	}
}

// ! Exports
export default UserDAO;
