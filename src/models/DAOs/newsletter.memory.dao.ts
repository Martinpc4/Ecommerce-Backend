// ! Imports
// * DTOs
import { NewsletterClass } from '../DTOs/newsletter.dto';

// ! DAO Definition
class NewsletterDAO {
	private newsletters: NewsletterClass[];
	constructor() {
		this.newsletters = [];
	}
	exists(email: string): boolean {
		for (const newsletterInstance of this.newsletters) {
			if (newsletterInstance.email.trim() === email.trim()) {
				return true;
			}
		}
		return false;
	}
	create(newsletterInstance: NewsletterClass): boolean {
		if (!this.exists(newsletterInstance.email)) {
			this.newsletters.push(newsletterInstance);
			return true;
		} else {
			throw new Error('Newsletter is already created for this address');
		}
	}
}

// ! Exports
export default NewsletterDAO;
