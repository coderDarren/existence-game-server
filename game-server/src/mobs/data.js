'use strict';
const {v4} = require('uuid');
const {Vector3} = require('../util/vector.js');
/*
 * This file contains data for all mobs
 * Each mob can be initialized using the _level paramter..
 * ..to help scale skills/attributes of the mob
 */

const dummy = function(_level, _pos, _rot) {
    const _id = v4();
    
    return {
        id: _id,
        name: 'Test Dummy',
        level: _level,
        maxHealth: 100*_level,
        health: 100*_level,
        maxEnergy: 100*_level,
        energy: 100*_level,
        attackSpeed: 1.5,
        aggroRange: 10,
        pos: new Vector3(_pos).obj,
        rot: new Vector3(_rot).obj,
        inCombat: false,
        healDelta: 5,
        // !! TODO
        // Create mob actions initializer
        actions: []
    }
}

module.exports = {
    dummy,
}