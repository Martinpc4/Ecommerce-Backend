// ! Imports
// * DTOs
import { SecureUserClass, UnsecureUserClass } from '../DTOs/user.dto';
// * Interfaces
import { unsecureUserPropertiesInterface } from '../interfaces/user.interface';
import { Types } from 'mongoose';
// * Models
import UsersModel from '../user.model';

// ! DAO Definition
class UserDAO {
	async existsById(userId: Types.ObjectId): Promise<boolean> {
		return (await UsersModel.findById(userId)) !== null;
	}

	//  Get Methods
	async getSecureByEmail(email: string): Promise<SecureUserClass | null> {
		const userDocument: unsecureUserPropertiesInterface | null = await UsersModel.findOne({
			'email.email': { $eq: email },
		});
		if (userDocument !== null) {
			return new SecureUserClass(userDocument);
		}
		return null;
	}

	async getSecureById(userId: Types.ObjectId): Promise<SecureUserClass | null> {
		const userDocument: unsecureUserPropertiesInterface | null = await UsersModel.findOne({
			_id: { $eq: userId },
		});
		if (userDocument !== null) {
			return new SecureUserClass(userDocument);
		}
		return null;
	}

	async getUnsecureById(userId: Types.ObjectId): Promise<UnsecureUserClass | null> {
		const userDocument: unsecureUserPropertiesInterface | null = await UsersModel.findById(userId);
		if (userDocument !== null) {
			return new UnsecureUserClass(userDocument);
		}
		return null;
	}

	async getSecureByGithubId(githubId: string): Promise<SecureUserClass | null> {
		const userDocument: unsecureUserPropertiesInterface | null = await UsersModel.findOne({
			'linkedAccounts.github': { $eq: githubId },
		});
		if (userDocument !== null) {
			return new SecureUserClass(userDocument);
		}
		return null;
	}

	async getSecureByFacebookId(facebookId: string): Promise<SecureUserClass | null> {
		const userDocument: unsecureUserPropertiesInterface | null = await UsersModel.findOne({
			'linkedAccounts.facebook': { $eq: facebookId },
		});
		if (userDocument !== null) {
			return new SecureUserClass(userDocument);
		}
		return null;
	}

	// Delete Methods
	async deleteById(userId: Types.ObjectId): Promise<void> {
		if (await this.existsById(userId)) {
			await UsersModel.findByIdAndDelete(userId);
		} else {
			throw new Error(`User [_id: ${userId}] not found`);
		}
	}

	// Update Methods
	async updateSecureById(userId: Types.ObjectId, secureUserInstance: SecureUserClass): Promise<SecureUserClass> {
		const unsecureUserInstance: UnsecureUserClass | null = await this.getUnsecureById(userId);
		if (unsecureUserInstance === null) {
			throw new Error(`User [_id: ${userId}] not found`);
		}
		await UsersModel.findByIdAndUpdate(userId, { ...unsecureUserInstance, ...secureUserInstance });
		const updatedUser: SecureUserClass | null = await this.getSecureById(userId);
		if (updatedUser === null) {
			throw new Error(`User [_id: ${userId}] was deleted by error`);
		}
		return updatedUser;
	}

	async updatePasswordById(userId: Types.ObjectId, hashedPassword: string): Promise<void> {
		const unsecureUserInstance: UnsecureUserClass | null = await this.getUnsecureById(userId);
		if (unsecureUserInstance === null) {
			throw new Error(`User [_id: ${userId}] not found`);
		}
		await UsersModel.findByIdAndUpdate(userId, { ...unsecureUserInstance, password: hashedPassword });
	}

	// Create Methods
	async create(userInstance: UnsecureUserClass): Promise<void> {
		await UsersModel.create(userInstance);
		if (!(await this.existsById(userInstance._id))) {
			throw new Error('User not created');
		}
	}
}

// ! Exports
export default UserDAO;
