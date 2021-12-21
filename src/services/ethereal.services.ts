// ! Imports
// * Modules
import nodemailer, { Transporter } from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/sendmail-transport';
// * Utils
import env from '../utils/env.utils';

// ! Service's Variables
const adminMail: string = 'adminMail@mail.com';
let mailOptions: MailOptions = {};
let transportOptions: any = {};

if (env.NODE_ENV === 'production') {
	transportOptions = {
		host: env.NODEMAILER_HOST_PROD,
		port: 587,
		auth: {
			user: env.NODEMAILER_USER_DEV,
			pass: env.NODEMAILER_PASSWORD_DEV,
		},
	};
	mailOptions = {
		from: 'Import BA Ecommerce',
	};
} else {
	transportOptions = {
		host: env.NODEMAILER_HOST_DEV,
		port: 587,
		auth: {
			user: env.NODEMAILER_USER_DEV,
			pass: env.NODEMAILER_PASSWORD_DEV,
		},
	};
	mailOptions = {
		from: 'Import BA Ecommerce',
	};
}

// ! Node Mailer Service instance
const etherealTransporter: Transporter = nodemailer.createTransport(transportOptions);

// ! Exports
export { etherealTransporter, mailOptions, adminMail };
