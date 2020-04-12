const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io').listen(server);
const PORT = process.env.PORT || 8081;

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

const players = {};
server.listen(PORT, () => {
    io.on('connection', _socket => {
        console.log(`players ${JSON.stringify(players)}`);
        _socket.on('handshake', function(_data) {
            console.log('inspecting handshake');
            const _playerName = _data.message.split(":")[0];
            players[_playerName] = `${_playerName}:0:0:0`;

            _socket.broadcast.emit('playerJoined', {
                message:`<color=#0f0>${_playerName} joined.</color>`,
                player:JSON.stringify(players[_playerName])
            });
            _socket.emit('handshake', {message:`<color=#0f0>Welcome to the server.</color>`});
            _socket.emit('players', {message:JSON.stringify(players)})

            _socket.on('chat', (_data) => {
                io.emit('chat', _data);
            });
            _socket.on('position', (_data) => {
                const _info = _data.message.split(':');
                players[_info[0]] = `${_playerName}:${_info[1]}:${_info[2]}:${_info[3]}`;
                _socket.broadcast.emit('position', {message:players[_info[0]]});
                console.log(`${_info[0]} is updating position ${_info[1]},${_info[2]},${_info[3]}`);
            });

            _socket.on('disconnect', () => {
                _socket.broadcast.emit('playerLeft', {message:`<color=#f00>${_playerName} left.</color>`,player:_playerName});
                delete players[_playerName];
            });
        }.bind(this));
    })
})