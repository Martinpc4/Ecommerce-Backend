// ! Imports
// * Modules
import { Schema, model } from 'mongoose';
// * Interfaces
import { newsletterPropertiesInterface } from './interfaces/newsletter.interface';

// ! Model's Schema Definition
const newsletterSchema: Schema = new Schema<newsletterPropertiesInterface>({
	email: { type: String, required: true, unique: true },
	created_at: { type: Date, required: true, default: new Date() },
});

// ! Model Instance
const NewsletterModel = model<newsletterPropertiesInterface>('newsletters', newsletterSchema);

// ! Exports
export default NewsletterModel;
