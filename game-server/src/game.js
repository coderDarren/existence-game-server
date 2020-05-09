'use strict';
const Player = require('./player.js');
const Mob = require('./mobs/mob.js');
const {
    dummy,
    dummy2
} = require('./mobs/data.js');
const {filter,findIndex, map} = require('lodash');

const NETWORK_MESSAGE_CONNECT = "connection";
const NETWORK_MESSAGE_DISCONNECT = "disconnect";
const NETWORK_MESSAGE_HANDSHAKE = "HANDSHAKE";
const NETWORK_MESSAGE_PLAYER_LEFT = "PLAYER_LEFT";
const NETWORK_MESSAGE_PLAYER_JOINED = "PLAYER_JOINED";
const NETWORK_MESSAGE_CHAT = "CHAT";
const NETWORK_MESSAGE_INSTANCE = "INSTANCE";

class Game
{
    constructor(_io)
    {
        this._io = _io;

        // track deltaTime for updated server systems to share
        this._lastFrameTime= Date.now();
        this._dt = Date.now() - this._lastFrameTime;

        // use a variable to store all players connected to the game
        this._players = [];
        this._mobs = [
            new Mob(this, dummy(10)),
            new Mob(this, dummy2(10))
        ]

        // use a variable to store all ACTIVE players connected to the game
        this._instance = {
            players: [],
            mobs: []
        };

        // some functions to help hook the server and players to the socket engine
        this.__hook_server__ = this.__hook_server__.bind(this);
        this.__hook_player__ = this.__hook_player__.bind(this);
        // some util functions
        this.__obj_data_map__ = this.__obj_data_map__.bind(this);
        this.__prune_instance__ = this.__prune_instance__.bind(this);
        // updaters
        this.__update_mobs__ = this.__update_mobs__.bind(this);

        this.__hook_server__();
    }

    update() {
        this._dt = Date.now() - this._lastFrameTime;
        this._lastFrameTime= Date.now();

        // update mobs
        this.__update_mobs__();

        // break down instance into pure data
        this.__prune_instance__();

        // emit instance
        this._io.emit(NETWORK_MESSAGE_INSTANCE, {
            message:JSON.stringify(this._instance)
        });
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
     * Called when a mob hits a player
     */
    onMobHitPlayer(_mob, _player, _dmg) {

    }

    /*
     * Mobs will constantly scan for nearby players
     * Also used to determine the range where players can see other players
     */
    scanNearbyPlayers(_pos, _radius) {

    }

    /*
     * Used to determine the range when players should see mobs
     */
    scanNearbyMobs(_pos, _radius) {

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

    __obj_data_map__(_objects) {
        return map(_objects, _obj => _obj.data);
    }

    __hook_player__(_socket) {
        _socket.on(NETWORK_MESSAGE_HANDSHAKE, function(_data) {
            const _thisPlayer = new Player(this, _data, _socket);
            this._players.push(_thisPlayer);

            // alert all players except this one that this player joined
            _socket.broadcast.emit(NETWORK_MESSAGE_PLAYER_JOINED, {
                message:JSON.stringify(this._players.find(_player => {
                    return _player.data.name == _thisPlayer.data.name
                }).data)
            });

            // provide the instance state to only this player
            const _completeInstance = this._instance;
            _completeInstance.players = this.__obj_data_map__(this._players);
            _completeInstance.mobs = this.__obj_data_map__(this._mobs);
            _socket.emit(NETWORK_MESSAGE_HANDSHAKE, {message:JSON.stringify(_completeInstance)});

            // send chat out to everyone on the server
            _socket.on(NETWORK_MESSAGE_CHAT, function(_data) {
                this._io.emit(NETWORK_MESSAGE_CHAT, {message:_data.message});
            }.bind(this));

            // alert all players except this one that this player left
            _socket.on(NETWORK_MESSAGE_DISCONNECT, function() {
                _socket.broadcast.emit(NETWORK_MESSAGE_PLAYER_LEFT, {
                    message:JSON.stringify(this._players.find(_player => {
                        return _player.data.name == _thisPlayer.data.name
                    }).data)
                });
                this._players = filter(this._players, _player => {return _player.data.name !== _thisPlayer.data.name});
            }.bind(this));
        }.bind(this));
    }

    __hook_server__() {
        this._io.on(NETWORK_MESSAGE_CONNECT, _socket => {
            this.__hook_player__(_socket);
        })
    }

    get deltaTime() {
        return this._dt;
    }
}

module.exports = Game;