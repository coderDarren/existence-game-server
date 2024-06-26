'use strict';
const crypto = require('crypto');
const {Vector3} = require('../util/vector.js');
/*
 * This file contains data for all mobs
 * Each mob can be initialized using the _level paramter..
 * ..to help scale skills/attributes of the mob
 */

const a0zix = function(_level, _pos, _rot) {
    const _id = crypto.randomBytes(5).toString('hex');
    _rot.y = Math.random() * 360;
    
    return {
        id: _id,
        name: 'A-0 Zix',
        level: _level,
        maxHealth: 5*_level,
        health: 5*_level,
        maxEnergy: 5*_level,
        energy: 5*_level,
        attackSpeed: 1,
        rechargeSpeed: 1.5,
        aggroRange: 15,
        retreatRange: 50,
        attackRange: 2,
        inCombat: false,
        inAttackRange: false,
        respawnTime: 120, // in seconds
        xpReward: 25*_level,
        xpRewardVariance: 10*_level,
        transform: {
            pos: new Vector3(_pos).obj,
            rot: new Vector3(_rot).obj
        },
        inCombat: false,
        healDelta: 50,
        runSpeed: 3,
        lootTime: 120, // 2 minutes
        minDamage: 1*_level,
        maxDamage: 3*_level,
        hitRate: 0.75,
        // !! TODO
        // Create mob actions initializer
        actions: []
    }
}

const gastarias = function(_level, _pos, _rot) {
    const _id = crypto.randomBytes(5).toString('hex');
    _rot.y = Math.random() * 360;
    
    return {
        id: _id,
        name: 'Gastarias',
        level: _level,
        maxHealth: 5*_level,
        health: 5*_level,
        maxEnergy: 5*_level,
        energy: 5*_level,
        attackSpeed: 1,
        rechargeSpeed: 1.5,
        aggroRange: 5,
        retreatRange: 50,
        attackRange: 2,
        inCombat: false,
        inAttackRange: false,
        respawnTime: 10, // in seconds
        xpReward: 25*_level,
        xpRewardVariance: 10*_level,
        transform: {
            pos: new Vector3(_pos).obj,
            rot: new Vector3(_rot).obj
        },
        inCombat: false,
        healDelta: 50,
        runSpeed: 3,
        lootTime: 120, // 2 minutes
        minDamage: 1*_level,
        maxDamage: 3*_level,
        hitRate: 0.75,
        // !! TODO
        // Create mob actions initializer
        actions: []
    }
}

const gastarid = function(_level, _pos, _rot) {
    const _id = crypto.randomBytes(5).toString('hex');
    _rot.y = Math.random() * 360;
    
    return {
        id: _id,
        name: 'Gastarid',
        level: _level,
        maxHealth: 7*_level,
        health: 7*_level,
        maxEnergy: 7*_level,
        energy: 7*_level,
        attackSpeed: 1,
        rechargeSpeed: 1.5,
        aggroRange: 5,
        retreatRange: 50,
        attackRange: 2,
        inCombat: false,
        inAttackRange: false,
        respawnTime: 10, // in seconds
        xpReward: 25*_level,
        xpRewardVariance: 10*_level,
        transform: {
            pos: new Vector3(_pos).obj,
            rot: new Vector3(_rot).obj
        },
        inCombat: false,
        healDelta: 50,
        runSpeed: 3,
        lootTime: 120, // 2 minutes
        minDamage: 2*_level,
        maxDamage: 4*_level,
        hitRate: 0.75,
        // !! TODO
        // Create mob actions initializer
        actions: []
    }
}

const toxicA0zix = function(_level, _pos, _rot) {
    const _id = crypto.randomBytes(5).toString('hex');
    _rot.y = Math.random() * 360;
    
    return {
        id: _id,
        name: 'Toxic A-0 Zix',
        level: _level,
        maxHealth: 10*_level,
        health: 10*_level,
        maxEnergy: 10*_level,
        energy: 10*_level,
        attackSpeed: 1,
        rechargeSpeed: 1.5,
        aggroRange: 15,
        retreatRange: 50,
        attackRange: 2,
        inCombat: false,
        inAttackRange: false,
        respawnTime: 120, // in seconds
        xpReward: 50*_level,
        xpRewardVariance: 10*_level,
        transform: {
            pos: new Vector3(_pos).obj,
            rot: new Vector3(_rot).obj
        },
        inCombat: false,
        healDelta: 50,
        runSpeed: 5,
        lootTime: 120, // 2 minutes
        minDamage: 2*_level,
        maxDamage: 4*_level,
        hitRate: 0.75,
        // !! TODO
        // Create mob actions initializer
        actions: []
    }
}

const enragedA0Zix = function(_level, _pos, _rot) {
    const _id = crypto.randomBytes(5).toString('hex');
    _rot.y = Math.random() * 360;
    
    return {
        id: _id,
        name: 'Enraged A-0 Zix',
        level: _level,
        maxHealth: 25*_level,
        health: 25*_level,
        maxEnergy: 25*_level,
        energy: 25*_level,
        attackSpeed: 1,
        rechargeSpeed: 1.5,
        aggroRange: 5,
        retreatRange: 30,
        attackRange: 2,
        inCombat: false,
        inAttackRange: false,
        respawnTime: 240, // in seconds
        xpReward: 150*_level,
        xpRewardVariance: 10*_level,
        transform: {
            pos: new Vector3(_pos).obj,
            rot: new Vector3(_rot).obj
        },
        inCombat: false,
        healDelta: 50,
        runSpeed: 5,
        lootTime: 120, // 2 minutes
        minDamage: 2*_level,
        maxDamage: 3*_level,
        hitRate: 0.9,
        // !! TODO
        // Create mob actions initializer
        actions: []
    }
}

const droid = function(_level, _pos, _rot) {
    const _id = crypto.randomBytes(5).toString('hex');
    _rot.y = Math.random() * 360;
    
    return {
        id: _id,
        name: 'Droid',
        level: _level,
        maxHealth: 40*_level,
        health: 40*_level,
        maxEnergy: 20*_level,
        energy: 20*_level,
        attackSpeed: 1,
        rechargeSpeed: 1.5,
        aggroRange: 8,
        retreatRange: 25,
        attackRange: 5,
        inCombat: false,
        inAttackRange: false,
        respawnTime: 5, // in seconds
        xpReward: 50*_level,
        xpRewardVariance: 10*_level,
        transform: {
            pos: new Vector3(_pos).obj,
            rot: new Vector3(_rot).obj
        },
        inCombat: false,
        healDelta: 50,
        runSpeed: 2,
        lootTime: 120, // 2 minutes
        minDamage: 0.01*_level,
        maxDamage: 0.01*_level,
        hitRate: 0.75,
        // !! TODO
        // Create mob actions initializer
        actions: []
    }
}

const enragedDroid = function(_level, _pos, _rot) {
    const _id = crypto.randomBytes(5).toString('hex');
    _rot.y = Math.random() * 360;
    
    return {
        id: _id,
        name: 'Sentient Droid',
        level: _level,
        maxHealth: 150*_level,
        health: 150*_level,
        maxEnergy: 50*_level,
        energy: 50*_level,
        attackSpeed: 1,
        rechargeSpeed: 1.5,
        aggroRange: 8,
        retreatRange: 50,
        attackRange: 10,
        inCombat: false,
        inAttackRange: false,
        respawnTime: 120, // in seconds
        xpReward: 75*_level,
        xpRewardVariance: 10*_level,
        transform: {
            pos: new Vector3(_pos).obj,
            rot: new Vector3(_rot).obj
        },
        inCombat: false,
        healDelta: 50,
        runSpeed: 5,
        lootTime: 120, // 2 minutes
        minDamage: 1*_level,
        maxDamage: 2*_level,
        hitRate: 0.9,
        // !! TODO
        // Create mob actions initializer
        actions: []
    }
}

module.exports = {
    a0zix,
    enragedA0Zix,
    toxicA0zix,
    droid,
    enragedDroid,
    gastarias,
    gastarid
}