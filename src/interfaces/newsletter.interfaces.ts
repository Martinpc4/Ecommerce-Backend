// ! Imports
import mongoose from '../services/mongodb.services';

// ! Interface Definitions
interface newsletterPropertiesInterface {
    _id: mongoose.Types.ObjectId;
    email: string;
    created_at: Date;
}

// ! Exports
export {newsletterPropertiesInterface};
