const Player = require('./player.js');
const Table = require('./table.js');
const Authenticator = require('./util/authenticator.js');

class GameServer
{
    constructor(_io, _tableNames)
    {
        console.log("configuring game server");
        // our socket management
        this._io = _io;

        // the managed socket connections
        this._connections = [];

        this.__create_tables__ = this.__create_tables__.bind(this);
        this.__authenticate__ = this.__authenticate__.bind(this);
        this.__on_connect__ = this.__on_connect__.bind(this);

        // the tables managed by this server
        this._tables = this.__create_tables__(_tableNames);

        this._io.on('connection', this.__on_connect__);
    }

    __create_tables__(_tableNames)
    {
        var _ret = [];
        console.log(`creating tables from ${JSON.stringify(_tableNames)}`);
        for (var i = 0; i < _tableNames.length; i++) {
            _ret[_tableNames[i]] = new Table(this);
        }
        return _ret;
    }

    __on_connect__(_socket)
    {
        console.log("player connected.");
        _socket.on('handshake', function(_authToken) {
            this.__authenticate__(_socket, _authToken);
        }.bind(this));
    }

    __authenticate__(_socket, _authToken)
    {
        const _auth = _authToken.split(':');
        console.log('authenticating player... '+_authToken);
        this._connections.push(_socket);
        const _player = new Player(_socket, _auth[0]);
        const _table = this._tables[_auth[1]];
        _table.connect(_player);
        _player.socket.emit('handshake', `Server confirmed auth token.`);
        console.log('authentication success!');
        /*const _auth = new Authenticator(_authToken, this._tables);
        _auth.authenticate(
            // success
            function(_table, _username) {
                console.log('authentication success!');
                this._connections.push(_socket);
                const _player = new Player(_socket, _username);
                _table.connect(_player);
                _player.socket.emit('handshake', `Server confirmed auth token.`);
            }.bind(this),
            // failure
            function(_err) {
                console.log(_err);
                _socket.emit('disallowed');
            }
        );*/
    }

    disconnect(_table, _socket)
    {
        console.log('disconnecting player')
        this._connections = this._connections.filter(_item => {
            return _item != _socket;
        });
    }
    
}

module.exports = GameServer;