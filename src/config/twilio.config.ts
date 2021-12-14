// ! Imports
// * Modules
import twilio from 'twilio';
// * Config
import env from './env.config';

// ! Service's Variables

let accountId;
let authToken;
let messagesOptions;
const adminPhoneNumber: number = 541184597864;

if (env.NODE_ENV === 'production') {
	accountId = env.TWILIO_ACCOUNT_ID_PROD;
	authToken = env.TWILIO_AUTH_TOKEN_PROD;
	messagesOptions = {
		messagingServiceSid: env.TWILIO_MESSAGING_SERVICE_ID_PROD,
	}
} else {
	accountId = env.TWILIO_ACCOUNT_ID_DEV;
	authToken = env.TWILIO_AUTH_TOKEN_DEV;
	messagesOptions = {
		messagingServiceSid: env.TWILIO_MESSAGING_SERVICE_ID_DEV,
	};
}

// ! Twwilio Service Instance
const twilioClient = twilio(accountId, authToken);

export { twilioClient, messagesOptions, adminPhoneNumber };
