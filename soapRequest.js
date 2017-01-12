function getSoapRequest(user, pass, guid, updates) {
    return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
             <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
             <soap:Header><AuthenticationSoapHeader xmlns="https://portal.validar.com/">
                <Username>${user}</Username><Password>${pass}</Password>
             </AuthenticationSoapHeader></soap:Header>
             <soap:Body><PutRegistrationData xmlns="https://portal.validar.com/">
             <eventGuid>${guid}</eventGuid><data><![CDATA[
                 <updates>
                    ${updates}
                 </updates>
            ]]></data></PutRegistrationData></soap:Body></soap:Envelope>   
    `;
}

exports.getSoapRequest = getSoapRequest;