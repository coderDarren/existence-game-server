const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io').listen(server);
const PORT = process.env.PORT || 8081;

const GameServer = require('./src/game-server.js')
const Builder = require('./src/util/builder.js');

const startServer = async function() {
    console.log('initializing server');
    await Builder.initializeServer();
    console.log('successfully initialized server');

    server.listen(PORT, () => {
        const _game = new GameServer(io, Builder.tableNames);
    });
}

startServer();