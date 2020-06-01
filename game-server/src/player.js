'use strict';
const API = require('./util/api.js');

const NETWORK_MESSAGE_PLAYER_DATA = "PLAYER";
const NETWORK_MESSAGE_HIT_MOB = "HIT_MOB";
const NETWORK_MESSAGE_INVENTORY_CHANGED = "INVENTORY_CHANGE";

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
            this._data.player = _player;
            this._game.updatePlayer(this);
        }.bind(this));
        
        this._socket.on(NETWORK_MESSAGE_HIT_MOB, function(_mobHitInfo) {
            this._game.onPlayerHitMob(this, _mobHitInfo);
        }.bind(this))

        this._socket.on(NETWORK_MESSAGE_INVENTORY_CHANGED, function(_updateInfo) {
            if (!this._data.account) return;
            API.updateInventoryItemSlot({
                id: this._data.account.id,
                apiKey: this._data.account.apiKey,
                playerID: this._data.player.id,
                slotLoc: _updateInfo.slotLoc,
                slotID: _updateInfo.slotID
            });
        }.bind(this));
    }
    
    get data() { return this._data.player; }
    get sessionId() { return this._data.sessionId; }
    get socket() { return this._socket; }
    set data(_val) { this._data.player = _val; }
}

module.exports = Player;