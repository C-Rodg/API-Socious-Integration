const credentials = require('./credentials');

const fields = ["eventid","userid","registrationid","regcode","salutation","firstname","lastname","badgename","title","organization","address1","address2","city","state","country","fullcountry","postalcode","email","phone","fax","regtype","registrationpaid","memtype","discname","vendorcode","showonattendeelist","ccemail","cancelled","s0","s1","i20","s8","s9","s10","i0","i14","i4","i5","i2","s4","s2","t1","i18","i6","s5","i1","s6","s7","t0","i7"];

const validar = {
	maxNumberToPush : 300,
	soapURL : 'https://registration.validar.com/WebServices/V1/Partner/PartnerService.asmx',
	timeBetweenPulls : 144000,  // 300000 = 5 min, currently 2.4min
	username : credentials.secrets.validarUser,
	password : credentials.secrets.validarPassword,
	fieldsToPull : fields,
	eventGuid : credentials.secrets.eventGuid
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