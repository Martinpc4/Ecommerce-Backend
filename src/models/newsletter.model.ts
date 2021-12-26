// ! Imports
// * Types
import { newsletterPropertiesInterface } from '../interfaces/newsletter.interfaces';
// * Services
import mongoose from '../services/mongodb.services';

// ! Model's Schema Definition
const newsletterSchema: mongoose.Schema = new mongoose.Schema<newsletterPropertiesInterface>({
    _id: {type: mongoose.Types.ObjectId, required: true},
    email: {type: String, required: true, unique: true},
    created_at: { type: Date, required: true, default: new Date() },
});

// ! Model Instance
const NewsletterModel = mongoose.model<newsletterPropertiesInterface>('newsletter', newsletterSchema);

// ! Exports
export default NewsletterModel;
