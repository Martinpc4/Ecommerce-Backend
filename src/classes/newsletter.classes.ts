// ! Imports
// * Types
import {newsletterPropertiesInterface} from "../interfaces/newsletter.interfaces";
// * Services
import mongoose from '../services/mongodb.services';

// ! Class Definition
class NewsletterClass {
    _id: mongoose.Types.ObjectId;
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
