// Required Modules
const fs = require('fs');
const csv = require('csv-parser');
const CryptoJS = require('crypto-js');
const request = require('request');
const js2xmlparser = require('js2xmlparser');

const settings = require('./settings');
console.log(settings.socious.eventId);