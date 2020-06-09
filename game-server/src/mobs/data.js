'use strict';
const crypto = require('crypto');
const {Vector3} = require('../util/vector.js');
/*
 * This file contains data for all mobs
 * Each mob can be initialized using the _level paramter..
 * ..to help scale skills/attributes of the mob
 */

const dummy = function(_level, _pos, _rot) {
    const _id = crypto.randomBytes(4).toString('hex');
    
    return {
        id: _id,
        name: 'A-0 Zix',
        level: _level,
        maxHealth: 100*_level,
        health: 100*_level,
        maxEnergy: 100*_level,
        energy: 100*_level,
        attackSpeed: 1,
        rechargeSpeed: 1.5,
        aggroRange: 10,
        retreatRange: 30,
        attackRange: 2,
        inCombat: false,
        inAttackRange: false,
        respawnTime: 10, // in seconds
        xpReward: 50*_level,
        xpRewardVariance: 10*_level,
        pos: new Vector3(_pos).obj,
        rot: new Vector3(_rot).obj,
        inCombat: false,
        healDelta: 5,
        runSpeed: 3,
        lootTime: 120, // 2 minutes
        // !! TODO
        // Create mob actions initializer
        actions: []
    }
}

module.exports = {
    dummy,
}