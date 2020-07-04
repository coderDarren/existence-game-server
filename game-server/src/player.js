'use strict';
const API = require('./util/api.js');
const {Vector3, LowPrecisionSimpleVector3} = require('./util/vector.js');
const {filter} = require('lodash');

const NETMSG_PLAYER_DATA = "PLAYER";
const NETMSG_HIT_MOB = "HIT_MOB";
const NETMSG_INVENTORY_CHANGED = "INVENTORY_CHANGE";
const NETMSG_ADD_INVENTORY = "ADD_INVENTORY";
const NETMSG_ADD_INVENTORY_SUCCESS = "ADD_INVENTORY_SUCCESS";
const NETMSG_ADD_INVENTORY_FAILURE = "ADD_INVENTORY_FAILURE";
const NETMSG_MOB_SPAWN = "MOB_SPAWN";
const NETMSG_MOB_EXIT = "MOB_EXIT";
const NETMSG_PLAYER_SPAWN = "PLAYER_SPAWN";
const NETMSG_PLAYER_EXIT = "PLAYER_EXIT";
const NETMSG_PLAYER_HIT_MOB_CONFIRMATION = "PLAYER_HIT_MOB_CONFIRMATION";
const NETMSG_PLAYER_LOOT_MOB = "PLAYER_LOOT_MOB";
const NETMSG_MOB_LOOTED = "MOB_LOOTED";
const NETMSG_MOB_LOOT_LOCKED = "PLAYER_MOB_LOOT_LOCKED";
const NETMSG_PLAYER_LOCK_LOOT = "PLAYER_LOCK_LOOT";
const NETMSG_PLAYER_EQUIP = "PLAYER_EQUIP";
const NETMSG_PLAYER_UNEQUIP = "PLAYER_UNEQUIP";
const NETMSG_PLAYER_EQUIP_SUCCESS = "PLAYER_EQUIP_SUCCESS";
const NETMSG_PLAYER_EQUIP_FAILURE = "PLAYER_EQUIP_FAILURE";
const NETMSG_PLAYER_UNEQUIP_SUCCESS = "PLAYER_UNEQUIP_SUCCESS";
const NETMSG_PLAYER_UNEQUIP_FAILURE = "PLAYER_UNEQUIP_FAILURE";

class Player {
    
    constructor(_game, _data, _socket) {
        this._game = _game;
        this._data = _data;
        this._socket = _socket;
        this._nearbyMobs = [];
        this._nearbyMobsState = {};
        this._nearbyPlayers = [];
        this._nearbyPlayersState = {};
        this._dead = false;

        // these values help us determine if the player is stationary or not
        this._lastFramePos = this._data.player.pos;
        this._lastFrameRot = this._data.player.rot;
        this._posChange = 0;
        this._rotChange = 0;
        this._stationaryTimer = 0;

        this.__hook__ = this.__hook__.bind(this);
        this.__handle_nearby_objects__ = this.__handle_nearby_objects__.bind(this);
        this.__on_mob_spawn__ = this.__on_mob_spawn__.bind(this);
        this.__on_mob_exit__ = this.__on_mob_exit__.bind(this);
        this.__on_player_spawn__ = this.__on_player_spawn__.bind(this);
        this.__on_player_exit__ = this.__on_player_exit__.bind(this);
        this.__detect_stationary__ = this.__detect_stationary__.bind(this);
        this.__on_equip__ = this.__on_equip__.bind(this);
        this.__on_unequip__ = this.__on_unequip__.bind(this);
        this.__send_message_to_nearby_players__ = this.__send_message_to_nearby_players__.bind(this);

        this.__hook__();
    }

    update() {
        this.__detect_stationary__();
        this._nearbyMobs = this.__handle_nearby_objects__(this._nearbyMobs, this._nearbyMobsState, this._game.mobs, 'id', 50, this.__on_mob_spawn__, this.__on_mob_exit__);
        this._nearbyPlayers = this.__handle_nearby_objects__(this._nearbyPlayers, this._nearbyPlayersState, this._game.players, 'name', 50, this.__on_player_spawn__, this.__on_player_exit__);
    }

    __detect_stationary__() {
        this._posChange = new Vector3(this._data.player.pos).distanceTo(new Vector3(this._lastFramePos));
        this._rotChange = new Vector3(this._data.player.rot).distanceTo(new Vector3(this._lastFrameRot));
        this._lastFramePos = this._data.player.pos;
        this._lastFrameRot = this._data.player.rot;
        if (this._posChange == 0 && this._rotChange == 0) {
            this._stationaryTimer += this._game.deltaTime;
        } else {
            this._stationaryTimer = 0;
        }
    }

    __handle_nearby_objects__(_output, _state, _objects, id, _range, _evt_on_spawn_, _evt_on_exit_) {
        // clear the state
        Object.keys(_state).forEach((_key, _index) => {
            _state[_key] = false;
        });

        // update the state
        const _playerPos = new Vector3(this._data.player.pos);
        _output = filter(_objects, function(_o) {
            // do not send player data back to himself
            if (_o.data.id == this._data.player.id) {
                //console.log(this._data.player.id)
                return false;
            }

            const _pos = new Vector3(_o.data.pos);

            // compare the distance of the player to the object
            if (_playerPos.distanceTo(_pos) <= _range) {

                // if within range, check to see if this object has been spawned yet
                //console.log(_o.data[id])
                if (_state[_o.data[`${id}`]] == undefined) { // object has not been spawned
                    // send spawn event
                    _evt_on_spawn_(_o);
                }

                // update the object state
                _state[_o.data[`${id}`]] = true;

                // do not send object data that is not moving
                if (_o.isStationary) {
                    return false;
                }

                // include this object in the nearbyMobs array for this frame
                return true;
            }

            // exclude this object from the nearbyMobs array for this frame
            return false;

        }.bind(this));

        // handle exits
        Object.keys(_state).forEach((_key, _index) => {
            // if the state is false at this point, that means the object..
            // ..was in range last frame, but not in range during this frame
            if (_state[_key] == false) {
                // send exit event
                _evt_on_exit_(_key);
                delete _state[_key];
            }
        });

        return _output;
    }

    __on_mob_spawn__(_mob) {
        this._socket.emit(NETMSG_MOB_SPAWN, {message:JSON.stringify(_mob.spawnData)});
    }

    __on_mob_exit__(_mobId) {
        this._socket.emit(NETMSG_MOB_EXIT, {message:_mobId});
    }

    __on_player_spawn__(_player) {
        this._socket.emit(NETMSG_PLAYER_SPAWN, {message:JSON.stringify(_player.data)});
    }

    __on_player_exit__(_playerName) {
        this._socket.emit(NETMSG_PLAYER_EXIT, {message:_playerName});
    }

    async __on_equip__(_data) {
        // check if equipment already exists
        const _res = await API.equip({
            id: this._data.account.id,
            apiKey: this._data.account.apiKey,
            playerID: this._data.player.id,
            itemID: _data.itemID,
            inventoryLoc: _data.inventoryLoc
        });

        console.log(_res);

        switch (_res.data.statusCode) {
            case 200: this.__send_message_to_nearby_players__(NETMSG_PLAYER_EQUIP_SUCCESS, {playerID:this._data.player.id,itemID:_data.itemID}); break; // success
            case 1401: this._socket.emit(NETMSG_PLAYER_EQUIP_FAILURE, {message:`You cannot equip an item you do not own.`}); break; // Item does not exist in the player's inventory
            case 1402: this._socket.emit(NETMSG_PLAYER_EQUIP_FAILURE, {message:`You cannot equip this item.`}); break; // Item is not equippable
            case 1403: this._socket.emit(NETMSG_PLAYER_EQUIP_FAILURE, {message:`Your current equipment prevents you from using this item.`}); break; // Equipment slot is occupied
            default: this._socket.emit(NETMSG_PLAYER_EQUIP_FAILURE, {message:`Unable to equip this item.`}); break; // internal server error
        }
    }

    async __on_unequip__(_data) {
        const _res = await API.unequip({
            id: this._data.account.id,
            apiKey: this._data.account.apiKey,
            playerID: this._data.player.id,
            itemID: _data.itemID
        });

        switch (_res.statusCode) {
            case 200: this.__send_message_to_nearby_players__(NETMSG_PLAYER_UNEQUIP_SUCCESS, {playerID:this._data.player.id,itemID:_data.itemID}); break; // success
            case 1401: this._socket.emit(NETMSG_PLAYER_UNEQUIP_FAILURE, {message:`You cannot unequip an item that is not equipped.`}); break; // Item does not exist in the player's equipment
            case 1402: this._socket.emit(NETMSG_PLAYER_UNEQUIP_FAILURE, {message:`You can not unequip this item.`}); break; // Item is not equippable
            default: this._socket.emit(NETMSG_PLAYER_UNEQUIP_FAILURE, {message:`Unable to unequip this item.`}); break; // internal server error
        }
    }

    __hook__() {
        // tell server to update this player
        this._socket.on(NETMSG_PLAYER_DATA, function(_player) {
            this._data.player = _player;
            this._game.updatePlayer(this);
        }.bind(this));
        
        this._socket.on(NETMSG_HIT_MOB, function(_mobHitInfo) {
            _mobHitInfo.playerName = this._data.player.name;
            this._game.onPlayerHitMob(this, _mobHitInfo);
            this._socket.emit(NETMSG_PLAYER_HIT_MOB_CONFIRMATION, {
                message: JSON.stringify(_mobHitInfo)
            });
        }.bind(this))

        this._socket.on(NETMSG_INVENTORY_CHANGED, function(_updateInfo) {
            if (!this._data.account) return;
            API.updateInventoryItemSlot({
                id: this._data.account.id,
                apiKey: this._data.account.apiKey,
                playerID: this._data.player.id,
                slotLoc: _updateInfo.slotLoc,
                slotID: _updateInfo.slotID
            });
        }.bind(this));

        this._socket.on(NETMSG_ADD_INVENTORY, function(_item) {
            API.addInventoryItem({
                id: this._data.account.id,
                apiKey: this._data.account.apiKey,
                playerID: this._data.player.id,
                itemID: _item.id,
                lvl: _item.level
            }, _success => {
                this._socket.emit(NETMSG_ADD_INVENTORY_SUCCESS, {message:_success.message});
            }, _failure => {
                this._socket.emit(NETMSG_ADD_INVENTORY_FAILURE, {message:_failure.message});
            });
        }.bind(this));

        this._socket.on(NETMSG_PLAYER_LOOT_MOB, function(_lootInfo) {
            const _mob = this._game.getMob(_lootInfo.mobID);
            if (!_mob) return;
            const _loot = _mob.tryLoot(_lootInfo.itemID);
            if (_loot == -1) return;
            if (_loot == -2) {
                // loot is locked
                this._socket.emit(NETMSG_MOB_LOOT_LOCKED, {message:_lootInfo});
                return;
            }

            API.addInventoryItem({
                id: this._data.account.id,
                apiKey: this._data.account.apiKey,
                playerID: this._data.player.id,
                itemID: _lootInfo.itemID,
                lvl: _loot.def.level
            }, _success => {
                const _mobLootData = {
                    playerID: this._data.player.id,
                    mobID: _lootInfo.mobID,
                    itemID: _loot.def.id
                };
                this._socket.emit(NETMSG_ADD_INVENTORY_SUCCESS, {message:_success.message});
                //this._socket.emit(NETMSG_MOB_LOOTED, {message:JSON.stringify(_mobLootData)});
                this.__send_message_to_nearby_players__(NETMSG_MOB_LOOTED, _mobLootData, false);
            }, _failure => {
                _mob.restoreLoot(_loot.id);
            });

        }.bind(this));

        this._socket.on(NETMSG_PLAYER_EQUIP, this.__on_equip__);
        this._socket.on(NETMSG_PLAYER_UNEQUIP, this.__on_unequip__);
    }

    __send_message_to_nearby_players__(_evt, _msg, _includeThisPlayer) {
        const _nearbyPlayers = this._game.scanNearbyPlayerSockets(this._data.player.pos, 50);
        for (var i in _nearbyPlayers) {
            const _socket = _nearbyPlayers[i];
            _socket.emit(_evt, {
                message: JSON.stringify(_msg)
            });
        }
        if (_includeThisPlayer) {
            this._socket.emit(_evt, {
                message: JSON.stringify(_msg)
            });
        }
    }
    
    get data() { return this._data.player; }
    get sessionId() { return this._data.sessionId; }
    get socket() { return this._socket; }
    get nearbyMobs() { return this._nearbyMobs; }
    get nearbyPlayers() { return this._nearbyPlayers; }
    get isStationary() { return this._stationaryTimer > 2; }
    get dead() { return this._dead; }
    set data(_val) { this._data.player = _val; }
}

module.exports = Player;