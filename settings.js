const credentials = require('./credentials');

const validar = {
	maxNumberToPush : 300,
	timeBetweenPulls : 144000  // 300000 = 5 min, currently 2.4min
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