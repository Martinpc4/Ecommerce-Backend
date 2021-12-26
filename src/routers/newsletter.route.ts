// ! Imports
// * Modules
import { Request, Response, Router } from 'express';
// * Classes
import {NewsletterClass} from "../classes/newsletter.classes";
// * Controllers
import NewsletterController from "../controllers/newsletter.controller";
// * Types
import {newsletterPropertiesInterface} from "../interfaces/newsletter.interfaces";
// * Loggers
import logger from '../logs/index.logs';
// * Services
import mongoose from '../services/mongodb.services'

// ! Route Definition
// * NEWS Router
const NEWS: Router = Router();

// * NEWS Routes
NEWS.post('/subscribe', async (req: Request, res: Response) => {
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
                _id: new mongoose.Types.ObjectId()
            };
            const flagVar: boolean = await NewsletterController.create(new NewsletterClass(newsletterProperties));
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
});

// ! Exports
export default NEWS;
