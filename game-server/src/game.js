'use strict';
const Player = require('./player.js');
const {GameScene, PathfindingTestScene} = require('./scenes/scenes.js');
const crypto = require('crypto');
const API = require('./util/api.js');
const {filter,findIndex, find, map} = require('lodash');
const {Vector3} = require('./util/vector.js');
const Mob = require('./mobs/mob.js');

const NETMSG_CONNECT = "connection";
const NETMSG_DISCONNECT = "disconnect";
const NETMSG_HANDSHAKE = "HANDSHAKE";
const NETMSG_PLAYER_LEFT = "PLAYER_LEFT";
const NETMSG_PLAYER_JOINED = "PLAYER_JOINED";
const NETMSG_CHAT = "CHAT";
const NETMSG_INSTANCE = "INSTANCE";

class Game
{
    constructor(_io)
    {
        this._io = _io;

        // track deltaTime for updated server systems to share
        this._lastFrameTime= Date.now();
        this._dt = Date.now() - this._lastFrameTime;

        // use a variable to store all players connected to the game
        this._scene = GameScene(this);
        this._players = [];
        this._mobs = this._scene.mobs;

        // use a variable to store all ACTIVE players connected to the game
        this._instance = {
            players: [],
            mobs: this._mobs
        };

        // some functions to help hook the server and players to the socket engine
        this.__hook_server__ = this.__hook_server__.bind(this);
        this.__hook_player__ = this.__hook_player__.bind(this);
        // some util functions
        this.__obj_data_map__ = this.__obj_data_map__.bind(this);
        this.__prune_instance__ = this.__prune_instance__.bind(this);
        // updaters
        this.__update_mobs__ = this.__update_mobs__.bind(this);
        this.__update_players__ = this.__update_players__.bind(this);
        this.__update_shops__ = this.__update_shops__.bind(this);
        this.__emit_tailored_instance__ = this.__emit_tailored_instance__.bind(this);

        this.__hook_server__();
    }

    update() {
        this._dt = Date.now() - this._lastFrameTime;
        this._lastFrameTime= Date.now();

        this._instance.players = this._players;
        this._instance.mobs = this._mobs;

        // update entities
        this.__update_players__();
        this.__update_mobs__();
        this.__update_shops__();

        // emit tailored instance for each player
        this.__emit_tailored_instance__();
    }

    /*
     * Player will notify the game when they need to be updated
     */
    updatePlayer(_player) {
        const _index = findIndex(this._players, _p => {return _p.data.name == _player.data.name});
        if (_index == -1) return;
        this._players[_index] = _player;
    }

    /*
     * Called when a player hits an _mob
     */
    onPlayerHitMob(_player, _mobHitInfo) {
        const _index = findIndex(this._mobs, _m => {return _m.data.id == _mobHitInfo.id});
        if (_index == -1) return;
        this._mobs[_index].hit(_mobHitInfo);
    }

    /*
     * Mobs will constantly scan for nearby players
     * Also used to determine the range where players can see other players
     */
    scanNearbyPlayers(_pos, _radius) {
        return filter(this.__obj_data_map__(this._players), _player => {
            const _dist = new Vector3(_pos).distanceTo(new Vector3(_player.transform.pos));
            return _dist < _radius;
        });
    }

    getPlayer(_name) {
        return find(this.__obj_data_map__(this._players), _player => {
            return _player.name == _name;
        });
    }

    getPlayerRaw(_name) {
        return find(this._players, _player => {
            return _player.data.name == _name;
        });
    }

    /*
     * Mobs will constantly scan for nearby players
     * Also used to determine the range where players can see other players
     */
    scanNearbyPlayerSockets(_pos, _radius) {
        const _nearbyPlayers = filter(this._players, _player => {
            const _dist = new Vector3(_pos).distanceTo(new Vector3(_player.transform.pos));
            return _dist < _radius;
        });
        return map(_nearbyPlayers, _player => {
            return _player.socket
        });
    }

    respawnMob(_mob, _interval) {
        // generate new id
        _mob.id = crypto.randomBytes(4).toString('hex');

        setTimeout(() => {
            this._mobs.push(new Mob(this, _mob));
        },_interval);
    }

    killMob(_id) {
        this._mobs = filter(this._mobs, _m => {return _m.data.id != _id;});
    }

    getMob(_id) {
        return find(this._mobs, _m => {return _m.data.id == _id;});
    }

    getShopTerminal(_id) {
        return find(this._scene.shops, _s => {return _s.id == _id;});
    }

    /*
     * Emits a specific instance of nearby players and nearby mobs for each player..
     * ..based on distance
     */
    __emit_tailored_instance__() {
        for (var i in this._instance.players) {

            // Here, each player is able to send regular updates
            // This minimally includes position and rotation info
            
            const _player = this._instance.players[i];
            
            const _instance = {
                players: map(_player.nearbyPlayers, _p => {return _p.transform}),
                mobs: this.__obj_data_map__(_player.nearbyMobs)
            };

            // Ultimately we need to replace with position and animation updates
            // The NETMSG_INSTANCE data includes ALL player data
            _player.socket.emit(NETMSG_INSTANCE, {
                message: JSON.stringify(_instance)
            });

        }
    }

    __prune_instance__() {
        this._instance.players = filter(this.__obj_data_map__(this._players), _player => {
            const _now = Date.now() / 1000;
            return _now - _player.timestamp < 5; // only emit if player has not updated for 5 seconds
        });
        this._instance.mobs = this.__obj_data_map__(this._mobs)
    }

    __update_mobs__() {
        for (var i = 0; i < this._mobs.length; i++) {
            this._mobs[i].update();
        }
    }

    __update_players__() {
        for (var i = 0; i < this._players.length; i++) {
            this._players[i].update();
        }
    }

    __update_shops__() {
        for (var i = 0; i < this._scene.shops.length; i++) {
            this._scene.shops[i].update();
        }
    }

    __obj_data_map__(_objects) {
        return map(_objects, _obj => _obj.data);
    }

    __hook_player__(_socket) {
        _socket.on(NETMSG_HANDSHAKE, function(_data) {
            const _thisPlayer = new Player(this, _data, _socket);
            this._players.push(_thisPlayer);

            // alert all players except this one that this player joined
            _socket.broadcast.emit(NETMSG_PLAYER_JOINED, {
                message:JSON.stringify(this._players.find(_player => {
                    return _player.data.name == _thisPlayer.data.name
                }).data)
            });

            // provide the instance state to only this player
            const _completeInstance = this._instance;
            _completeInstance.players = this.__obj_data_map__(this._players);
            _completeInstance.mobs = this.__obj_data_map__(this._mobs);
            _socket.emit(NETMSG_HANDSHAKE, {message:JSON.stringify(_completeInstance)});

            // send chat out to everyone on the server
            _socket.on(NETMSG_CHAT, function(_data) {
                this._io.emit(NETMSG_CHAT, {message:_data.message});
            }.bind(this));

            // alert all players except this one that this player left
            _socket.on(NETMSG_DISCONNECT, function() {
                // locate player
                const _player = this._players.find(_p => { return _p.data.name == _thisPlayer.data.name; });
                if (!_player) return;
                
                // emit event to connected clients
                _socket.broadcast.emit(NETMSG_PLAYER_LEFT, {
                    message:JSON.stringify(_player.data)
                });

                // update database with last saved position
                API.savePlayerSessionPos({
                    ID: _player.sessionId,
                    posX: _player.transform.pos.x, posY: _player.transform.pos.y, posZ: _player.transform.pos.z,
                    rotX: _player.transform.rot.x, rotY: _player.transform.rot.y, rotZ: _player.transform.rot.z});

                // remove player from array
                this._players = filter(this._players, _player => {return _player.data.name !== _thisPlayer.data.name});
            }.bind(this));
        }.bind(this));
    }

    __hook_server__() {
        this._io.on(NETMSG_CONNECT, _socket => {
            this.__hook_player__(_socket);
        })
    }

    get deltaTime() {
        return this._dt / 1000.0;
    }

    get scene() {
        return this._scene;
    }

    get shops() {
        return this._scene.shops;
    }

    get mobs() {
        return this._instance.mobs;
    }

    get players() {
        return this._instance.players;
    }
}

module.exports = Game;