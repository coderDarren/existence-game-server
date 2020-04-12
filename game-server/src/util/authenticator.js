const Rest = require('./rest.js');

class Authenticator
{
    constructor(_authToken, _tables)
    {
        this._authToken = _authToken;
        this._tables = _tables;
    }

    authenticate(_onSuccess=null, _onFailure=null)
    {
        if (!this._authToken) {
            if (_onFailure) _onFailure('auth token does not exist');
            return;
        }

        console.log(`validating auth ${this._authToken}`);
        this._auth = this._authToken.split(':');
        if (this._auth.length != 3) {
            if (_onFailure) _onFailure(`auth token was in the wrong format`);
            return;
        }

        if (this._tables[this._auth[1]] == undefined) {
            if (_onFailure) _onFailure(`table ${this._auth[1]} is not defined`);
            return;
        }

        const _authUrl = process.env.ENDPOINT_MATCHMAKER+process.env.SERVICE_AUTHPLAYER;
        const _authData = {
            playerId: this._auth[0],
            tableId: this._auth[1],
            passphrase: this._auth[2]
        };
        this._table  = this._tables[_authData.tableId];
        Rest.postDataWithCallbacks(_authUrl, _authData, 
            function(_successResponse) {
                const _userInfo = JSON.parse(_successResponse.message);
                if (_onSuccess) _onSuccess(this._table, _userInfo.username.S);
            }.bind(this), 
            function(_failResponse) {
                if (_onFailure) _onFailure(`Authentication failed: ${_failResponse}`);
            }
        );
    }
}

module.exports = Authenticator;