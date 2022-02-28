// ! Imports
// * Modules
import express from 'express';
import session from 'express-session';
import passport from '../auth/passport.auth';
import cors from 'cors';
import morgan from 'morgan';
import logger from './logs/index.logs';
import cluster from 'cluster';
import os from 'os';
import swaggerUi from 'swagger-ui-express';
import { Server as HTTPServer } from 'http';
import { Server as IOServer, Socket } from 'socket.io';
import mongoStore = require('connect-mongo');
import mongoose from '../services/mongoose.service';
// * Auth
import socketAuth from '../auth/socket.auth';
// * Controllers
import MessageController from '../controllers/message.controller';
// * Interfaces
import { messagePropertiesInterface } from '../models/interfaces/message.interface';
// * Routes
import PRODUCTS from './routes/products.route';
import CARTS from './routes/carts.route';
import AUTH from './routes/auth.route';
import MAIN from './routes/main.route';
import USERS from './routes/users.route';
import NEWS from './routes/newsletter.route';
// * Utils
import env from '../utils/env.utils';
import swaggerData from '../utils/swagger.utils';
import args from '../utils/args.utils';

// ! Express & HTTP Apps
// Setting up the express app
const app = express();
// Setting up http server app
const httpApp = new HTTPServer(app);

// ! Express Server Configurations
// * Various Middlewares
app.use(morgan('dev'));
app.use(cors());

// * Express Body Parser Middlewares (POST Method)

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// * Template Engine & Views
app.set('view engine', 'ejs');
app.set('views', './src/views/pages');

// * Express Session
const expressSession = session({
	secret: env.COOKIE_SESSION_SECRET,
	store: mongoStore.create({
		mongoUrl: env.MONGODB_URI,
		collectionName: 'sessions',
	}),
	cookie: {
		httpOnly: true,
		secure: false,
		maxAge: 86400000,
	},
	rolling: true,
	resave: true,
	saveUninitialized: false,
});
app.use(expressSession);

// * Passport Auth App
app.use(passport.initialize());
app.use(passport.session());

app.use('/public', express.static(__dirname.replace('dist', 'public')));
// * Routes

app.use('/', MAIN);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerData));
app.use('/api/products', PRODUCTS);
app.use('/api/carts', CARTS);
app.use('/api/newsletter', NEWS);
app.use('/api/users', USERS);
app.use('/auth', AUTH);

// ! SocketIO Server
// Create Socket Server
const io: IOServer = new IOServer(httpApp);
// Apply Auth JWT Middleware
io.use(socketAuth);

// Channels Definitions
io.on('connection', (socket: Socket) => {
	socket.on('message-send', async (data: messagePropertiesInterface) => {
		await MessageController.receiveMessage(data, io);
	});
});

// ! Clusters Forking and Express Servers Initialization
if (cluster.isPrimary) {
	// logging
	logger.info(`Master [PID: ${process.pid}] is running`);
	// Cluster Forking & Closing connection event
	if (args.storage !== 'memory') {
		for (let i = 0; i < os.cpus().length / 2 && i < 4; i++) {
			cluster.fork();
		}
	} else {
		cluster.fork();
	}

	cluster.on('exit', (worker, _code, _signal) => {
		logger.info(`Worker [PID: ${worker.process.pid}] died`);
	});
} else {
	// Listen for incoming requests
	httpApp.listen(env.PORT, () => {
		if (args.storage === 'mongoose') {
			logger.info(
				`Express Server in Worker [PID: ${process.pid}] is running on port ${env.PORT} with mongoose v${mongoose.version}`
			);
		} else {
			logger.info(`Express Server in Worker [PID: ${process.pid}] is running on port ${env.PORT} in memory`);
		}
	});
}
