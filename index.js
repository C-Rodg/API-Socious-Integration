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
    },
    arrayMap : {
        updates : "update"
    }
};

function getSociousURL() {
    const timeObject = new Date();
    const timestamp = Math.round(timeObject.getTime() / 1000);
    const signatureSecret = settings.socious.eventId + settings.socious.action + timestamp;
    const signatureBytes = CryptoJS.HmacSHA256(signatureSecret, settings.socious.apiSecret);
    const signatureText = signatureBytes.toString();

    const url = `${settings.socious.baseURL}?action=${settings.socious.action}&eventid=${settings.socious.eventId}&timestamp=${timestamp}&apikey=${settings.socious.apiKey}&signature=${signatureText}`;
    // TODO: ADD '&updates=1' after first request...

    return url;
}

function makeSociousRequest() {
    return new Promise((resolve, reject) => {
        const sociousURL = getSociousURL();
        axios.get(sociousURL)
            .then((response) => {
                console.log("Made Socious request");
                resolve(response);
            }).catch((err) => {
                console.log(err);
                reject(err);
            });
    });
}

function writeCSVtoFile(csvStream) {
    return new Promise((resolve, reject) => {
        const csvWriter = fs.createWriteStream('./attendees.csv');
        csvWriter.write(csvStream.data);
        csvWriter.end();
        console.log("Wrote stream to attendees.csv");
        resolve();
    });
}

function readCSVFile() {
    return new Promise((resolve, reject) => {
        let registrantRawArray = [];
        const readCSVStream = fs.createReadStream('attendees.csv').pipe(csv());
        readCSVStream.on('data', (data) => {
            registrantRawArray.push(data);
        }).on('end', () => {
            console.log(registrantRawArray.length);
            resolve(registrantRawArray);
        });
    });
}

function startApplication() {
    makeSociousRequest()
        .then(writeCSVtoFile)
        .then(readCSVFile)
        .catch((err) => {
            console.log(err);
        });
}

startApplication();