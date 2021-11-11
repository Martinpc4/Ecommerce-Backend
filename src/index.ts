// ! Imports
// * Modules & Libraries
import express from 'express';
import session from 'express-session';
import passport from './auth/passport.auth';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import logger from './logs/index.logs';

import cluster from 'cluster';
import os from 'os';

// * Routes
import API from './routers/api.route';
import CART from './routers/cart.route';
import AUTH from './routers/auth.route';
import MAIN from './routers/main.route';

// ! Environment variables

// Configuration
dotenv.config();
// Variables check
if (process.env.HOME_ROUTE === undefined) {
    logger.error('Home Route is missing, cannot initiate server');
    throw new Error('Home Route is missing, cannot initiate server');
}

// ! Express Server

// * Express App Instance
const app = express();

// * Configurations
app.use(cors());
app.use(morgan('dev'));

// Express Body Parser (POST Method)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Static Resources
app.use('/resources', express.static(`node_modules`));

// Template Engine & Views
app.set('view engine', 'ejs');
app.set('views', './src/views/pages');

// Express Session
app.use(
    session({
        secret: 'alpha delta zulu tango',
        cookie: {
            httpOnly: false,
            secure: false,
            maxAge: 60 * 10000 * 10,
        },
        rolling: true,
        resave: true,
        saveUninitialized: false,
    })
);

// Passport Auth
app.use(passport.initialize());
app.use(passport.session());

// Routers
app.use('/', MAIN);
app.use('/api', API);
app.use('/api/carrito', CART);
app.use('/auth', AUTH);

// ! Clusters Initialization

if (cluster.isPrimary) {
    logger.info(`Master PID ${process.pid} is running`);
	for (let i = 0; i < (os.cpus().length - 4) && i < 4; i++) {
        cluster.fork();
	}
	cluster.on('exit', (worker, code, signal)=>{
        logger.info(`Worker (PID:${worker.process.pid}) died`);
	});
} else {
	console.log(`Worker PID ${process.pid} is running`);
    app.listen(process.env.PORT, () => {
        logger.info(`Express server instance running on port ${process.env.PORT}`);
    });
}