// ! Imports
// * Controllers
import NewsletterService from '../services/newsletter.service';
// * DTOs
import { NewsletterClass } from '../models/DTOs/newsletter.dto';
// * Interfaces
import { Request, Response } from 'express';
import { newsletterPropertiesInterface } from '../models/interfaces/newsletter.interface';
import { Types } from 'mongoose';
// * Logs
import logger from '../server/logs/index.logs';

// ! Controller Definition
class NewsletterControllerClass {
	async subscribe(req: Request, res: Response): Promise<void> {
		try {
			if (req.body.email === undefined) {
				res.status(400).json({ success: false, message: 'Invalid email' });
				logger.notice({
					message: 'Invalid email',
					router: 'NEWS',
					method: 'POST',
					route: '/subscribe',
				});
			} else {
				const newsletterProperties: newsletterPropertiesInterface = {
					email: req.body.email,
					created_at: new Date(),
					_id: new Types.ObjectId(),
				};
				const flagVar: boolean = await NewsletterService.create(new NewsletterClass(newsletterProperties));
				if (flagVar) {
					res.status(200).json({ success: true, message: 'Subscribed to newsletter' });
					logger.notice({
						message: 'Subscribed to newsletter',
						router: 'USER',
						method: 'POST',
						route: '/subscribe',
					});
				} else {
					res.status(400).json({ success: false, message: 'Subscription failed' });
					logger.notice({
						message: 'Subscription failed',
						router: 'NEWS',
						method: 'POST',
						route: '/subscribe',
					});
				}
			}
		} catch (err) {
			logger.error({
				message: 'Error in subscribing to newsletter',
				router: 'NEWS',
				method: 'POST',
				route: '/subscribe',
				stack: err,
			});
			res.status(500).json({ success: false, message: 'Internal Server Error', stack: err });
		}
	}
}

// ! Controller Defintion
const NewslettersController = new NewsletterControllerClass();

// ! Exports
export default NewslettersController;
