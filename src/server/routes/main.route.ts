// ! Imports
// * Modules
import { Router } from 'express';
// * Controllers
import MainController from '../../controllers/main.controller';

// ! Route Definition
// * AUTH Router
const MAIN: Router = Router();

// ! Routes
MAIN.get('/stats', MainController.getStatus);

// ! Export
export default MAIN;
