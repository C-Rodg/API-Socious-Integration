const credentials = require('./credentials');

const validar = {
	maxNumberToPush : 300,
	soapURL : 'https://registration.validar.com/WebServices/V1/Partner/PartnerService.asmx',
	timeBetweenPulls : 144000,  // 300000 = 5 min, currently 2.4min
	username : credentials.secrets.validarUser,
	password : credentials.secrets.validarPassword,
	fieldsToPull : ['registrationid', 'regcode', 'firstname', 'lastname', 'title', 'organization', 'address1', 'address2', 'city', 'state', 'fullcountry', 'postalcode', 'email', 'phone', 'regtype', 'memtype', 'i4']
};

const socious = {
	action : 'attendees',
	eventId : credentials.secrets.eventId,
	apiKey : credentials.secrets.apiKey,
	apiSecret : credentials.secrets.apiSecret,
	baseURL : 'https://iaug.socious.com/a/csv/exportevt/service'
};


exports.validar = validar;
exports.socious = socious;