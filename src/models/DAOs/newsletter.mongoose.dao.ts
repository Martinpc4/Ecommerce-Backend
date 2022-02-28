// ! Imports¿
// * DTOs
import { NewsletterClass } from '../DTOs/newsletter.dto';
// * Models
import NewsletterModel from '../newsletter.model';

// ! DAO Definition
class NewsletterDAO {
	async exists(email: string): Promise<boolean> {
		if (await NewsletterModel.exists({ email: { $eq: { email } } })) {
			return true;
		}
		return false;
	}
	async create(newsletterInstance: NewsletterClass): Promise<boolean> {
		await new NewsletterModel(newsletterInstance).save();
		return await this.exists(newsletterInstance.email);
	}
}

// ! Exports
export default NewsletterDAO;
