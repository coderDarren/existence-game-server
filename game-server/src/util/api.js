const RestClient = require('./rest.js');

class API {
    constructor() {
        this._rest = RestClient;
        this._apiUrl = 'https://15paucwkia.execute-api.us-east-1.amazonaws.com/dev/api/';
    }

    savePlayerSessionPos(_data) {
        this._rest.postDataWithCallbacks(`${this._apiUrl}updateSessionData`, _data);
    }
}

module.exports = new API();