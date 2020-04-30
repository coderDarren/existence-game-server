'use strict';
const NETWORK_MESSAGE_PLAYER_DATA = "PLAYER";
const NETWORK_MESSAGE_HIT_ENEMY = "HIT_ENEMY";

class Player {
    
    constructor(_game, _data, _socket) {
        this._game = _game;
        this._data = _data;
        this._socket = _socket;

        this.__hook__ = this.__hook__.bind(this);

        this.__hook__();
    }

    __hook__() {
        // tell server to update this player
        this._socket.on(NETWORK_MESSAGE_PLAYER_DATA, function(_player) {
            this._data = _player;
            this._game.updatePlayer(this);
        }.bind(this));
        
        this._socket.on(NETWORK_MESSAGE_HIT_ENEMY, function(_enemy) {
            this._game.onPlayerHitEnemy(this, _enemy);
        }.bind(this))
    }

    get data() { return this._data; }

    set data(_val) { this._data = _val; }
}

module.exports = Player;