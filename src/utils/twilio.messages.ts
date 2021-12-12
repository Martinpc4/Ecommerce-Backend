// ! Imports
// * Modules
import twilio from 'twilio';

// ! Service's Variables

let accountId;
let authToken;
let messagesOptions;
const adminPhoneNumber: number = 541184597864;

if (process.env.NODE_ENV === 'production') {
	if (process.env.TWILIO_ACCOUNT_ID_PROD == undefined || process.env.TWILIO_AUTH_TOKEN_PROD === undefined || process.env.TWILIO_MESSAGING_SERVICE_ID_PROD === undefined) {
		  throw new Error('Twilio production creadentials are not defined');
	}
	accountId = process.env.TWILIO_ACCOUNT_ID_PROD;
	authToken = process.env.TWILIO_AUTH_TOKEN_PROD;
	messagesOptions = {
		messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_ID_PROD,
	}
} else {
	if (process.env.TWILIO_ACCOUNT_ID_DEV == undefined || process.env.TWILIO_AUTH_TOKEN_DEV === undefined || process.env.TWILIO_MESSAGING_SERVICE_ID_DEV === undefined) {
		  throw new Error('Twilio development creadentials are not defined');
	}
	accountId = process.env.TWILIO_ACCOUNT_ID_DEV;
	authToken = process.env.TWILIO_AUTH_TOKEN_DEV;
	messagesOptions = {
		messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_ID_DEV,
	};
}

// ! Twwilio Service Instance
const twilioClient = twilio(accountId, authToken);

export { twilioClient, messagesOptions, adminPhoneNumber };
