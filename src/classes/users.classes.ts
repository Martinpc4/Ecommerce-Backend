// ! Imports
// * Interfaces
import {
	emailPropertiesInterface,
	addressPropertiesInterface,
	userPropertiesInterface,
	linkedAccountsPropertiesInterface,
	phonePropertiesInterface,
} from '../interfaces/users.interfaces';
// * Config
import mongoose from '../config/mongodb.config';

// ! Class
class UserClass {
	name: string;
	_id: mongoose.Types.ObjectId;
	lastName: string;
	timeStamp: Date;
	email: emailPropertiesInterface;
	cartId: mongoose.Types.ObjectId | null;
	password: string;
	address: addressPropertiesInterface;
	phoneNumber: phonePropertiesInterface;
	linkedAccounts: linkedAccountsPropertiesInterface;
	constructor(userProperties: userPropertiesInterface) {
		this._id = userProperties._id;
		this.name = userProperties.name;
		this.lastName = userProperties.lastName;
		this.timeStamp = userProperties.timeStamp;
		this.email = {
			email: userProperties.email.email,
			verified: userProperties.email.verified,
			verification_code:
				userProperties.email.verification_code !== null ? userProperties.email.verification_code : null,
		};
		this.cartId = userProperties.cartId;
		this.password = userProperties.password;
		this.address = {
			street: userProperties.address.street,
			city: userProperties.address.city,
			state: userProperties.address.state,
			streetNumber: userProperties.address.streetNumber,
			postalCode: userProperties.address.postalCode,
			country: userProperties.address.country,
		};
		this.phoneNumber = userProperties.phoneNumber;
		this.linkedAccounts = userProperties.linkedAccounts;
	}
}

// ! Exports
export { UserClass };
