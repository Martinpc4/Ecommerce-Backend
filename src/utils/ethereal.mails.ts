// ! Imports
// * Modules
import nodemailer, { Transporter } from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/sendmail-transport';

// ! Service's Variables
const adminMail: string = 'adminMail@mail.com';
let mailOptions: MailOptions = {};
let transportOptions: any = {};


if (process.env.NODE_ENV === 'production') {
	if (process.env.NODEMAILER_USER_PROD === undefined || process.env.NODEMAILER_PASSWORD_PROD === undefined) {
		throw new Error('Nodemailer production credentials not found');
	}
} else {
	if (process.env.NODEMAILER_USER_DEV === undefined || process.env.NODEMAILER_PASSWORD_DEV === undefined || process.env.NODEMAILER_HOST_DEV === undefined) {
		throw new Error('Nodemailer development credentials not found');
	}
	(transportOptions = {
		host: process.env.NODEMAILER_HOST_DEV,
		port: 587,
		auth: {
			user: process.env.NODEMAILER_USER_DEV,
			pass: process.env.NODEMAILER_PASSWORD_DEV,
		},
	}),
		(mailOptions = {
			from: 'Import BA Ecommerce',
		});
}

// ! Node Mailer Service instance
const etherealTransporter: Transporter = nodemailer.createTransport(transportOptions);

// ! Exports
export { etherealTransporter, mailOptions, adminMail };
