// ! Imports
// * DTOs
import { NewsletterClass } from '../models/DTOs/newsletter.dto';
// * Factories
import NewsletterDAO from '../models/factories/newsletter.factory';

// ! Service Definition
class NewsletterServiceClass {
	async create(newsletterInstance: NewsletterClass): Promise<boolean> {
		try {
			return await NewsletterDAO.create(newsletterInstance);
		} catch (error) {
			return false;
		}
	}
}

// ! Service Instance
const NewsletterService: NewsletterServiceClass = new NewsletterServiceClass();

// ! Exports
export default NewsletterService;
