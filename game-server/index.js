const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io').listen(server);
const PORT = process.env.PORT || 8081;
const {filter,findIndex} = require('lodash');
const GameServer = require('./src/game-server.js')
const Builder = require('./src/util/builder.js');

/*
const startServer = async function() {
    console.log('initializing server');
    await Builder.initializeServer();
    console.log('successfully initialized server');

    server.listen(PORT, () => {
        const _game = new GameServer(io, Builder.tableNames);
    });
}

startServer();*/

const NETWORK_MESSAGE_CONNECT = "connection";
const NETWORK_MESSAGE_DISCONNECT = "disconnect";
const NETWORK_MESSAGE_HANDSHAKE = "HANDSHAKE";
const NETWORK_MESSAGE_PLAYER_DATA = "PLAYER";
const NETWORK_MESSAGE_PLAYER_LEFT = "PLAYER_LEFT";
const NETWORK_MESSAGE_PLAYER_JOINED = "PLAYER_JOINED";
const NETWORK_MESSAGE_CHAT = "CHAT";
const NETWORK_MESSAGE_INSTANCE = "INSTANCE";

/*
Player Model
{
    name: "",
    pos: { x:0,y:0,z:0 },
    rot: { x:0,y:0,z:0 },
    health: 0,
    energy: 0,
    timestamp: 123456789 (utc)
}
*/

/*
Instance Model
{
    zoneId: "",
    instanceId: "",
    players: {
        player1: {...player1},
        player2: {...player2}
    }
}
*/
var instance = {
    zoneId: "Startup Zone",
    instanceId: "1",
    players: [] // these represent only active players
}

var players = []  // these represent all players

server.listen(PORT, () => {

    setInterval(()=>{
        if (players.length == 0) return;
        //console.log(JSON.stringify(instance));
        //console.log();
        instance.players = filter(players, _player => {
            const _now = Date.now() / 1000;
            return _now - _player.timestamp < 2; // only emit if player has not updated for 2 seconds
        });

        io.emit(NETWORK_MESSAGE_INSTANCE, {
            message:JSON.stringify(instance)
        });
    }, 150);

    io.on(NETWORK_MESSAGE_CONNECT, _socket => {
        _socket.on(NETWORK_MESSAGE_HANDSHAKE, function(_data) {
            const _playerName = _data.message;
            players.push({
                name: _playerName,
                input: {running:0,strafing:0},
                pos:{x:0,y:0,z:0},
                rot:{x:0,y:0,z:0},
                health:0,
                energy:0
            });

            _socket.broadcast.emit(NETWORK_MESSAGE_PLAYER_JOINED, {
                message:JSON.stringify(players.find(_player => {
                    return _player.name == _playerName
                }))
            });
            _socket.emit(NETWORK_MESSAGE_HANDSHAKE, {message:JSON.stringify(instance)});

            _socket.on(NETWORK_MESSAGE_CHAT, function(_data) {
                //console.log(`chat: ${JSON.stringify(_data)}`);
                io.emit(NETWORK_MESSAGE_CHAT, {message:_data.message});
            });

            _socket.on(NETWORK_MESSAGE_PLAYER_DATA, (_player) => {
                //console.log(`incoming player data ${JSON.stringify(_player)}`)
                const _index = findIndex(players, _player => {return _player.name == _playerName});
                players[_index] = _player;
                //console.log(`${_player.name} is updating position ${_player.pos.x},${_player.pos.y},${_player.pos.z}`);
            });

            _socket.on(NETWORK_MESSAGE_DISCONNECT, () => {
                _socket.broadcast.emit(NETWORK_MESSAGE_PLAYER_LEFT, {
                    message:JSON.stringify(players.find(_player => {
                        return _player.name == _playerName
                    }))
                });
                players = filter(players, _player => {return _player.name !== _playerName});
            });
        }.bind(this));
    })
})