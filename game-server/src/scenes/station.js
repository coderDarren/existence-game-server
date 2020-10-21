'use strict';
const {Scene} = require('./scene.js');
const {ItemType} = require('../definitions/enum.js');
const Mob = require('../mobs/mob.js');

// This scene uses shop terminals
const ShopTerminal = require('../shops/shopTerminal.js');

// Import the mob data objects that will live in this scene
const {
    droid
} = require('../mobs/data.js');

const waypointGraph = {"waypoints":[]}

module.exports = (_game) => {
    return new Scene(
        // mobs
        // First parameter is the game object
        // Second parameter is the mob object, with param list (level, pos, rot)
        // Check the mob data for more control params ../mobs/data.js
        [
            new Mob(_game, droid(100, {x:-66,y:-0.9292164,z:30.81234}, {x:0,y:0,z:0})),
        ],
        // The waypoint graph is empty, see above declaration. Waypoint graphs are temporarily deprecated
        waypointGraph,
        // shops
        // Shop parameters
        //  id - must match the id in the ShopTerminal component on the client
        //  pos - verifies the player is close enough to the shop on the server side
        //  refreshRate - how often, in seconds, do shops recycle contents
        //  shopType - will pull all shop buyable flagged items of the selected item type
        //  lvlRange - potential item levels that will spawn every refreshRate
        [
            new ShopTerminal(_game, {id:0,pos:{x:-43.579,y:-0.9292164,z:17.134},refreshRate:3600,shopType:ItemType.WEAPON,lvlRange:{min:1,max:20}}),
            new ShopTerminal(_game, {id:1,pos:{x:-59.478,y:-0.9292164,z:1.235},refreshRate:3600,shopType:ItemType.ARMOR,lvlRange:{min:1,max:20}}),
        ]
    );
};