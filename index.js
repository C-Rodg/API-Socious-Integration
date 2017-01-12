// Required Modules
const fs = require('fs');
const csv = require('csv-parser');
const CryptoJS = require('crypto-js');
const js2xmlparser = require('js2xmlparser');
const Promise = require('bluebird');
const axios = require('axios');

const settings = require('./settings');
const soap = require('./soapRequest');

const js2xmlOptions = {
    declaration : {
        include : false
    }
};

const validarAxiosHeader = {
    headers : {
        "Content-Type" : "text/xml; charset=utf-8",
        "SOAPAction" : "https://portal.validar.com/PutRegistrationData",
        "Accept" : "text/xml"
    }
};

let firstPull = true;

function getSociousURL() {
    const timeObject = new Date();
    const timestamp = Math.round(timeObject.getTime() / 1000);
    const signatureSecret = settings.socious.eventId + settings.socious.action + timestamp;
    const signatureBytes = CryptoJS.HmacSHA256(signatureSecret, settings.socious.apiSecret);
    const signatureText = signatureBytes.toString();

    let url = `${settings.socious.baseURL}?action=${settings.socious.action}&eventid=${settings.socious.eventId}&timestamp=${timestamp}&apikey=${settings.socious.apiKey}&signature=${signatureText}`;
    if(!firstPull){
        url += '&updates=1';
    }
    console.log("1/7 : Got Socious URL");
    return url;
}

function makeSociousRequest() {
    return new Promise((resolve, reject) => {
        const sociousURL = getSociousURL();
        axios.get(sociousURL)
            .then((response) => {
                console.log("2/7 : Made successful Socious request");
                resolve(response);
            }).catch((err) => {
                console.log("Failed to make socious request", err);
                reject(err);
            });
    });
}

function writeCSVtoFile(csvStream) {
    return new Promise((resolve, reject) => {
        const csvWriter = fs.createWriteStream('./attendees.csv');
        csvWriter.write(csvStream.data);
        csvWriter.on('error', (err) => {
            console.log("Error creating write stream");
            reject(err);
        }).on('finish', () => {
            console.log("3/7 : Wrote stream to attendees.csv");
            resolve();
        });
        csvWriter.end();               
    });
}

function readCSVFile() {
    return new Promise((resolve, reject) => {
        let registrantRawArray = [];
        const readCSVStream = fs.createReadStream('attendees.csv').pipe(csv());
        readCSVStream.on('data', (data) => {
            registrantRawArray.push(data);
        }).on('end', () => {
            console.log("4/7 : Data loaded from attendees.csv");
            resolve(registrantRawArray);
        }).on('error', (err) => {
            console.log("Error creating read stream");
            reject(err);
        })
    });
}

function parseRegistrantArray(regArray) {
    return new Promise((resolve, reject) => {
        let registrantList = {
            updates : []
        };    
        regArray.forEach((row, i) => {
            let hasData = false;
            let person = {};
            for(let prop in regArray[i]){
                if(regArray[i].hasOwnProperty(prop)) {
                    if(settings.validar.fieldsToPull.indexOf(prop) > -1) {
                        person[prop] = regArray[i][prop];
                        hasData = true;
                    }
                }
            }
            if(hasData) {
                registrantList.updates.push(person);
            }
        });
        console.log(`5/7 : Removed unnecessary fields from ${registrantList.updates.length} attendees`);
        resolve(registrantList);
    });
}

function stringAndChunkArray(regArray) {   
    return new Promise((resolve, reject) => {
        let updatesArray = [];
        for(let i = 0, j = regArray.updates.length; i < j; i += settings.validar.maxNumberToPush) {
            let tempArray = regArray.updates.slice(i, i + settings.validar.maxNumberToPush);
            let xmlUpdates = convertArrToXMLStr(tempArray);
            updatesArray.push(xmlUpdates);
        }
        if(regArray.updates.length > 0) {
            console.log(`6/7 : Updates XML has been split into ${updatesArray.length}`);
            resolve(updatesArray);
        } else {
            console.log("No updates to post");
            reject();
        }
    });    
}

function pushToValidar(updatesArr) {
    if(updatesArr.length > 0) {
        let soapData = soap.getSoapRequest(settings.validar.username, settings.validar.password, settings.validar.eventGuid, updatesArr[0]);
        //fs.writeFile('test.xml', soapData, ()=>{});
        return axios.post(settings.validar.soapURL, soapData, validarAxiosHeader)
            .then((response) => {
                updatesArr.shift();
                if(updatesArr.length > 0) {
                    pushToValidar(updatesArr);
                } else {
                    firstPull = false;
                    console.log("7/7 : Finished posting everything to Validar");
                }
            }).catch((err) => {
                console.log("Error posting to Validar");
            });
    }
}

// Helper function to convert JSON to string
function convertArrToXMLStr(arr) {
    let regList = {};
    regList.update = arr;
    let xmlFromJS = js2xmlparser.parse("reg", regList, js2xmlOptions);
    let xmlStr = xmlFromJS.substring(5, xmlFromJS.length-6);
    return xmlStr;
}

function startApplication() {
    console.log("Starting data pull...");
    makeSociousRequest()
        .then(writeCSVtoFile)
        .then(readCSVFile)
        .then(parseRegistrantArray)
        .then(stringAndChunkArray)
        .then(pushToValidar)
        .catch((err) => {
            console.log(err);
        });
}

// Start the application
console.log("Starting application...");
setInterval(startApplication, settings.validar.timeBetweenPulls);  // 60000