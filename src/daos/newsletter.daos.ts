// ! Imports
// * Classes
import {NewsletterClass} from "../classes/newsletter.classes";
// * Models
import NewsletterModel from "../models/newsletter.model";
// * Classes

// ! Data Access Object Definition
class NewsletterDAO {
    constructor() {}
    async exists(email: string): Promise<boolean> {
        return await NewsletterModel.exists({ email: {$eq: {email}} });
    }
    async create(newsletterInstance: NewsletterClass): Promise<boolean> {
        await (new NewsletterModel(newsletterInstance)).save();
        return await this.exists(newsletterInstance.email);
    }
}

// ! Data Access Object Instance
const NewsletterDAOInstance: NewsletterDAO = new NewsletterDAO();

// ! Exports
export default NewsletterDAOInstance;
