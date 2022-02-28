// ! Imports
// * DAOs
import NewsletterMongooseDAO from '../DAOs/newsletter.mongoose.dao';
import NewsletterMemoryDAO from '../DAOs/newsletter.memory.dao';
// * Utils
import arguments from '../../utils/args.utils';

// ! Factory Definition
const storageOption: string = arguments.storage;

let NewsletterDAO: NewsletterMemoryDAO | NewsletterMongooseDAO;

if (storageOption === 'mongoose') {
	NewsletterDAO = new NewsletterMongooseDAO();
} else {
	NewsletterDAO = new NewsletterMemoryDAO();
}

// ! Exports
export default NewsletterDAO;
