// ! Imports
// * Classes
import {NewsletterClass} from "../classes/newsletter.classes";
// * Data Access Objects
import NewsletterDAO from "../daos/newsletter.daos";


// ! Controller Definition
class NewsletterControllerClass {
    constructor() {}
    async create(newsletterInstance: NewsletterClass): Promise<boolean> {
        try {
            return await NewsletterDAO.create(newsletterInstance);
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}

// ! Controller Instance
const NewsletterController: NewsletterControllerClass = new NewsletterControllerClass();

// ! Exports
export default NewsletterController;
