// ! Imports
// * Modules
import nodemailer, { Transporter } from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/sendmail-transport';

// ! Service's Variables
const adminMail: string = 'adminMail@mail.com';
let mailOptions: MailOptions = {};
let transportOptions: any = {};

if (process.env.NODE_ENV === 'production') {
} else {
	(transportOptions = {
		host: 'smtp.ethereal.email',
		port: 587,
		auth: {
			user: 'fatima.davis10@ethereal.email',
			pass: 'wK7K965mnn15M9FVgZ',
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
