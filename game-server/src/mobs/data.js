'use strict';
const crypto = require('crypto');
const {Vector3} = require('../util/vector.js');
/*
 * This file contains data for all mobs
 * Each mob can be initialized using the _level paramter..
 * ..to help scale skills/attributes of the mob
 */

const a0zix = function(_level, _pos, _rot) {
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
        aggroRange: 15,
        retreatRange: 50,
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
        minDamage: 1,
        maxDamage: 5,
        // !! TODO
        // Create mob actions initializer
        actions: []
    }
}

const enragedA0Zix = function(_level, _pos, _rot) {
    const _id = crypto.randomBytes(4).toString('hex');
    
    return {
        id: _id,
        name: 'Enraged A-0 Zix',
        level: _level,
        maxHealth: 100*_level,
        health: 100*_level,
        maxEnergy: 100*_level,
        energy: 100*_level,
        attackSpeed: 1,
        rechargeSpeed: 1.5,
        aggroRange: 5,
        retreatRange: 30,
        attackRange: 2,
        inCombat: false,
        inAttackRange: false,
        respawnTime: 10, // in seconds
        xpReward: 150*_level,
        xpRewardVariance: 10*_level,
        pos: new Vector3(_pos).obj,
        rot: new Vector3(_rot).obj,
        inCombat: false,
        healDelta: 5,
        runSpeed: 5,
        lootTime: 120, // 2 minutes
        minDamage: 10,
        maxDamage: 15,
        // !! TODO
        // Create mob actions initializer
        actions: []
    }
}

module.exports = {
    a0zix,
    enragedA0Zix
}