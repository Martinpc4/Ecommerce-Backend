// ! Imports
// * Modules
import express from 'express';
import session from 'express-session';
import passport from './auth/passport.auth';
import cors from 'cors';
import morgan from 'morgan';
import logger from './logs/index.logs';
import mongoStore = require('connect-mongo');
import cluster from 'cluster';
import os from 'os';
// * Routes
import API from './routers/api.route';
import CART from './routers/cart.route';
import AUTH from './routers/auth.route';
import MAIN from './routers/main.route';
import USER from './routers/user.route';
// * Config
import environmentVariables from './config/env.config';

// ! Express Server

// * Express App Instance
const app = express();

// * Configurations
app.use(cors());
app.use(morgan('dev'));

// Express Body Parser (POST Method)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Template Engine & Views
app.set('view engine', 'ejs');
app.set('views', './src/views/pages');

// Express Session
app.use(
	session({
		secret: environmentVariables.COOKIE_SESSION_SECRET,
		store: mongoStore.create({
			mongoUrl: environmentVariables.MONGODB_URI,
		}),
		cookie: {
			httpOnly: false,
			secure: false,
			maxAge: 86400000,
		},
		rolling: true,
		resave: true,
		saveUninitialized: false,
	})
);

// Passport Auth
app.use(passport.initialize());
app.use(passport.session());

// Static Resources
app.use('/public', express.static(__dirname.replace('dist', 'public')));

// Routers
app.use('/', MAIN);
app.use('/api', API);
app.use('/api/carts', CART);
app.use('/auth', AUTH);
app.use('/users', USER);

// ! Clusters & Express Servers Initialization

if (cluster.isPrimary) {
	logger.info(`Master [PID: ${process.pid}] is running`);
	for (let i = 0; i < os.cpus().length / 2 && i < 4; i++) {
		cluster.fork();
	}
	cluster.on('exit', (worker, code, signal) => {
		logger.info(`Worker [PID: ${worker.process.pid}] died`);
	});
} else {
	app.listen(environmentVariables.PORT, () => {
		logger.info(`Express Server in Worker [PID: ${process.pid}] is running on port ${environmentVariables.PORT}`);
	});
}
