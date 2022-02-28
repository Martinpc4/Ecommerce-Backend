// ! Imports
// * Modules
import { Router } from 'express';
// * Controllers
import NewslettersController from '../../controllers/newsletter.controller';

// ! Route Definition
// * NEWS Router
const NEWS: Router = Router();

// * NEWS Routes
NEWS.post('/subscribe', NewslettersController.subscribe);

// ! Exports
export default NEWS;
