// ! Imports
// * Types
import { newsletterPropertiesInterface } from '../interfaces/newsletter.interface';
import { Types } from 'mongoose';

// ! DTO Definition
class NewsletterClass implements newsletterPropertiesInterface {
	_id: Types.ObjectId;
	email: string;
	created_at: Date;
	constructor(newsletterProperties: newsletterPropertiesInterface) {
		this._id = newsletterProperties._id;
		this.email = newsletterProperties.email;
		this.created_at = newsletterProperties.created_at;
	}
}

// ! Exports
export { NewsletterClass };
