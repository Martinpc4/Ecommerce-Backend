// ! Imports
import express, { Request, Response, Router } from 'express';
import logger from '../logs/index.logs';

// ! Route Definition

// * AUTH Router
const MAIN: Router = express.Router();

// ! Routes
MAIN.get('/info', (req: Request, res: Response) => {
    try {
        res.status(200).json({
            arguments: process.argv,
            platform: process.platform,
            node: process.version,
            memory: process.memoryUsage(),
            path: process.execPath,
            id: process.pid,
            directory: process.cwd(),
        });
        logger.http({
            message: 'Successfully retrieve server information and status',
            method: 'GET',
            route: '/info',
            router: 'MAIN',
        });
    } catch (err) {
        res.status(500).send(`[GET] Get process info:\n\n${err}`);
        logger.error({
            message: `Getting server information and status failure`,
            method: `GET`,
            router: 'MAIN',
            route: `/info`,
            stack: err
        })
    }
});

// ! Export
export default MAIN;
