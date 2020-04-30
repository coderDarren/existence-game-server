'use strict';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io').listen(server);
const PORT = process.env.PORT || 8081;
const Game = require('./src/game.js')

const emissionMs = 150;

server.listen(PORT, async () => {

    const game = new Game(io);

    // update clients every 150ms
    setInterval(()=>{
        game.update();
    }, emissionMs);
})