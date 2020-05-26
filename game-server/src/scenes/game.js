'use strict';
const {Scene} = require('./scene.js');
const Mob = require('../mobs/mob.js');
const {
    dummy,
} = require('../mobs/data.js');

module.exports = (_game) => {
    return new Scene(
        //mobs
        [
            new Mob(_game, dummy(10, {x:184.5,y:35.4,z:179.36}, {x:0,y:0,z:0})),
            new Mob(_game, dummy(10, {x:178.8,y:35.4,z:176}, {x:0,y:0,z:0}))
        ],
        null
    );
};