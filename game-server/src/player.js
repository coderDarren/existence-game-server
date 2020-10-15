'use strict';
const API = require('./util/api.js');
const P2PTrade = require('./trade/p2pTrade.js');
const {Vector3, LowPrecisionSimpleVector3} = require('./util/vector.js');
const {filter} = require('lodash');
const {accumulate} = require('./util/func.js');

const NETMSG_CHAT = "CHAT";
const NETMSG_PLAYER_TRANSFORM_CHANGE = "PLAYER_TRANSFORM_CHANGE";
const NETMSG_PLAYER_HEALTH_CHANGE = "PLAYER_HEALTH_CHANGE";
const NETMSG_PLAYER_LVL_CHANGE = "PLAYER_LVL_CHANGE";
const NETMSG_HIT_MOB = "HIT_MOB";
const NETMSG_INVENTORY_CHANGED = "INVENTORY_CHANGE";
const NETMSG_ADD_INVENTORY = "ADD_INVENTORY";
const NETMSG_ADD_INVENTORY_SUCCESS = "ADD_INVENTORY_SUCCESS";
const NETMSG_ADD_INVENTORY_FAILURE = "ADD_INVENTORY_FAILURE";
const NETMSG_RM_INVENTORY_SUCCESS = "RM_INVENTORY_SUCCESS";
const NETMSG_RM_INVENTORY_FAILURE = "RM_INVENTORY_FAILURE";
const NETMSG_MOB_SPAWN = "MOB_SPAWN";
const NETMSG_MOB_EXIT = "MOB_EXIT";
const NETMSG_PLAYER_SPAWN = "PLAYER_SPAWN";
const NETMSG_PLAYER_EXIT = "PLAYER_EXIT";
const NETMSG_PLAYER_HIT_MOB_CONFIRMATION = "PLAYER_HIT_MOB_CONFIRMATION";
const NETMSG_PLAYER_LOOT_MOB = "PLAYER_LOOT_MOB";
const NETMSG_MOB_HIT_PLAYER = "MOB_HIT_PLAYER";
const NETMSG_MOB_LOOTED = "MOB_LOOTED";
const NETMSG_MOB_LOOT_LOCKED = "PLAYER_MOB_LOOT_LOCKED";
const NETMSG_PLAYER_LOCK_LOOT = "PLAYER_LOCK_LOOT";
const NETMSG_PLAYER_EQUIP = "PLAYER_EQUIP";
const NETMSG_PLAYER_UNEQUIP = "PLAYER_UNEQUIP";
const NETMSG_PLAYER_EQUIP_SUCCESS = "PLAYER_EQUIP_SUCCESS";
const NETMSG_PLAYER_EQUIP_FAILURE = "PLAYER_EQUIP_FAILURE";
const NETMSG_PLAYER_UNEQUIP_SUCCESS = "PLAYER_UNEQUIP_SUCCESS";
const NETMSG_PLAYER_UNEQUIP_FAILURE = "PLAYER_UNEQUIP_FAILURE";
const NETMSG_INTERACT_SHOP = 'NETMSG_INTERACT_SHOP';
const NETMSG_INTERACT_SHOP_SUCCESS = 'NETMSG_INTERACT_SHOP_SUCCESS';
const NETMSG_TRADE_SHOP = 'NETMSG_TRADE_SHOP';
const NETMSG_TRADE_SHOP_SUCCESS = 'NETMSG_TRADE_SHOP_SUCCESS';
const NETMSG_PLAYER_ANIM_FLOAT = 'NETMSG_PLAYER_ANIM_FLOAT';
const NETMSG_PLAYER_ANIM_BOOL = 'NETMSG_PLAYER_ANIM_BOOL';
const NETMSG_REQUEST_P2P_TRADE = 'REQUEST_P2P_TRADE';
const NETMSG_REJECT_P2P_TRADE = 'REJECT_P2P_TRADE';

class Player {
    
    constructor(_game, _data, _socket) {
        _data = {
            ..._data.player,
            ..._data
        }
        delete _data.player;
        this._game = _game;
        this._data = _data;
        this._socket = _socket;
        this._nearbyMobs = [];
        this._nearbyMobsState = {};
        this._nearbyPlayers = [];
        this._nearbyPlayersState = {};
        this._dead = false;

        // these values help us determine if the player is stationary or not
        this._lastFramePos = this._data.transform.pos;
        this._lastFrameRot = this._data.transform.rot;
        this._posChange = 0;
        this._rotChange = 0;
        this._stationaryTimer = 0;

        // incoming events from player
        this.__on_transform_updated__ = this.__on_transform_updated__.bind(this);
        this.__on_health_change__ = this.__on_health_change__.bind(this);
        this.__on_player_hit_mob__ = this.__on_player_hit_mob__.bind(this);
        this.__on_inventory_change__ = this.__on_inventory_change__.bind(this);
        this.__on_player_loot_mob__ = this.__on_player_loot_mob__.bind(this);
        this.__on_equip__ = this.__on_equip__.bind(this);
        this.__on_unequip__ = this.__on_unequip__.bind(this);
        this.__on_interact_shop__ = this.__on_interact_shop__.bind(this);
        this.__on_trade_shop__ = this.__on_trade_shop__.bind(this);
        this.__add_inventory__ = this.__add_inventory__.bind(this);
        this.__on_animation_float__ = this.__on_animation_float__.bind(this);
        this.__on_animation_bool__ = this.__on_animation_bool__.bind(this);
        this.__on_p2p_trade_request__ = this.__on_p2p_trade_request__.bind(this);
        this.__hook__ = this.__hook__.bind(this);

        // player emit events
        this.__on_mob_spawn__ = this.__on_mob_spawn__.bind(this);
        this.__on_mob_exit__ = this.__on_mob_exit__.bind(this);
        this.__on_player_spawn__ = this.__on_player_spawn__.bind(this);
        this.__on_player_exit__ = this.__on_player_exit__.bind(this);

        // nearby entity processing
        this.__handle_nearby_objects__ = this.__handle_nearby_objects__.bind(this);
        this.__detect_stationary__ = this.__detect_stationary__.bind(this);
        this.__send_message_to_nearby_players__ = this.__send_message_to_nearby_players__.bind(this);

        // player updates 
        this.__remove_inventory__ = this.__remove_inventory__.bind(this);
        this.__update_player__ = this.__update_player__.bind(this);

        this.__hook__();
    }

    __hook__() {
        this._socket.on(NETMSG_PLAYER_TRANSFORM_CHANGE, this.__on_transform_updated__);
        this._socket.on(NETMSG_HIT_MOB, this.__on_player_hit_mob__)
        this._socket.on(NETMSG_INVENTORY_CHANGED, this.__on_inventory_change__);
        this._socket.on(NETMSG_ADD_INVENTORY, this.__add_inventory__);
        this._socket.on(NETMSG_PLAYER_LOOT_MOB, this.__on_player_loot_mob__);
        this._socket.on(NETMSG_PLAYER_EQUIP, this.__on_equip__);
        this._socket.on(NETMSG_PLAYER_UNEQUIP, this.__on_unequip__);
        this._socket.on(NETMSG_INTERACT_SHOP, this.__on_interact_shop__);
        this._socket.on(NETMSG_TRADE_SHOP, this.__on_trade_shop__);
        this._socket.on(NETMSG_PLAYER_ANIM_FLOAT, this.__on_animation_float__);
        this._socket.on(NETMSG_PLAYER_ANIM_BOOL, this.__on_animation_bool__);
        this._socket.on(NETMSG_PLAYER_HEALTH_CHANGE, this.__on_health_change__);
        this._socket.on(NETMSG_REQUEST_P2P_TRADE, this.__on_p2p_trade_request__);
    }

    update() {
        this.__detect_stationary__();
        this._nearbyMobs = this.__handle_nearby_objects__(this._nearbyMobs, this._nearbyMobsState, this._game.mobs, 'id', 50, this.__on_mob_spawn__, this.__on_mob_exit__);
        this._nearbyPlayers = this.__handle_nearby_objects__(this._nearbyPlayers, this._nearbyPlayersState, this._game.players, 'name', 50, this.__on_player_spawn__, this.__on_player_exit__);
    }

    /*
     * Called by mob when player gets hit
     */
    takeHit(_hitInfo) {
        this._data.health.health -= _hitInfo.dmg;
        if (this._data.health.health < 0) {
            this._data.health.health = 0;
        }

        _hitInfo.health = this._data.health.health;

        this._socket.emit(NETMSG_MOB_HIT_PLAYER, {message:JSON.stringify(_hitInfo)});
        
        this.__send_message_to_nearby_players__(NETMSG_PLAYER_HEALTH_CHANGE, {
            id: this._data.name,
            health: this._data.health.health,
            maxHealth: this._data.health.maxHealth
        });
    }

    __detect_stationary__() {
        this._posChange = new Vector3(this._data.transform.pos).distanceTo(new Vector3(this._lastFramePos));
        this._rotChange = new Vector3(this._data.transform.rot).distanceTo(new Vector3(this._lastFrameRot));
        this._lastFramePos = this._data.transform.pos;
        this._lastFrameRot = this._data.transform.rot;
        if (this._posChange == 0 && this._rotChange == 0) {
            this._stationaryTimer += this._game.deltaTime;
        } else {
            this._stationaryTimer = 0;
        }
    }

    /*
     * This functions returns a mapped list of entities closest to the player
     * The returned array is used to determine which entities need to be notified about this player's state.
     * See the update function above.
     */
    __handle_nearby_objects__(_output, _state, _objects, id, _range, _evt_on_spawn_, _evt_on_exit_) {
        // clear the state
        Object.keys(_state).forEach((_key, _index) => {
            _state[_key] = false;
        });

        // update the state
        const _playerPos = new Vector3(this._data.transform.pos);
        _output = filter(_objects, function(_o) {
            // do not send player data back to himself
            if (_o.data.id == this._data.id) {
                //console.log(this._data.id)
                return false;
            }

            const _pos = new Vector3(_o.data.transform.pos);
            
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

    __add_inventory__(_data) {
        API.addInventoryItem({
            id: this._data.account.id,
            apiKey: this._data.account.apiKey,
            playerID: this._data.id,
            itemID: _data.id,
            lvl: _data.level
        }, _success => {
            this._socket.emit(NETMSG_ADD_INVENTORY_SUCCESS, {message:_success.message});
        }, _failure => {
            this._socket.emit(NETMSG_ADD_INVENTORY_FAILURE, {message:_failure.message});
        });
    }

    async __remove_inventory__(_data) {
        const _res = await API.removeInventory({
            auth: {
                id: this._data.account.id,
                apiKey: this._data.account.apiKey,
                playerID: this._data.id
            },
            elementKey: {
                playerID: this._data.id,
                itemID: _data.itemID,
                loc: _data.loc
            }
        });
        if (_res.statusCode == 200) {
            // succeed
            this._socket.emit(NETMSG_RM_INVENTORY_SUCCESS, {message:JSON.stringify({itemID: _data.itemID, inventoryLoc: _data.loc})});
        } else {
            // fail
            this._socket.emit(NETMSG_RM_INVENTORY_FAILURE, {message:JSON.stringify({itemID: _data.itemID, inventoryLoc: _data.loc})});
        }
    }

    async __on_equip__(_data) {
        // check if equipment already exists
        const _res = await API.equip({
            id: this._data.account.id,
            apiKey: this._data.account.apiKey,
            playerID: this._data.id,
            itemID: _data.itemID,
            inventoryLoc: _data.inventoryLoc
        });

        switch (_res.data.statusCode) {
            case 200: this.__send_message_to_nearby_players__(NETMSG_PLAYER_EQUIP_SUCCESS, {playerName:this._data.name, playerID:this._data.id,itemID:_data.itemID, inventoryLoc: _data.inventoryLoc}); break; // success
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
            playerID: this._data.id,
            itemID: _data.itemID
        });

        switch (_res.statusCode) {
            case 200: 
                const _msg = JSON.parse(_res.data.message);
                this.__send_message_to_nearby_players__(NETMSG_PLAYER_UNEQUIP_SUCCESS, {playerName:this._data.name, playerID:this._data.id,itemID:_data.itemID, inventorySlot: _msg.id}); 
                break; // success
            case 1401: this._socket.emit(NETMSG_PLAYER_UNEQUIP_FAILURE, {message:`You cannot unequip an item that is not equipped.`}); break; // Item does not exist in the player's equipment
            case 1402: this._socket.emit(NETMSG_PLAYER_UNEQUIP_FAILURE, {message:`You can not unequip this item.`}); break; // Item is not equippable
            default: this._socket.emit(NETMSG_PLAYER_UNEQUIP_FAILURE, {message:`Unable to unequip this item.`}); break; // internal server error
        }
    }

    async __update_player__(_element, _strictKeys=null) {
        const _res = await API.updatePlayer({
            auth: {
                id: this._data.account.id,
                apiKey: this._data.account.apiKey,
                playerID: this._data.id
            },
            elementKey: {
                name: this._data.name
            }, 
            element: _element,
            strictKeys: _strictKeys
        });
        if (_res.statusCode == 200) {
            const _data = JSON.parse(_res.data.message);
            return _data;
        }
        return null;
    }

    __on_interact_shop__(_data) {
        const _shopId = _data.id;
        const _shop = this._game.getShopTerminal(_shopId);
        // compare distances
        const _dist = new Vector3(_shop.pos).distanceTo(new Vector3(this._data.transform.pos));
        if (_dist > 3) {
            this._socket.emit(NETMSG_CHAT, {message:'<color=#fff>You are out of range.</color>'});
        } else {
            // send shop population
            this._socket.emit(NETMSG_INTERACT_SHOP_SUCCESS, {message:JSON.stringify({id:_shopId,itemData:_shop.population})});
        }
    }

    async __on_trade_shop__(_data) {
        console.log(`trading ${JSON.stringify(_data)}`);
        
        const _netTransfer = accumulate(_data.sell, 'price') - accumulate(_data.buy, 'price');
        console.log(`Player has ${this._data.tix} TIX, and the net transfer of this trade is ${_netTransfer} TIX.`);

        if (this._data.tix + _netTransfer < 0) {
            this._socket.emit(NETMSG_CHAT, {message:'<color=#fff>You do not have enough TIX.</color>'});
            return;
        }
        
        // add bought inventory
        for (var i in _data.buy) {
            this.__add_inventory__({id: _data.buy[i].itemID, level: _data.buy[i].level});
        }

        // remove sold inventory
        for (var i in _data.sell) {
            this.__remove_inventory__({itemID: _data.sell[i].itemID, loc: _data.sell[i].inventoryLoc});
        }

        const _tixUpdate = await this.__update_player__({tix: this._data.tix + _netTransfer}, 'tix');
        if (_tixUpdate != null) {
            this._data.tix = _tixUpdate.tix;
        }

        this._socket.emit(NETMSG_TRADE_SHOP_SUCCESS, {message:JSON.stringify({tix:this._data.tix,transactionId:_data.transactionId})});
    }

    __on_transform_updated__(_transform) {
        this._data.transform = _transform;
        this._game.updatePlayer(this);
    }

    __on_animation_float__(_data) {
        this._data.anim[_data.anim] = _data;
        this.__send_message_to_nearby_players__(NETMSG_PLAYER_ANIM_FLOAT, _data, false);
    }

    __on_animation_bool__(_data) {
        this._data.anim[_data.anim] = _data;
        this.__send_message_to_nearby_players__(NETMSG_PLAYER_ANIM_BOOL, _data, false);
    }

    __on_player_hit_mob__(_mobHitInfo) {
        _mobHitInfo.playerName = this._data.name;
        this._game.onPlayerHitMob(this, _mobHitInfo);
        this._socket.emit(NETMSG_PLAYER_HIT_MOB_CONFIRMATION, {
            message: JSON.stringify(_mobHitInfo)
        });
    }

    __on_health_change__(_health) {
        _health.id = this._data.name;
        this._data.health = _health;
        this.__send_message_to_nearby_players__(NETMSG_PLAYER_HEALTH_CHANGE, _health)
    }

    __on_inventory_change__(_inventory) {
        if (!this._data.account) return;
        API.updateInventoryItemSlot({
            id: this._data.account.id,
            apiKey: this._data.account.apiKey,
            playerID: this._data.id,
            slotLoc: _inventory.slotLoc,
            slotID: _inventory.slotID
        });
    }

    __on_player_loot_mob__(_lootInfo) {
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
            playerID: this._data.id,
            itemID: _lootInfo.itemID,
            lvl: _loot.def.level
        }, _success => {
            const _mobLootData = {
                playerID: this._data.id,
                mobID: _lootInfo.mobID,
                itemID: _loot.def.id
            };
            this._socket.emit(NETMSG_ADD_INVENTORY_SUCCESS, {message:_success.message});
            //this._socket.emit(NETMSG_MOB_LOOTED, {message:JSON.stringify(_mobLootData)});
            this.__send_message_to_nearby_players__(NETMSG_MOB_LOOTED, _mobLootData, false);
        }, _failure => {
            _mob.restoreLoot(_loot.id);
        });
    }

    __on_p2p_trade_request__(_data) {
        const _player = this._game.getPlayerRaw(_data.message);
        if (!_player) return; // could not find player, no-op

        // !! TODO Check distances between players
        // !! TODO Make sure players are not busy with other jobs

        // build trade object, which stages emitters and listeners for both players
        // the trade object will be disposed if trade is rejected
        this._p2pTrade = new P2PTrade(this, _player);
        // emit message to player, asking them to trade
        _player.socket.emit(NETMSG_REQUEST_P2P_TRADE, {message: this._data.name});
    }

    __send_message_to_nearby_players__(_evt, _msg, _includeThisPlayer) {
        const _nearbyPlayers = this._game.scanNearbyPlayerSockets(this._data.transform.pos, 50);
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
    
    addInventory(_item) {
        this.__add_inventory__({id: _item.def.id, level: _item.def.level});
    }

    rmInventory(_item) {
        console.log(`Removing item ${JSON.stringify({itemID: _item.def.id, loc: _item.def.slotLoc})}`)
        this.__remove_inventory__({itemID: _item.def.id, loc: _item.def.slotLoc});
    }
    
    get data() { return this._data; }
    get transform() { return this._data.transform; }
    get sessionId() { return this._data.sessionId; }
    get socket() { return this._socket; }
    get nearbyMobs() { return this._nearbyMobs; }
    get nearbyPlayers() { return this._nearbyPlayers; }
    get isStationary() { return this._stationaryTimer > 2; }
    get dead() { return this._dead; }
}

module.exports = Player;