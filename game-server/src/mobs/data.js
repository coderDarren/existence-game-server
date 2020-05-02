'use strict';
/*
 * This file contains data for all mobs
 * Each mob can be initialized using the _level paramter..
 * ..to help scale skills/attributes of the mob
 */

const dummy = function(_level) {
    return {
        name: 'Dummy',
        level: _level,
        health: 100*_level,
        energy: 100*_level,
        attackSpeed: 1.5,
        aggroRange: 10,
        pos: {x:385,y:37.885,z:-148},
        rot: {x:0,y:0,z:0},
        inCombat: false,
        // !! TODO
        // Create mob actions initializer
        actions: []
    }
}

module.exports = {
    dummy
}