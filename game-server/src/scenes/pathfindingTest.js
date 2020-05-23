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
            new Mob(_game, dummy(10, {x:179.2,y:32.31,z:184.7}, {x:0,y:0,z:0})),
            new Mob(_game, dummy(10, {x:178.2,y:32.31,z:184.7}, {x:0,y:0,z:0})),
            new Mob(_game, dummy(10, {x:177.2,y:32.31,z:184.7}, {x:0,y:0,z:0})),
            new Mob(_game, dummy(10, {x:176.2,y:32.31,z:184.7}, {x:0,y:0,z:0})),
            new Mob(_game, dummy(10, {x:175.2,y:32.31,z:184.7}, {x:0,y:0,z:0})),
        ]
    );
};