const Game = require('./game.js');
const TABLE_LIMIT = 4;
const MESSAGE_TARGET_INCLUDE = 0;
const MESSAGE_TARGET_EXCLUDE = 1;
const MESSAGE_TYPE_PLAYER_STATE = 'playerState';
const MESSAGE_TYPE_PLAYER_JOINED = 'playerJoined';
const MESSAGE_TYPE_PLAYER_LEFT = 'playerLeft';

class Table
{
    constructor(_server)
    {
        this._server = _server;
        this._game = new Game();
        this._players = [];
        this._playerState = [];

        this.message = this.message.bind(this);
        this.__send_include__ = this.__send_include__.bind(this);
        this.__send_exclude__ = this.__send_exclude__.bind(this);
        this.__send_player_state__ = this.__send_player_state__.bind(this);
        this.__broadcast__ = this.__broadcast__.bind(this);
    }

    connect(_player)
    {
        console.log(`connecting ${_player.username} to the table.`);
        this._players.push(_player);
        this._playerState.push({name:_player.username,state:''});
        _player.table = this;
        this.__send_player_state__(_player, MESSAGE_TARGET_INCLUDE);
        this.__broadcast__(MESSAGE_TYPE_PLAYER_JOINED, _player.username)
    }

    disconnect(_player)
    {
        console.log(`disconnecting ${_player.username} from the table.`);
        this._server.disconnect(_player.socket);
        this._players = this._players.filter(_item => {
            return _item.socket != _player.socket;
        });
        this._playerState = this._playerState.filter(_item => {
            return _item.name != _player.username;
        });
        this.__broadcast__(MESSAGE_TYPE_PLAYER_LEFT, _player.username)
    }

    message(_fromPlayer, _data)
    {
        const _obj = JSON.parse(_data);
        
        switch (_obj.target) {
            case MESSAGE_TARGET_INCLUDE:
                this.__send_include__(_fromPlayer, _data);
                break;
            case MESSAGE_TARGET_EXCLUDE:
                this.__send_exclude__(_fromPlayer, _data);
                break;
        }
    }

    /*
     * Relay _fromPlayer _data to all players in the table, INCLUDING _fromPlayer (the sender)
     */
    __send_include__(_fromPlayer, _data)
    {
        for (var i = 0; i < this._players.length; i++)
        {
            this._players[i].socket.emit('message', _data);
        }
    }

    /*
     * Relay _fromPlayer _data to all players in the table, EXCLUDING _fromPlayer (the sender)
     */
    __send_exclude__(_fromPlayer, _data)
    {
        for (var i = 0; i < this._players.length; i++)
        {
            if (this._players[i] == _fromPlayer) continue;
            this._players[i].socket.emit('message', _data);
        }
    }

    __send_player_state__(_player, _target)
    {
        this.message(_player, JSON.stringify({
            'messageType': MESSAGE_TYPE_PLAYER_STATE,
            'message': JSON.stringify({players: this._playerState}),
            'target': _target
        }));
    }

    __broadcast__(_messageType, _message)
    {
        this.__send_include__(null, JSON.stringify({
            'messageType': _messageType,
            'message': _message
        }));
    }

    get tableIsFull() { return this._players.length == TABLE_LIMIT; }
}

module.exports = Table;