// ! Imports
import mongoose from '../../services/mongoose.service';

// ! Interface Definitions
interface newsletterPropertiesInterface {
    _id: mongoose.Types.ObjectId;
    email: string;
    created_at: Date;
}

// ! Exports
export {newsletterPropertiesInterface};
