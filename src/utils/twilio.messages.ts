// ! Imports
// * Modules
import twilio from 'twilio';
// * Controllers
// * Classes
// * Interfaces
// * Models
// * Utils
// * Auth Strategies
// * Loggers
// * Middlewares
// ! Controller
// ! Exports

// ! Service's Variables
const accountId = 'AC9ed1c633a4812b49ea10ef59f690c7d1';
const authToken = '04550b17375af1adab4a5c4a4c2bdd10';
const adminPhoneNumber: number = 541184597864;
const messagesOptions = {
	messagingServiceSid: 'MG36b37adba85b538cdb47b76fe91aea00',
};

// ! Twwilio Service Instance
const twilioClient = twilio(accountId, authToken);

export { twilioClient, messagesOptions, adminPhoneNumber };
